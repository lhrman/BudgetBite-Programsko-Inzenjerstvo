import React, { useState } from "react";
import { MdEdit, MdSave, MdCancel, MdCameraAlt } from "react-icons/md";
import "./ProfileSection.css";

function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Marko Horvat",
    email: "marko.horvat@example.com",
    bio: "Strastveni kuhar koji voli stvarati jednostavne i pristupačne recepte za studente. Fokusiram se na brza jela s ograničenim budžetom.",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
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

          {/* Bio */}
          <div className="info-group">
            <label className="info-label">Biografija</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleChange}
                rows="6"
                className="form-input"
                placeholder="Napiši nešto o sebi..."
              />
            ) : (
              <p className="info-value bio-text">{profileData.bio}</p>
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

      {/* Statistics Section */}
      <div className="profile-stats">
        <h2 className="stats-title">Statistika</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <p className="stat-number">12</p>
            <p className="stat-label">Ukupno recepata</p>
          </div>
          <div className="stat-box">
            <p className="stat-number">1,234</p>
            <p className="stat-label">Ukupno pregleda</p>
          </div>
          <div className="stat-box">
            <p className="stat-number">4.5</p>
            <p className="stat-label">Prosječna ocjena</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;