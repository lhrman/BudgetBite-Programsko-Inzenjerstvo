import React, { useEffect, useState } from "react";

const DEFAULT_PREFS = {
  reminders: true,
  mealSuggestions: true,
  challenges: true,
};

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
  try {
    const saved = localStorage.getItem("notif_prefs");
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object") setPrefs(parsed);
    else localStorage.removeItem("notif_prefs");
  } catch (e) {
    console.error("Bad notif_prefs in localStorage:", e);
    localStorage.removeItem("notif_prefs");
  }
}, []);


  const update = (next) => {
    setPrefs(next);
    localStorage.setItem("notif_prefs", JSON.stringify(next));
  };

  return (
    <div className="form-section">
      <h2 className="form-section-title">In-app notifikacije</h2>

      <label>
        <input
          type="checkbox"
          checked={prefs.reminders}
          onChange={(e) => update({ ...prefs, reminders: e.target.checked })}
        />
        {" "}Podsjetnici
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={prefs.mealSuggestions}
          onChange={(e) => update({ ...prefs, mealSuggestions: e.target.checked })}
        />
        {" "}Prijedlozi obroka
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={prefs.challenges}
          onChange={(e) => update({ ...prefs, challenges: e.target.checked })}
        />
        {" "}Izazovi
      </label>
    </div>
  );
}
