import React, { useState } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { Api } from "../../services/api";
import "../../styles/global.css";
import "../../styles/student.css";

function StudentProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const handleSave = async () => {
    try {
      // Update only the name
      await Api.updateProfileName(newName);
      alert("Ime uspješno ažurirano!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update name:", err);
      alert("Greška pri ažuriranju imena.");
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("hr-HR", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="profile-section">
      <h1 className="profile-title">Moj Profil</h1>

      <div className="profile-card">
        <div className="profile-main-info">
          {/* Name */}
          <div className="info-group">
            <label className="info-label">Ime i prezime</label>
            {isEditing ? (
              <div className="edit-name-row">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                />
                <button onClick={handleSave} className="btn-icon-success">
                  <MdSave />
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-icon-danger">
                  <MdCancel />
                </button>
              </div>
            ) : (
              <div className="display-name-row">
                <p className="info-value">{user?.name || "—"}</p>
                <button onClick={() => setIsEditing(true)} className="btn-edit-small">
                  <MdEdit />
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="info-group">
            <label className="info-label">Email adresa</label>
            <p className="info-value">{user?.email || "—"}</p>
          </div>

          {/* Membership Date */}
          <div className="info-group">
            <label className="info-label">Član od</label>
            <p className="info-value">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
