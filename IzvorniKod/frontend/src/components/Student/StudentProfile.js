import React, { useState } from "react";
import { MdEdit, MdSave, MdCancel, MdCameraAlt } from "react-icons/md";


function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Ivan Horvat",
    email: "ivan.horvat@example.com",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
    weeklyBudget: 50.0,
    dietaryGoals: "Zdrava prehrana i više povrća",
    equipment: "Tava, air fryer, blender",
    allergies: "Kikiriki",
    dietaryRestrictions: "Vegetarijanac"
  });

  const [editData, setEditData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
    console.log("Profil spremljen:", editData);
    alert("Profil uspješno ažuriran!");
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <h1 className="profile-title">Moj profil</h1>
        {!isEditing && (
          <button onClick={handleEdit} className="button1">
            <MdEdit /> Uredi profil
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            <img 
              src={profileData.profileImage} 
              alt="Profilna slika" 
              className="profile-picture"
            />
            {isEditing && (
              <div className="picture-overlay">
                <MdCameraAlt className="camera-icon" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="picture-input"
                />
              </div>
            )}
          </div>
          <p className="picture-hint">
            {isEditing ? "Klikni na sliku za promjenu" : "Profilna slika"}
          </p>
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          {/* Name */}
          <div className="info-group">
            <label className="info-label">Ime i prezime</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="form-input"
              />
            ) : (
              <p className="info-value">{profileData.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="info-group">
            <label className="info-label">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                className="form-input"
              />
            ) : (
              <p className="info-value">{profileData.email}</p>
            )}
          </div>

          {/* Weekly Budget */}
          <div className="info-group">
            <label className="info-label">Tjedni budžet (eur)</label>
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
              <p className="info-value">{profileData.weeklyBudget.toFixed(2)} </p>
            )}
          </div>

          {/* Dietary Goals */}
          <div className="info-group">
            <label className="info-label">Prehrambeni ciljevi</label>
            {isEditing ? (
              <textarea
                name="dietaryGoals"
                value={editData.dietaryGoals}
                onChange={handleChange}
                className="form-input"
              />
            ) : (
              <p className="info-value">{profileData.dietaryGoals}</p>
            )}
          </div>

          {/* Equipment */}
          <div className="info-group">
            <label className="info-label">Dostupna kuhinjska oprema</label>
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
          <div className="info-group">
            <label className="info-label">Alergije</label>
            {isEditing ? (
              <input
                type="text"
                name="allergies"
                value={editData.allergies}
                onChange={handleChange}
                className="form-input"
                placeholder="npr. kikiriki, gluten"
              />
            ) : (
              <p className="info-value">{profileData.allergies}</p>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="info-group">
            <label className="info-label">Prehrambena ograničenja</label>
            {isEditing ? (
              <select
                name="dietaryRestrictions"
                value={editData.dietaryRestrictions}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Nema</option>
                <option value="Veganski">Vegan</option>
                <option value="Vegetarijanac">Vegetarijanac</option>
                <option value="Pescetarijanac">Pescetarijanac</option>
                <option value="Bez laktoze">Bez laktoze</option>
                <option value="Bez glutena">Bez glutena</option>
              </select>
            ) : (
              <p className="info-value">{profileData.dietaryRestrictions || "Nema"}</p>
            )}
          </div>

          {/* Action Buttons (when editing) */}
          {isEditing && (
            <div className="profile-actions">
              <button onClick={handleSave} className="button1">
                <MdSave /> Spremi promjene
              </button>
              <button onClick={handleCancel} className="button2">
                <MdCancel /> Odustani
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

export default StudentProfile;