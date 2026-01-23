import React, { useState, useEffect } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import api from "../../services/api";
import "../../styles/global.css";
import "../../styles/student.css";

function PrehrambeniUpitnik() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    weeklyBudget: "0.00",
    selectedAllergens: [],
    selectedRestrictions: [],
    selectedEquipment: [],
    selectedGoals: [],
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [budgetError, setBudgetError] = useState("");

  const [options, setOptions] = useState({
    allergens: [],
    restrictions: [],
    equipment: [],
    goals: [],
  });

  // --- Normalizacija (da radi i s goal_id/name i s cilj_id/cilj_name) ---
  const getId = (opt) =>
    opt?.allergen_id ??
    opt?.restriction_id ??
    opt?.equipment_id ??
    opt?.goal_id ??
    opt?.cilj_id;

  const getLabel = (opt) =>
    opt?.name ?? opt?.equipment_name ?? opt?.goal_name ?? opt?.cilj_name;

  const normalizeGoalsOptions = (goals = []) =>
    goals.map((g) => ({
      goal_id: g.goal_id ?? g.cilj_id,
      name: g.name ?? g.cilj_name ?? g.goal_name,
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Opcije
        const optRes = await api.get("/student/static-data");
        setOptions({
          allergens: optRes.data.allergens || [],
          restrictions: optRes.data.restrictions || [],
          equipment: optRes.data.equipment || [],
          // bitno: normaliziramo goals opcije
          goals: normalizeGoalsOptions(optRes.data.goals || []),
        });

        // 2) Profil
        const profRes = await api.get("/auth/profile");
        const u = profRes.data.user;

        if (u) {
          // goals mogu doći kao u.goals ili u.ciljevi; i polja mogu biti goal_id ili cilj_id
          const rawGoals = u.goals || u.ciljevi || [];

          const initialData = {
            weeklyBudget: u.weekly_budget
              ? Number(u.weekly_budget).toFixed(2)
              : "0.00",
            selectedAllergens: (u.allergens || []).map((a) => a.allergen_id),
            selectedRestrictions: (u.restrictions || []).map(
              (r) => r.restriction_id
            ),
            selectedEquipment: (u.equipment || []).map((e) => e.equipment_id),
            selectedGoals: (rawGoals || []).map((g) => g.goal_id ?? g.cilj_id),
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (Number(editData.weeklyBudget) < 15) {
      setBudgetError("Molimo vas povećajte tjedni budžet na min. 15 EUR.");
      return;
    }

    try {
      const budgetAsNumber = Number(Number(editData.weeklyBudget).toFixed(2));

      const payload = {
        weekly_budget: budgetAsNumber,
        allergens: editData.selectedAllergens,
        restrictions: editData.selectedRestrictions,
        equipment: editData.selectedEquipment,
        goals: editData.selectedGoals, // šaljemo ID-eve ciljeva
      };

      await api.post("/student/setup-profile", payload);

      setProfileData({ ...editData, weeklyBudget: budgetAsNumber.toFixed(2) });
      setIsEditing(false);
      setBudgetError("");

      alert("Upitnik uspješno spremljen!");
    } catch (err) {
      console.error(err);
      alert("Greška pri spremanju!");
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setBudgetError("");
  };

  const toggleSelection = (arrayName, id) => {
    const current = editData[arrayName] || [];

    if (current.includes(id)) {
      setEditData({
        ...editData,
        [arrayName]: current.filter((item) => item !== id),
      });
    } else {
      setEditData({
        ...editData,
        [arrayName]: [...current, id],
      });
    }
  };

  const renderChips = (arrayName, optionsList = []) => {
    return optionsList.map((opt) => {
      const id = getId(opt);
      const label = getLabel(opt);

      return (
        <button
          key={id}
          type="button"
          className={`chip ${
            (editData[arrayName] || []).includes(id) ? "selected" : ""
          }`}
          onClick={() => toggleSelection(arrayName, id)}
        >
          {label}
        </button>
      );
    });
  };

  const renderSelectedNames = (arrayName, optionsList = []) => {
    const selectedIds = profileData[arrayName];
    if (!selectedIds || selectedIds.length === 0) {
      return <span className="empty-value">Nema</span>;
    }

    return optionsList
      .filter((opt) => selectedIds.includes(getId(opt)))
      .map((opt) => getLabel(opt))
      .join(", ");
  };

  if (loading) {
    return <div className="p-4 text-center">Učitavanje upitnika...</div>;
  }

  const EditableLabel = ({ children }) => (
  <>
    {children}
    {isEditing && <span className="edit-hint"> (klikni za odabir)</span>}
  </>
  );

  return (
    <div className="add-questionnaire-section p-4 max-w-3xl mx-auto">
      <div className="questionnaire-header">
        <h1 className="add-questionnaire-title">Prehrambeni upitnik</h1>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="button1 edit-btn"
          >
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
              <>
                <input
                  type="number"
                  step="0.01"
                  value={editData.weeklyBudget}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setEditData({ ...editData, weeklyBudget: value });

                      if (value && Number(value) < 15) {
                        setBudgetError(
                          "Molimo vas povećajte tjedni budžet na min. 15 EUR."
                        );
                      } else {
                        setBudgetError("");
                      }
                    }
                  }}
                  className="form-input"
                />
                {budgetError && <p className="error-message">{budgetError}</p>}
              </>
            ) : (
              <p className="info-value">
                {Number(profileData.weeklyBudget).toFixed(2)} €
              </p>
            )}
          </div>

          {/* Alergije */}
          <div className="form-group">
            <label className="form-label">
              <EditableLabel>Alergije</EditableLabel>
            </label>
            {isEditing ? (
              <div className="multi-select-chips">
                {renderChips("selectedAllergens", options.allergens)}
              </div>
            ) : (
              <p className="info-value">
                {renderSelectedNames("selectedAllergens", options.allergens)}
              </p>
            )}
          </div>

          {/* Restrikcije */}
          <div className="form-group">
            <label className="form-label">
              <EditableLabel>Prehrambene restrikcije</EditableLabel>
            </label>
            {isEditing ? (
              <div className="multi-select-chips">
                {renderChips("selectedRestrictions", options.restrictions)}
              </div>
            ) : (
              <p className="info-value">
                {renderSelectedNames(
                  "selectedRestrictions",
                  options.restrictions
                )}
              </p>
            )}
          </div>

          {/* Oprema */}
          <div className="form-group">
            <label className="form-label">
              <EditableLabel>Dostupna oprema</EditableLabel>
            </label>
            {isEditing ? (
              <div className="multi-select-chips">
                {renderChips("selectedEquipment", options.equipment)}
              </div>
            ) : (
              <p className="info-value">
                {renderSelectedNames("selectedEquipment", options.equipment)}
              </p>
            )}
          </div>

          {/* Prehrambeni ciljevi */}
          <div className="form-group">
            <label className="form-label">
              <EditableLabel>Prehrambeni ciljevi</EditableLabel>
            </label>
            {isEditing ? (
              <div className="multi-select-chips">
                {renderChips("selectedGoals", options.goals)}
              </div>
            ) : (
              <p className="info-value">
                {renderSelectedNames("selectedGoals", options.goals)}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="form-actions mt-4">
              <button type="submit" className="button1">
                <MdSave className="icon" /> Spremi
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
