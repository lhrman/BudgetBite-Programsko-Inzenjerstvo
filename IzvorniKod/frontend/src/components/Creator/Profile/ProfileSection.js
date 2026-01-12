import React, { useState, useEffect } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import { Api } from "../../../services/api";
import "../../../styles/creator.css";

function ProfileSection() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    recipeCount: 0,
    avgRating: 0
  });
  
  const [newName, setNewName] = useState(user?.name || "");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await Api.getCreatorStats();
        setStats({
          recipeCount: data.recipeCount || 0,
          avgRating: data.avgRating || 0
        });
      } catch (err) {
        console.error("Failed to fetch creator stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleSave = async () => {
    try {
      await Api.updateProfileName(newName);
      alert("Ime uspješno ažurirano!");
      setIsEditing(false);
      // In a real app, we would update the user context here
    } catch (err) {
      console.error("Failed to update name:", err);
      alert("Greška pri ažuriranju imena.");
    }
  };

  const formattedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })
    : "Siječanj 2024.";

  return (
    <div className="profile-section">
      <h1 className="profile-title">Moj Profil</h1>
      
      <div className="profile-card">
        <div className="profile-main-info">
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
                <p className="info-value">{user?.name || "Ivan Kreator"}</p>
                <button onClick={() => setIsEditing(true)} className="btn-edit-small">
                  <MdEdit />
                </button>
              </div>
            )}
          </div>

          <div className="info-group">
            <label className="info-label">Email adresa</label>
            <p className="info-value">{user?.email || "ivan@kreator.hr"}</p>
          </div>

          <div className="info-group">
            <label className="info-label">Član od</label>
            <p className="info-value">{formattedDate}</p>
          </div>
        </div>

        <div className="profile-stats-divider"></div>

        <div className="profile-stats-row">
          <div className="profile-stat-item">
            <span className="stat-value">{stats.recipeCount}</span>
            <span className="stat-name">Recepata</span>
          </div>
          <div className="profile-stat-item">
            <span className="stat-value">{stats.avgRating || "0.0"}</span>
            <span className="stat-name">Prosječna ocjena</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;
