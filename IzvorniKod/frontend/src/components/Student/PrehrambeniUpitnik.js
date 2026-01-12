import React, { useState, useEffect } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import api from "../../services/api"; // Putanja do tvog axios servisa
import "../../styles/PrehrambeniUpitnik.css";
import "../../styles/global.css";

function PrehrambeniUpitnik() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Podaci koji se prikazuju i šalju
  const [profileData, setProfileData] = useState({
    weeklyBudget: 0,
    dietaryGoals: "",
    selectedAllergen: "", // Sprema ID
    selectedRestriction: "", // Sprema ID
    selectedEquipment: "" // Sprema ID
  });

  const [editData, setEditData] = useState({ ...profileData });

  // Opcije koje dolaze iz baze
  const [options, setOptions] = useState({
    allergens: [],
    equipment: [],
    restrictions: []
  });

  // 1. Učitavanje podataka s backenda
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Dohvati opcije za select liste
        const optRes = await api.get("/student/static-data");
        setOptions(optRes.data);

        // Dohvati trenutni profil ulogiranog studenta
        const profRes = await api.get("/auth/profile");
        const u = profRes.data.user;

        if (u) {
          const initialData = {
            weeklyBudget: Number(u.weekly_budget) || 0,
            dietaryGoals: u.goals || "",
            selectedAllergen: "", 
            selectedRestriction: "",
            selectedEquipment: ""
          };
          setProfileData(initialData);
          setEditData(initialData);
        }
      } catch (err) {
        console.error("Greška pri učitavanju:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // 2. SPREMANJE NA BACKEND
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Osiguravamo da je budget broj prije slanja i spremanja u state
      const budgetAsNumber = parseFloat(editData.weeklyBudget) || 0;

      const payload = {
        weekly_budget: budgetAsNumber,
        goals: editData.dietaryGoals,
        // Šaljemo nizove ID-ova kako backend očekuje
        allergens: editData.selectedAllergen ? [parseInt(editData.selectedAllergen)] : [],
        restrictions: editData.selectedRestriction ? [parseInt(editData.selectedRestriction)] : [],
        equipment: editData.selectedEquipment ? [parseInt(editData.selectedEquipment)] : []
      };

      await api.post("/student/setup-profile", payload);
      
      // Ažuriramo profileData s novim brojem kako .toFixed(2) ne bi pukao
      setProfileData({ ...editData, weeklyBudget: budgetAsNumber });
      setIsEditing(false);
      alert("Upitnik uspješno spremljen u bazu!");
    } catch (err) {
      console.error(err);
      alert("Greška pri spremanju!");
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  if (loading) return <div className="p-4 text-center">Učitavanje upitnika...</div>;

  return (
    <div className="add-questionnaire-section p-4 max-w-3xl mx-auto">
      <div className="questionnaire-header">
        <h1 className="add-questionnaire-title">Prehrambeni upitnik</h1>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="button1 edit-btn">
            <MdEdit className="icon" /> Uredi upitnik
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="questionnaire-form">
        <div className="form-section">
          
          {/* Tjedni budžet */}
          <div className="form-group">
            <label className="form-label">Tjedni budžet (EUR)</label>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                name="weeklyBudget"
                value={editData.weeklyBudget}
                onChange={handleChange}
                className="form-input"
              />
            ) : (
              /* Popravak: Number() osigurava da je vrijednost broj prije pozivanja toFixed */
              <p className="info-value">
                {Number(profileData.weeklyBudget || 0).toFixed(2)} €
              </p>
            )}
          </div>

          {/* Ciljevi */}
          <div className="form-group">
            <label className="form-label">Prehrambeni ciljevi</label>
            {isEditing ? (
              <textarea
                name="dietaryGoals"
                value={editData.dietaryGoals}
                onChange={handleChange}
                className="form-input"
              />
            ) : (
              <p className="info-value">{profileData.dietaryGoals || "Nije uneseno"}</p>
            )}
          </div>

          {/* Alergije */}
          <div className="form-group">
            <label className="form-label">Glavna alergija</label>
            {isEditing ? (
              <select
                name="selectedAllergen"
                value={editData.selectedAllergen}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Nema / Odaberi...</option>
                {options.allergens.map(a => (
                  <option key={a.allergen_id} value={a.allergen_id}>{a.name}</option>
                ))}
              </select>
            ) : (
              <p className="info-value">
                {options.allergens.find(a => a.allergen_id == profileData.selectedAllergen)?.name || "Nema"}
              </p>
            )}
          </div>

          {/* Oprema */}
          <div className="form-group">
            <label className="form-label">Dostupna oprema</label>
            {isEditing ? (
              <select
                name="selectedEquipment"
                value={editData.selectedEquipment}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Odaberi...</option>
                {options.equipment.map(e => (
                  <option key={e.equipment_id} value={e.equipment_id}>{e.equipment_name}</option>
                ))}
              </select>
            ) : (
              <p className="info-value">
                {options.equipment.find(e => e.equipment_id == profileData.selectedEquipment)?.equipment_name || "Nije odabrano"}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="form-actions mt-4">
              <button type="submit" className="button1">
                <MdSave className="icon" /> Spremi u bazu
              </button>
              <button type="button" onClick={handleCancel} className="button2">
                <MdCancel className="icon" /> Odustani
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default PrehrambeniUpitnik;