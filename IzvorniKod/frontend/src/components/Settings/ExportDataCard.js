import React, { useState } from "react";

function ExportDataCard({ user }) {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");

  // Odredi trenutnu ulogu
  const getCurrentRole = () => {
    if (user.is_student) return "student";
    if (user.is_creator) return "creator";
    if (user.is_admin) return "admin";
    return "user";
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMessage("");

    try {
      // TODO: Odkomentirati kad backend bude spreman
      /*
      const response = await fetch(`/api/user/data/export?user_id=${user.user_id}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      */

      // Mock data za testiranje
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: getCurrentRole(),
        created_at: user.created_at || new Date().toISOString(),
        exported_at: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { 
        type: "application/json" 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `moji_podaci_${user.user_id}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage("✅ Podaci uspješno preuzeti!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to export data:", error);
      setMessage("❌ Greška pri preuzimanju podataka.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="settings-card">
      <h2 className="card-title">📥 Izvoz podataka (GDPR)</h2>
      
      <p className="card-description">
        Preuzmi sve svoje osobne podatke pohranjene u sustavu u JSON formatu. 
        Ovo uključuje tvoje osnovne informacije.
      </p>

      {message && (
        <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <div className="card-actions">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-primary"
        >
          {isExporting ? "Preuzimanje..." : "📥 Preuzmi moje podatke"}
        </button>
      </div>
    </div>
  );
}

export default ExportDataCard;