import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function EditProfileCard() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("Ime ne može biti prazno!");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      // TODO: Odkomentirati kad backend bude spreman
      /*
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          name,
          user_id: user.user_id 
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }
      */

      // Mock delay za testiranje
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update AuthContext - reflektira se svugdje (Profile, Settings...)
      updateUser({ ...user, name });
      
      setMessage("Ime uspješno ažurirano!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update name:", error);
      setMessage("Greška pri spremanju!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-card">
      <h2 className="card-title">📝 Osobni podaci</h2>
      
      <div className="form-group">
        <label htmlFor="name">Ime i prezime</label>
        {isEditing ? (
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="settings-input"
            placeholder="Unesite ime i prezime"
          />
        ) : (
          <div className="display-value">{user?.name}</div>
        )}
      </div>

      <div className="form-group">
        <label>Email adresa</label>
        <div className="display-value email-display">{user?.email}</div>
        <small className="form-hint">Email se ne može promijeniti</small>
      </div>

      {message && (
        <div className={`message ${message.includes("uspješno") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <div className="card-actions">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? "Spremanje..." : "Spremi promjene"}
            </button>
            <button
              onClick={() => {
                setName(user?.name || "");
                setIsEditing(false);
                setMessage("");
              }}
              disabled={isSaving}
              className="btn btn-secondary"
            >
              Odustani
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
          >
            Uredi
          </button>
        )}
      </div>
    </div>
  );
}

export default EditProfileCard;