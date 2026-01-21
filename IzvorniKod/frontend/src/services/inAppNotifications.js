import { toast } from "react-toastify";

export function getNotifPrefs() {
  try {
    return JSON.parse(localStorage.getItem("notif_prefs")) || {
      reminders: true,
      mealSuggestions: true,
      challenges: true,
    };
  } catch {
    return { reminders: true, mealSuggestions: true, challenges: true };
  }
}

export function notify(type, message, options = {}) {
  const prefs = getNotifPrefs();

  // poštuj postavke
  if (type === "reminder" && !prefs.reminders) return;
  if (type === "suggestion" && !prefs.mealSuggestions) return;
  if (type === "challenge" && !prefs.challenges) return;

  // prikaz
  toast(message, options);
}
