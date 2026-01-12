import React, { useState, useEffect } from "react";
import { MdAdd, MdRemoveCircle, MdCheck } from "react-icons/md";
import { Api } from "../../../services/api";
import { toCreateRecipePayload } from "../../../services/adapters";
import "../../../styles/creator.css";

function AddRecipeSection() {
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    price: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    imageUrl: "",
    videoUrl: "",
  });

  const [ingredients, setIngredients] = useState([{ id: "", name: "", quantity: "", unit: "" }]);
  const [steps, setSteps] = useState([""]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Lookup Data on Mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [ingData, eqData, algData] = await Promise.all([
          Api.getIngredients(),
          Api.getEquipment(),
          Api.getAllergens()
        ]);
        setAvailableIngredients(ingData || []);
        setAvailableEquipment(eqData || []);
        setAvailableAllergens(algData || []);
      } catch (err) {
        console.error("Failed to load lookups:", err);
      } finally {
        setIsLoadingLookups(false);
      }
    };
    loadLookups();
  }, []);

  // Handle Basic Inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ingredients Logic
  const addIngredient = () => {
    setIngredients([...ingredients, { id: "", name: "", quantity: "", unit: "" }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, id) => {
    const selected = availableIngredients.find(i => String(i.ingredient_id) === String(id));
    const newIngredients = [...ingredients];
    
    if (selected) {
      newIngredients[index] = {
        ...newIngredients[index],
        id: selected.ingredient_id,
        name: selected.name,
        unit: selected.default_unit || "kom" // Auto-unit from DB
      };
    } else {
      newIngredients[index] = { id: "", name: "", quantity: "", unit: "" };
    }
    setIngredients(newIngredients);
  };

  const handleQtyChange = (index, qty) => {
    const newIngredients = [...ingredients];
    newIngredients[index].quantity = qty;
    setIngredients(newIngredients);
  };

  // Steps Logic
  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  // Toggle Selection (Pills)
  const toggleEquipment = (id) => {
    setSelectedEquipmentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllergen = (id) => {
    setSelectedAllergenIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (ingredients.some(i => !i.id || !i.quantity)) {
      alert("Molimo unesite sve sastojke i količine.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = toCreateRecipePayload({
        ...formData,
        ingredients,
        steps,
        selectedEquipmentIds,
        selectedAllergenIds
      });
      
      await Api.createRecipe(payload);
      alert("Recept uspješno objavljen!");
      
      // Reset form
      setFormData({ title: "", description: "", prepTime: "", price: "", calories: "", protein: "", carbs: "", fat: "", imageUrl: "", videoUrl: "" });
      setIngredients([{ id: "", name: "", quantity: "", unit: "" }]);
      setSteps([""]);
      setSelectedEquipmentIds([]);
      setSelectedAllergenIds([]);
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("Greška pri spremanju recepta: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingLookups) {
    return <div className="p-8 text-center">Učitavanje podataka...</div>;
  }

  return (
    <div className="add-recipe-section">
      <h1 className="add-recipe-title">Objavi novi recept</h1>

      <form onSubmit={handleSubmit} className="recipe-form">
        
        {/* CARD A: Osnovne informacije */}
        <div className="form-section">
          <h2 className="form-section-title">Osnovne informacije</h2>
          
          <div className="form-group">
            <label className="form-label">Naslov recepta *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="npr. Brza Pasta Carbonara"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opis</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Kratki opis recepta..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vrijeme (min) *</label>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                className="form-input"
                placeholder="30"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cijena (€) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                placeholder="5.00"
                required
              />
            </div>
          </div>

          <label className="form-label" style={{ marginTop: "24px", display: "block" }}>
            Nutritivne vrijednosti (po porciji)
          </label>
          
          <div className="nutrition-grid">
            <div className="form-group">
              <small className="form-label">Kalorije</small>
              <input type="number" name="calories" value={formData.calories} onChange={handleInputChange} className="form-input" placeholder="kcal" />
            </div>
            <div className="form-group">
              <small className="form-label">Proteini (g)</small>
              <input type="number" name="protein" value={formData.protein} onChange={handleInputChange} className="form-input" placeholder="g" />
            </div>
            <div className="form-group">
              <small className="form-label">Ugljikohidrati (g)</small>
              <input type="number" name="carbs" value={formData.carbs} onChange={handleInputChange} className="form-input" placeholder="g" />
            </div>
            <div className="form-group">
              <small className="form-label">Masti (g)</small>
              <input type="number" name="fat" value={formData.fat} onChange={handleInputChange} className="form-input" placeholder="g" />
            </div>
          </div>
        </div>

        {/* CARD B: Popis sastojaka */}
        <div className="form-section">
          <h2 className="form-section-title">Popis sastojaka</h2>
          {ingredients.map((ing, index) => (
            <div key={index} className="ingredient-row">
              <select 
                className="form-input"
                value={ing.id}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                required
              >
                <option value="">Odaberi sastojak...</option>
                {availableIngredients.map(m => (
                  <option key={m.ingredient_id} value={m.ingredient_id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Količina"
                className="form-input"
                value={ing.quantity}
                onChange={(e) => handleQtyChange(index, e.target.value)}
                required
              />
              <input
                className="form-input"
                value={ing.unit || ""}
                readOnly
                placeholder="Jedinica"
                style={{ backgroundColor: "#e5e7eb", cursor: "not-allowed" }}
              />
              {ingredients.length > 1 && (
                <button type="button" className="btn-icon-only" onClick={() => removeIngredient(index)}>
                  <MdRemoveCircle />
                </button>
              )}
            </div>
          ))}
          <div className="add-btn-row">
            <button type="button" className="button2" onClick={addIngredient} style={{ maxWidth: "200px" }}>
              <MdAdd /> Dodaj sastojak
            </button>
          </div>
        </div>

        {/* CARD C: Oprema i Alergeni */}
        <div className="form-section">
          <h2 className="form-section-title">Potrebna oprema i Alergeni</h2>
          
          <div className="form-group">
            <label className="form-label">Kuhinjska oprema (klikni za odabir)</label>
            <div className="tag-cloud">
              {availableEquipment.map(item => (
                <div 
                  key={item.equipment_id} 
                  className={`pill ${selectedEquipmentIds.includes(item.equipment_id) ? "selected" : ""}`}
                  onClick={() => toggleEquipment(item.equipment_id)}
                >
                  {selectedEquipmentIds.includes(item.equipment_id) && <MdCheck />} {item.equipment_name}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "24px" }}>
            <label className="form-label">Alergeni u ovom receptu</label>
            <div className="tag-cloud">
              {availableAllergens.map(item => (
                <div 
                  key={item.allergen_id} 
                  className={`pill ${selectedAllergenIds.includes(item.allergen_id) ? "selected" : ""}`}
                  onClick={() => toggleAllergen(item.allergen_id)}
                >
                  {selectedAllergenIds.includes(item.allergen_id) && <MdCheck />} {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD D: Koraci pripreme */}
        <div className="form-section">
          <h2 className="form-section-title">Koraci pripreme</h2>
          
          <div className="form-group">
            <label className="form-label">Upute korak po korak</label>
            {steps.map((step, index) => (
              <div key={index} className="step-row">
                <div className="step-number">{index + 1}</div>
                <textarea
                  className="form-input"
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={`Korak ${index + 1}...`}
                  rows="3"
                />
                {steps.length > 1 && (
                  <button type="button" className="btn-icon-only" onClick={() => removeStep(index)} style={{ marginTop: "12px" }}>
                    <MdRemoveCircle />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="button2" onClick={addStep} style={{ maxWidth: "200px", marginTop: "8px" }}>
              <MdAdd /> Dodaj korak
            </button>
          </div>
        </div>

        {/* CARD E: Multimedija */}
        <div className="form-section">
          <h2 className="form-section-title">Multimedija</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">URL naslovne slike</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://images.com/food.jpg"
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL video tutorijala</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="button1" style={{ fontSize: "1.1rem", padding: "12px" }} disabled={submitting}>
            {submitting ? "Spremanje..." : <><MdCheck /> Objavi recept</>}
          </button>
          <button type="button" className="button2" onClick={() => alert("Skica spremljena!")} disabled={submitting}>
            Spremi skicu
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipeSection;
