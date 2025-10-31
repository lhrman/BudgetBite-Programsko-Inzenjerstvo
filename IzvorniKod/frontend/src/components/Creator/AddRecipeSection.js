import React, { useState } from "react";
import { MdUpload } from "react-icons/md";
import "./AddRecipeSection.css";

function AddRecipeSection() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    prepTime: "",
    price: "",
    equipment: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Recept poslan:", formData);
    // TODO: Povezati s API-jem
    alert("Recept uspješno dodan! (Ovo će biti povezano s backendom)");
  };

  const handleSaveDraft = () => {
    console.log("Spremljeno kao skica:", formData);
    alert("Recept spremljen kao skica!");
  };

  return (
    <div className="add-recipe-section">
      <h1 className="add-recipe-title">Dodaj novi recept</h1>
      
      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Basic Info */}
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
                className="form-input"
                placeholder="5.00"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kategorija</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Odaberi kategoriju</option>
              <option value="breakfast">Doručak</option>
              <option value="lunch">Ručak</option>
              <option value="dinner">Večera</option>
              <option value="snack">Užina</option>
              <option value="dessert">Desert</option>
            </select>
          </div>
        </div>

        {/* Ingredients & Instructions */}
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
              placeholder="Po jedan sastojak u svakom redu...&#10;200g špageta&#10;100g pancete&#10;2 jaja&#10;50g parmezana"
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

        {/* Media Upload */}
        <div className="form-section">
          <h2 className="form-section-title">Multimedija</h2>
          
          <div className="form-group">
            <label className="form-label">Slika recepta</label>
            <div className="file-upload">
              <MdUpload className="upload-icon" />
              <input
                type="file"
                accept="image/*"
                className="file-input"
              />
              <p className="upload-text">Klikni ili povuci sliku ovdje</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Video recept (opcionalno)</label>
            <div className="file-upload">
              <MdUpload className="upload-icon" />
              <input
                type="file"
                accept="video/*"
                className="file-input"
              />
              <p className="upload-text">Klikni ili povuci video ovdje</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="button1">
            Objavi recept
          </button>
          <button type="button" onClick={handleSaveDraft} className="button2">
            Spremi kao skicu
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipeSection;