import React, { useEffect, useState } from "react";
import { MdEdit, MdSave, MdCancel, MdCameraAlt } from "react-icons/md";
import "../../styles/global.css";
import { Api } from "../../services/api";

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  const [editData, setEditData] = useState(profileData);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    (async () => {
      try {
        const me = await Api.me(); // {name, email, profileImage?}
        setProfileData({
          name: me.name || "",
          email: me.email || "",
          profileImage: me.profileImage || "",
        });
        setEditData({
          name: me.name || "",
          email: me.email || "",
          profileImage: me.profileImage || "",
        });
      } catch (err) {
        // leave empty — no dummy data!
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      await Api.updateMe({
        name: editData.name,
        email: editData.email,
        profileImage: editData.profileImage,
      });

      setProfileData({ ...editData });
      setIsEditing(false);
      alert("Profil uspješno ažuriran!");
    } catch (err) {
      alert("Greška pri ažuriranju profila: " + err.message);
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
        {/* Profile Picture */}
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profilna slika"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture placeholder">
                Nema slike
              </div>
            )}

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

        {/* Profile Info */}
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
              <p className="info-value">{profileData.name || "—"}</p>
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
              <p className="info-value">{profileData.email || "—"}</p>
            )}
          </div>

          {/* Action Buttons */}
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
