import React from "react";

function DeleteAccountCard({ onDelete }) {
  return (
    <div className="settings-card danger-zone">
      <h2 className="card-title">⚠️ Opasna zona</h2>
      
      <p className="card-description danger-text">
        <strong>Pažnja:</strong> Brisanje računa je <strong>trajno i nepovratno</strong>. 
        Svi tvoji podaci bit će trajno obrisani iz sustava.
      </p>

      <div className="card-actions">
        <button
          onClick={onDelete}
          className="btn btn-danger"
        >
          🗑️ Obriši račun
        </button>
      </div>
    </div>
  );
}

export default DeleteAccountCard;