import axios from "axios";

// --- 1. Konfiguracija Axios Instance ---

const api = axios.create({
  baseURL: "http://localhost:3004/api",
  headers: { "Content-Type": "application/json" },
});

// --- 2. Axios Interceptor (za automatsko slanje tokena) ---
api.interceptors.request.use(
  (config) => {
    const token =
  sessionStorage.getItem("token") || localStorage.getItem("token");

    if (token) {
      // VVV OVDJE JE POPRAVAK SINTAKSE (dodani backticks ` `) VVV
      config.headers.Authorization = `Bearer ${token}`;
      // ^^^ KRAJ POPRAVKA SINTAKSE ^^^
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 3. AuthService (Glavne funkcije za Auth) ---

export const AuthService = {
  /**
   * Prijavljuje korisnika i sprema token.
   */
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  /**
   * Registrira korisnika i odmah ga prijavljuje (sprema token).
   */
  register: async (name, email, password) => {
    // Šaljemo lozinku, ali NE ulogu (prema backendu kolege)
    const response = await api.post("/auth/register", { name, email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  /**
   * Odjavljuje korisnika (briše token).
   */
  logout: () => {
    localStorage.removeItem("token");
  },

  /**
   * Postavlja ulogu (npr. nakon Google prijave) i sprema NOVI token.
   */
  setRole: async (role) => {
    const response = await api.patch("/auth/set-role", { new_role: role });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  /**
   * Provjerava postoji li token i dohvaća svježe podatke o korisniku.
   */
  getLoggedInUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }
    try {
      const response = await api.get("/auth/profile");
      return response.data.user;
    } catch (error) {
      localStorage.removeItem("token");
      return null;
    }
  },

  /**
   * Pomoćna funkcija za spremanje tokena nakon Google prijave.
   */
  handleGoogleLogin: (token) => {
    localStorage.setItem("token", token);
  }
};

// --- 4. Ostatak API-ja (za recepte, itd.) ---
// Ove funkcije će sada automatski biti AUTORIZIRANE

export const Api = {
  me: () => api.get("/auth/profile").then((r) => r.data),


  // ------- NOVI API-evi KOJE TREBA NAPRAVITI: -------------
  
  // --- Recipe Lookups ---
  // Ovi API-evi treba da fetchuju sve dostupne sastojke, opremu i alergene iz baze
  getIngredients: () => api.get("/ingredients").then((r) => r.data),
  searchIngredients: (query) => api.get(`/ingredients?search=${query}`).then((r) => r.data),
  createIngredient: (data) => api.post("/ingredients", data).then((r) => r.data),
  getEquipment: () => api.get("/equipment").then((r) => r.data),
  getAllergens: () => api.get("/allergens").then((r) => r.data),
  getDietaryRestrictions: () => api.get("/dietary-restrictions").then((r) => r.data),
  getRecipeStaticData: () => api.get("/recipes/static-data").then((r) => r.data),


  // --- Recipe Management ---
  // Ovi API-evi treba da postuju novi recept u bazu i da izlistaju recepte koje je taj kreator napravio i obrise recept
  createRecipe: (payload) => api.post("/recipes", payload).then((r) => r.data),
  listCreatorRecipes: () => api.get("/recipes/my").then((r) => r.data),
  listPublicRecipes: () => api.get("/recipes").then((r) => r.data),
  deleteRecipe: (id) => api.delete(`/recipes/${id}`).then((r) => r.data),
  getRecipeById: (id) => api.get(`/recipes/${id}`).then((r) => r.data),
  getFullRecipe: (id) => api.get(`/recipes/${id}/full`).then((r) => r.data),
  createMoodEntry: (payload) => api.post("/mood", payload).then((r) => r.data),
rateRecipe: (id, rating) =>
  api.post(`/recipes/${id}/rating`, { rating }).then((r) => r.data),



  // --- Profile & Stats ---
  // Ovi API-evi treba da ažuriraju ime korisnika i da dohvate statistike kreatora (broj recepata i prosječna ocjena recepata)
  updateProfileName: (newName) => api.put("/auth/profile/name", { name: newName }).then((r) => r.data),
  getCreatorStats: () => api.get("/creator/stats").then((r) => r.data),

   getCurrentMealPlan: () =>
    api.get("/student/mealplan/current").then((r) => r.data),

  generateMealPlan: (week_start, force = false) =>
  api
    .post(`/student/mealplan/generate${force ? "?force=1" : ""}`, { week_start })
    .then((r) => r.data),

};


export default api;