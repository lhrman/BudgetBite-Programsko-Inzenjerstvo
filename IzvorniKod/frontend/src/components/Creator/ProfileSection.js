// src/components/Creator/ProfileSection.js
import React, { useEffect, useState } from "react";
import { MdEdit, MdSave, MdCancel, MdCameraAlt } from "react-icons/md";
import "./ProfileSection.css";
import { Api } from "../../services/api";

function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    profileImage:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
  });
  const [editData, setEditData] = useState(profileData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await Api.me(); // { user_id, name, email, role }
        setProfileData({
          name: me.name || "",
          email: me.email || "",
          profileImage:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
        });
        setEditData({
          name: me.name || "",
          email: me.email || "",
          profileImage:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
        });
      } catch {
        // ok – ostavi defaulte ako endpoint nije spreman
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      await Api.updateMe({ name: editData.name });
      setProfileData({
        ...profileData,
        name: editData.name,
        profileImage: editData.profileImage,
      });
      setIsEditing(false);
      alert("Profil uspješno ažuriran!");
    } catch (e) {
      alert("Greška pri ažuriranju profila: " + e.message);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  if (loading) return <p>Učitavanje profila…</p>;

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
        {/* Profilna slika */}
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setEditData((prev) => ({
                        ...prev,
                        profileImage: url,
                      }));
                    }
                  }}
                />
              </div>
            )}
          </div>
          <p className="picture-hint">
            {isEditing ? "Klikni na sliku za promjenu" : "Profilna slika"}
          </p>
        </div>

        {/* Osnovne informacije */}
        <div className="profile-info-section">
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
              <p className="info-value">{profileData.name || "—"}</p>
            )}
          </div>

          <div className="info-group">
            <label className="info-label">Email</label>
            <p className="info-value">{profileData.email || "—"}</p>
          </div>

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

      {/* Statistika */}
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
