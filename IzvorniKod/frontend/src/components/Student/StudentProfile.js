import React, { useState, useEffect } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { Api } from "../../services/api";
import "../../styles/global.css";
import "../../styles/student.css";

function StudentProfile() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // =========================
  // PROFIL – promjena imena
  // =========================
  const handleSave = async () => {
    try {
      await Api.updateProfileName(newName);
      alert("Ime uspješno ažurirano!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update name:", err);
      alert("Greška pri ažuriranju imena.");
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("hr-HR", {
        month: "long",
        year: "numeric",
      })
    : "—";

  // =========================
  // GOOGLE CALENDAR
  // =========================
  const fetchCalendarStatus = async () => {
    try {
      const res = await Api.calendarStatus();
      setCalendarConnected(res.connected);
      setGoogleEmail(res.google_email);
    } catch (err) {
      console.error("Calendar status error:", err);
    }
  };

  useEffect(() => {
    fetchCalendarStatus();
  }, []);

  const handleConnectCalendar = async () => {
    try {
      setLoadingCalendar(true);
      const { url } = await Api.calendarConnect();
      window.location.href = url; // redirect na Google consent
    } catch (err) {
      console.error(err);
      alert("Greška pri povezivanju s Google Calendarom.");
      setLoadingCalendar(false);
    }
  };

  const handleSyncCalendar = async () => {
    try {
      setLoadingCalendar(true);
      await Api.calendarSync();
      alert("Meal plan je uspješno sinkroniziran s Google Calendarom ✅");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Greška pri sinkronizaciji s Google Calendarom."
      );
    } finally {
      setLoadingCalendar(false);
    }
  };

  return (
    <div className="profile-section">
      <h1 className="profile-title">Moj Profil</h1>

      {/* ================= PROFIL ================= */}
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
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-icon-danger"
                >
                  <MdCancel />
                </button>
              </div>
            ) : (
              <div className="display-name-row">
                <p className="info-value">{user?.name || "—"}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-edit-small"
                >
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

      {/* ================= GOOGLE CALENDAR ================= */}
      <div className="profile-card" style={{ marginTop: 20 }}>
        <div className="info-group">
          <label className="info-label">Google Calendar</label>

          {calendarConnected ? (
            <p className="info-value">
              Povezano s: <strong>{googleEmail || "Google račun"}</strong>
            </p>
          ) : (
            <p className="info-value">
              Google Calendar još nije povezan.
            </p>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
            {!calendarConnected && (
              <button
                className="btn"
                onClick={handleConnectCalendar}
                disabled={loadingCalendar}
              >
                {loadingCalendar ? "Povezivanje..." : "Connect Google Calendar"}
              </button>
            )}

            {calendarConnected && (
              <button
                className="btn"
                onClick={handleSyncCalendar}
                disabled={loadingCalendar}
              >
                {loadingCalendar ? "Sinkronizacija..." : "Sync Meal Plan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
