import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function DeleteAccountModal({ onClose, onConfirm }) {
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  if (confirmText !== "OBRIŠI") return;

  setIsDeleting(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Nema tokena (korisnik nije prijavljen).");

    const response = await fetch("http://localhost:3002/api/gdpr/me", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Ako želiš prikazati poruku s backenda:
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "API request failed");
    }

    onConfirm?.();
    logout();      // očisti auth state + redirect
    onClose?.();   // zatvori modal (opcionalno)
  } catch (error) {
    console.error("Failed to delete account:", error);
    alert(error.message || "Greška pri brisanju računa!");
    setIsDeleting(false);
  }
};


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚠️ Potvrda brisanja računa</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-warning">
            <strong>Ova akcija je trajna i nepovratna!</strong>
          </p>
          <p>
            Svi tvoji podaci bit će trajno obrisani:
          </p>
          <ul className="delete-list">
            <li>Osobni podaci</li>
            <li>Postavke računa</li>
            <li>Povijest aktivnosti</li>
          </ul>
          <p>
            Za potvrdu, upiši <strong>OBRIŠI</strong> u polje ispod:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Upiši: OBRIŠI"
            className="confirm-input"
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-secondary"
          >
            Odustani
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== "OBRIŠI" || isDeleting}
            className="btn btn-danger"
          >
            {isDeleting ? "Brisanje..." : "Obriši račun"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;