// src/components/Creator/AddRecipeSection.js
import React, { useState } from "react";
import "./AddRecipeSection.css";
import { Api } from "../../services/api";
import { toCreateRecipePayload } from "../../services/adapters";

function AddRecipeSection() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    prepTime: "",
    price: "",
    equipment: "",
    imageUrl: "",
    videoUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // mala front validacija (opcionalno, ali korisno)
    if (Number(formData.prepTime) <= 0 || Number.isNaN(Number(formData.prepTime))) {
      alert("Vrijeme pripreme mora biti broj veći od 0.");
      return;
    }
    if (Number(formData.price) < 0 || Number.isNaN(Number(formData.price))) {
      alert("Cijena mora biti nenegativan broj.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = toCreateRecipePayload({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        ingredients: formData.ingredients.trim(),
        instructions: formData.instructions.trim(),
        equipment: formData.equipment.trim(),
        imageUrl: formData.imageUrl.trim(),
        videoUrl: formData.videoUrl.trim(),
      });
      await Api.createRecipe(payload);
      alert("Recept uspješno dodan!");

      setFormData({
        title: "",
        description: "",
        ingredients: "",
        instructions: "",
        prepTime: "",
        price: "",
        equipment: "",
        imageUrl: "",
        videoUrl: "",
      });
    } catch (err) {
      alert("Greška pri spremanju: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("bb_draft_recipe", JSON.stringify(formData));
    alert("Recept spremljen kao skica (lokalno).");
  };

  return (
    <div className="add-recipe-section">
      <h1 className="add-recipe-title">Dodaj novi recept</h1>

      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Osnovne informacije */}
        <div className="form-section">
          <h2 className="form-section-title">Osnovne informacije</h2>

          <div className="form-group">
            <label className="form-label">Naslov recepta *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
              onChange={handleChange}
              rows="3"
              className="form-input"
              placeholder="Kratki opis recepta..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vrijeme pripreme (minute) *</label>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                className="form-input"
                placeholder="30"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cijena (€) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="form-input"
                placeholder="5.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Sastojci i upute */}
        <div className="form-section">
          <h2 className="form-section-title">Sastojci i upute</h2>

          <div className="form-group">
            <label className="form-label">Sastojci *</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows="6"
              className="form-input"
              placeholder={"Po jedan sastojak u svakom redu...\n200 g špageta\n100 g pancete\n2 jaja\n50 g parmezana"}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upute za pripremu *</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="8"
              className="form-input"
              placeholder="Detaljne upute korak po korak..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Potrebna oprema</label>
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              className="form-input"
              placeholder="npr. Tava, lonac, mikrovalna"
            />
          </div>
        </div>

        {/* Mediji (samo URL-ovi, bez uploada) */}
        <div className="form-section">
          <h2 className="form-section-title">Multimedija</h2>

          <div className="form-group">
            <label className="form-label">URL slike</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/img/moj-recept.jpg"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL videa (opcionalno)</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/video/recept.mp4"
            />
          </div>
        </div>

        {/* Gumbi */}
        <div className="form-actions">
          <button type="submit" className="button1" disabled={submitting}>
            {submitting ? "Spremam..." : "Objavi recept"}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="button2"
            disabled={submitting}
          >
            Spremi kao skicu
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipeSection;
