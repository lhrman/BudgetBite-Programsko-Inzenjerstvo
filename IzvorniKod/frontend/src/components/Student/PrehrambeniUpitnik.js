import React, { useState } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import "../../styles/PrehrambeniUpitnik.css";
import "../../styles/global.css";

function PrehrambeniUpitnik() {
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    weeklyBudget: 50.0,
    dietaryGoals: "Želim jesti uravnoteženo i zdravo.",
    equipment: "Tava, blender, mikrovalna",
    allergies: "Gluten",
    dietaryRestrictions: "Gluten free",
  });

  const [editData, setEditData] = useState({ ...profileData });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData({ ...editData });
    setIsEditing(false);
    alert("Upitnik spremljen!");
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="add-questionnaire-section p-4 max-w-3xl mx-auto">
      {/* Header with Title + Edit Button */}
      <div className="questionnaire-header">
        <h1 className="add-questionnaire-title">Prehrambeni upitnik</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="button1 edit-btn"
          >
            <MdEdit className="icon" />Uredi upitnik
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="questionnaire-form">
        <div className="form-section">
          {/* Weekly Budget */}
          <div className="form-group">
            <label className="form-label">Tjedni budžet (EUR)</label>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                name="weeklyBudget"
                value={editData.weeklyBudget}
                onChange={handleChange}
                className="form-input"
              />
            ) : (
              <p className="info-value">{profileData.weeklyBudget.toFixed(2)}</p>
            )}
          </div>

          {/* Dietary Goals */}
          <div className="form-group">
            <label className="form-label">Prehrambeni ciljevi</label>
            {isEditing ? (
              <textarea
                name="dietaryGoals"
                value={editData.dietaryGoals}
                onChange={handleChange}
                className="form-input"
                placeholder="Više proteina, kuhanje kod kuće..."
              />
            ) : (
              <p className="info-value">{profileData.dietaryGoals}</p>
            )}
          </div>

          {/* Equipment */}
          <div className="form-group">
            <label className="form-label">Dostupna kuhinjska oprema</label>
            {isEditing ? (
              <input
                type="text"
                name="equipment"
                value={editData.equipment}
                onChange={handleChange}
                className="form-input"
                placeholder="npr. tava, air fryer, blender"
              />
            ) : (
              <p className="info-value">{profileData.equipment}</p>
            )}
          </div>

          {/* Allergies */}
          <div className="form-group">
            <label className="form-label">Alergije</label>
            {isEditing ? (
              <select
                name="allergies"
                value={editData.allergies}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Nema</option>
                <option value="Gluten">Gluten</option>
                <option value="Laktoza">Laktoza</option>
                <option value="Jaja">Jaja</option>
                <option value="Soja">Soja</option>
                <option value="Kikiriki">Kikiriki</option>
                <option value="Orašasti plodovi">Orašasti plodovi</option>
                <option value="Riba">Riba</option>
                <option value="Školjke">Školjke</option>
              </select>
            ) : (
              <p className="info-value">{profileData.allergies || "Nema"}</p>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="form-group">
            <label className="form-label">Prehrambena ograničenja</label>
            {isEditing ? (
              <select
                name="dietaryRestrictions"
                value={editData.dietaryRestrictions}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Nema</option>
                <option value="Vegan">Vegan</option>
                <option value="Vegetarian">Vegetarijanac</option>
                <option value="Pescatarian">Pescetarijanac</option>
                <option value="Dairy free">Bez laktoze</option>
                <option value="Gluten free">Bez glutena</option>
                <option value="Low sugar">Bez šećera</option>
                <option value="Keto">Keto</option>
                <option value="High Protein">Visokoproteinska</option>
              </select>
            ) : (
              <p className="info-value">
                {profileData.dietaryRestrictions || "Nema"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="form-actions mt-4">
              <button type="submit" className="button1">
                <MdSave className="icon" /> Spremi
              </button>
              <button type="button" onClick={handleCancel} className="button2">
                <MdCancel className="icon" /> Odustani
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default PrehrambeniUpitnik;
