import React, { useState, useEffect, useRef } from "react";
import { MdAdd, MdRemoveCircle, MdCheck, MdSearch } from "react-icons/md";
import { Api } from "../../../services/api";
import { toCreateRecipePayload } from "../../../services/adapters";
import "../../../styles/creator.css";

function AddRecipeSection() {
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);
  const [availableDietaryRestrictions, setAvailableDietaryRestrictions] = useState([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [formData, setFormData] = useState({
  title: "",
  description: "",
  prepTime: "",
  price: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  imageFile: null,
  videoFile: null,
  });


  const [ingredients, setIngredients] = useState([{ 
    ingredient: null,
    quantity: "",
    unit: "g",
    searchQuery: "",
    searchResults: [],
    isDropdownOpen: false,
    isSearching: false
  }]);
  
  const [steps, setSteps] = useState([""]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState([]);
  const [selectedRestrictionIds, setSelectedRestrictionIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Modal state for adding new ingredient
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientCategory, setNewIngredientCategory] = useState("");
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(null);

  const dropdownRefs = useRef([]);
  const quantityInputRefs = useRef([]); // NOVO - ref za quantity inpute
  const searchTimeoutRef = useRef(null); // NOVO - ref za debounce

  // Fetch Lookup Data on Mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const data = await Api.getRecipeStaticData();

        //console.log("STATIC DATA:", data); // za provjeru

        setAvailableEquipment(data.equipment || []);
        setAvailableAllergens(data.allergens || []);
        setAvailableDietaryRestrictions(data.restrictions || []);
      } catch (err) {
        console.error("Failed to load recipe static data:", err);
      } finally {
        setIsLoadingLookups(false);
      }
    };

    loadLookups();
  }, []);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      dropdownRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          const newIngredients = [...ingredients];
          newIngredients[index].isDropdownOpen = false;
          setIngredients(newIngredients);
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ingredients]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle Basic Inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ingredients Autocomplete Logic with Debounce
  const handleIngredientSearch = async (index, query) => {
    const newIngredients = [...ingredients];
    newIngredients[index].searchQuery = query;
    newIngredients[index].isDropdownOpen = true;
    setIngredients(newIngredients);

    if (query.length < 2) {
      newIngredients[index].searchResults = [];
      newIngredients[index].isSearching = false;
      setIngredients(newIngredients);
      return;
    }

    newIngredients[index].isSearching = true;
    setIngredients(newIngredients);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce - wait 300ms before searching
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await Api.searchIngredients(query);
        const updatedIngredients = [...ingredients];
        updatedIngredients[index].searchResults = results || [];
        updatedIngredients[index].isSearching = false;
        setIngredients(updatedIngredients);
      } catch (error) {
        console.error("Search failed:", error);
        const updatedIngredients = [...ingredients];
        updatedIngredients[index].searchResults = [];
        updatedIngredients[index].isSearching = false;
        setIngredients(updatedIngredients);
      }
    }, 300);
  };

  const handleSelectIngredient = (index, ingredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index].ingredient = ingredient;
    newIngredients[index].searchQuery = ingredient.name;
    newIngredients[index].unit = ingredient.default_unit || "g";
    newIngredients[index].isDropdownOpen = false;
    setIngredients(newIngredients);

    // Focus on quantity input after selection
    setTimeout(() => {
      if (quantityInputRefs.current[index]) {
        quantityInputRefs.current[index].focus();
      }
    }, 100);
  };

  const handleAddNewIngredient = async () => {
    if (!newIngredientName.trim()) {
      alert("Molimo unesite naziv sastojka");
      return;
    }

    try {
      const newIngredient = await Api.createIngredient({
        name: newIngredientName,
        category: newIngredientCategory || "Ostalo"
      });
      
      handleSelectIngredient(currentIngredientIndex, newIngredient);
      setShowAddModal(false);
      setNewIngredientName("");
      setNewIngredientCategory("");
      
      // Focus on quantity input after adding new ingredient
      setTimeout(() => {
        if (quantityInputRefs.current[currentIngredientIndex]) {
          quantityInputRefs.current[currentIngredientIndex].focus();
        }
      }, 100);
      
      setCurrentIngredientIndex(null);
    } catch (error) {
      console.error("Failed to create ingredient:", error);
      alert("Greška pri dodavanju sastojka");
    }
  };

  const openAddIngredientModal = (index, query) => {
    setCurrentIngredientIndex(index);
    setNewIngredientName(query);
    setShowAddModal(true);
    
    const newIngredients = [...ingredients];
    newIngredients[index].isDropdownOpen = false;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { 
      ingredient: null,
      quantity: "",
      unit: "g",
      searchQuery: "",
      searchResults: [],
      isDropdownOpen: false,
      isSearching: false
    }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index, qty) => {
    const newIngredients = [...ingredients];
    newIngredients[index].quantity = qty;
    setIngredients(newIngredients);
  };

  const handleUnitChange = (index, unit) => {
    const newIngredients = [...ingredients];
    newIngredients[index].unit = unit;
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

  const toggleRestriction = (id) => {
    setSelectedRestrictionIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation - check ingredient, quantity AND unit
    if (ingredients.some(i => !i.ingredient || !i.quantity || !i.unit.trim())) {
      alert("Molimo unesite sve sastojke, količine i jedinice.");
      return;
    }

    try {
      setSubmitting(true);
      const formPayload = new FormData();

      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("prepTime", formData.prepTime);
      formPayload.append("price", formData.price);
      formPayload.append("calories", formData.calories);
      formPayload.append("protein", formData.protein);
      formPayload.append("carbs", formData.carbs);
      formPayload.append("fat", formData.fat);

      formPayload.append("ingredients", JSON.stringify(
        ingredients.map(i => ({
          id: i.ingredient.ingredient_id,
          quantity: i.quantity,
          unit: i.unit
        }))
      ));
      formPayload.append("steps", JSON.stringify(steps));
      formPayload.append("equipment", JSON.stringify(selectedEquipmentIds));
      formPayload.append("allergens", JSON.stringify(selectedAllergenIds));
      formPayload.append("restrictions", JSON.stringify(selectedRestrictionIds));

      if (formData.imageFile) {
        formPayload.append("image", formData.imageFile);
      }
      if (formData.videoFile) {
        formPayload.append("video", formData.videoFile);
      }
      await Api.createRecipe(formPayload, true);

      alert("Recept uspješno objavljen!");
      
      // Reset form
      setFormData({ title: "", description: "", prepTime: "", price: "", calories: "", protein: "", carbs: "", fat: "", imageUrl: "", videoUrl: "" });
      setIngredients([{ 
        ingredient: null,
        quantity: "",
        unit: "g",
        searchQuery: "",
        searchResults: [],
        isDropdownOpen: false,
        isSearching: false
      }]);
      setSteps([""]);
      setSelectedEquipmentIds([]);
      setSelectedAllergenIds([]);
      setSelectedRestrictionIds([]);
      setImageFile(null);
      setVideoFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";

      
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

  const removeImage = () => {
  setImageFile(null);

  if (imageInputRef.current) {
    imageInputRef.current.value = "";
  }
};

const removeVideo = () => {
  setVideoFile(null);

  if (videoInputRef.current) {
    videoInputRef.current.value = "";
  }
};


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
              {/* Autocomplete Input */}
              <div 
                className="ingredient-autocomplete" 
                ref={el => dropdownRefs.current[index] = el}
              >
                <div className="autocomplete-input-wrapper">
                  <MdSearch className="search-icon" />
                  <input
                    type="text"
                    className="form-input autocomplete-input"
                    placeholder="Počni tipkati naziv sastojka..."
                    value={ing.searchQuery}
                    onChange={(e) => handleIngredientSearch(index, e.target.value)}
                    onFocus={() => {
                      if (ing.searchQuery.length >= 2) {
                        const newIngredients = [...ingredients];
                        newIngredients[index].isDropdownOpen = true;
                        setIngredients(newIngredients);
                      }
                    }}
                    required
                  />
                </div>

                {ing.isDropdownOpen && ing.searchQuery.length >= 2 && (
                  <div className="autocomplete-dropdown">
                    {ing.isSearching ? (
                      <div className="autocomplete-item loading">Pretraživanje...</div>
                    ) : ing.searchResults.length > 0 ? (
                      <>
                        {ing.searchResults.map((ingredient) => (
                          <div
                            key={ingredient.ingredient_id}
                            className="autocomplete-item"
                            onClick={() => handleSelectIngredient(index, ingredient)}
                          >
                            <span className="ingredient-name">{ingredient.name}</span>
                            {ingredient.category && (
                              <span className="ingredient-category">({ingredient.category})</span>
                            )}
                          </div>
                        ))}
                        <div
                          className="autocomplete-item add-new"
                          onClick={() => openAddIngredientModal(index, ing.searchQuery)}
                        >
                          <MdAdd /> Dodaj novi sastojak "{ing.searchQuery}"
                        </div>
                      </>
                    ) : (
                      <div
                        className="autocomplete-item add-new"
                        onClick={() => openAddIngredientModal(index, ing.searchQuery)}
                      >
                        <MdAdd /> Dodaj novi sastojak "{ing.searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={el => quantityInputRefs.current[index] = el}
                type="number"
                placeholder="Količina"
                className="form-input"
                value={ing.quantity}
                onChange={(e) => handleQtyChange(index, e.target.value)}
                required
                style={{ maxWidth: "120px" }}
              />
              
              <select
                className="form-input"
                value={ing.unit}
                onChange={(e) => handleUnitChange(index, e.target.value)}
                style={{ maxWidth: "120px" }}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="dl">dl</option>
                <option value="kom">kom</option>
                <option value="žlica">žlica</option>
                <option value="žličica">žličica</option>
                <option value="šalica">šalica</option>
                <option value="prstohvat">prstohvat</option>
              </select>
              
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

        {/* CARD C: Oprema, Alergeni i Prehrambene restrikcije */}
        <div className="form-section">
          <h2 className="form-section-title">Oprema, Alergeni i Prehrambene restrikcije</h2>
          
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
            <label className="form-label">Alergeni (klikni za odabir)</label>
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

          <div className="form-group" style={{ marginTop: "24px" }}>
            <label className="form-label">Prehrambene restrikcije (klikni za odabir)</label>
            <div className="tag-cloud">
              {availableDietaryRestrictions.map(item => (
                <div 
                  key={item.restriction_id}
                  className={`pill ${selectedRestrictionIds.includes(item.restriction_id) ? "selected" : ""}`}
                  onClick={() => toggleRestriction(item.restriction_id)}
                >
                  {selectedRestrictionIds.includes(item.restriction_id) && <MdCheck />}
                  {item.name}
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
        <div className="form-row">
  <div className="form-group">
  <label className="form-label">Slika recepta</label>
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <input
  ref={imageInputRef}
  type="file"
  accept="image/*"
  onChange={(e) => setImageFile(e.target.files[0] || null)}
  className="form-input"
/>

    {imageFile && (
      <button
        type="button"
        className="btn-icon-only"
        onClick={() => setImageFile(null)}
        title="Ukloni sliku"
      >
        ✕
      </button>
    )}
  </div>
</div>


  <div className="form-group">
  <label className="form-label">Video recepta</label>
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <input
  ref={videoInputRef}
  type="file"
  accept="video/*"
  onChange={(e) => setVideoFile(e.target.files[0] || null)}
  className="form-input"
/>

    {videoFile && (
      <button
        type="button"
        className="btn-icon-only"
        onClick={() => setVideoFile(null)}
        title="Ukloni video"
      >
        ✕
      </button>
    )}
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

      {/* Modal for adding new ingredient */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Dodaj novi sastojak</h3>
            
            <div className="form-group">
              <label className="form-label">Naziv sastojka *</label>
              <input
                type="text"
                className="form-input"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategorija (opcionalno)</label>
              <input
                type="text"
                className="form-input"
                placeholder="npr. Meso, Povrće, Mliječni proizvodi..."
                value={newIngredientCategory}
                onChange={(e) => setNewIngredientCategory(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="button1" 
                onClick={handleAddNewIngredient}
              >
                <MdAdd /> Dodaj
              </button>
              <button 
                type="button" 
                className="button2" 
                onClick={() => setShowAddModal(false)}
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddRecipeSection;