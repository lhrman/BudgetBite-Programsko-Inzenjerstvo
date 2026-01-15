import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import EditProfileCard from "./EditProfileCard";
import ExportDataCard from "./ExportDataCard";
import DeleteAccountCard from "./DeleteAccountCard";
import DeleteAccountModal from "./DeleteAccountModal";
import "../../styles/settings.css";

function SettingsPage() {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return <div className="settings-loading">Učitavanje...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">Postavke računa</h1>

        <EditProfileCard />
        
        {/* ChangeRoleCard obrisana */}
        
        <ExportDataCard user={user} />
        
        <DeleteAccountCard onDelete={() => setShowDeleteModal(true)} />

        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => {
              console.log("Account deleted");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default SettingsPage;