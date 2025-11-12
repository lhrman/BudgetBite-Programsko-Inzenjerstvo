// src/services/api.js
import axios from "axios";

// Zadrži default export instancu (back-compat s tvojim starim kodom)
const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;

// Named API metode koje ćeš koristit u komponentama
export const Api = {
  // Profil (email je readonly iz OAuth-a; ime se može mijenjati)
  me: () => api.get("/me").then(r => r.data),
  updateMe: (data) => api.patch("/me", data).then(r => r.data),

  // Recepti kreatora – backend iz sessiona zna tko si (ne šalješ user_id)
  listCreatorRecipes: () => api.get("/my/recipes").then(r => r.data),
  getRecipe: (id) => api.get(`/recipes/${id}`).then(r => r.data),
  createRecipe: (payload) => api.post("/recipes", payload).then(r => r.data),
};

// (Opcionalno) Mock fallback kad backend nije spreman
export async function mockListCreatorRecipes() {
  const res = await fetch("/mock/creator-recipes.json");
  return res.json();
}
