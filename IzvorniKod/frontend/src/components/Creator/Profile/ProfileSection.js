import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Api } from "../../../services/api";
import "../../../styles/creator.css";

function ProfileSection() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    recipeCount: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await Api.getCreatorStats();
        setStats({
          recipeCount: data.recipeCount || 0,
          avgRating: data.avgRating || 0,
        });
      } catch (err) {
        console.error("Failed to fetch creator stats:", err);
      }
    };

    fetchStats();
  }, []);

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("hr-HR", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="profile-section">
      <h1 className="profile-title">Moj Profil</h1>

      <div className="profile-card">
        <div className="profile-main-info">
          {/* Name (read-only) */}
          <div className="info-group">
            <label className="info-label">Ime i prezime</label>
            <p className="info-value">{user?.name || "—"}</p>
          </div>

          {/* Email */}
          <div className="info-group">
            <label className="info-label">Email adresa</label>
            <p className="info-value">{user?.email || "—"}</p>
          </div>

          {/* Member since */}
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
