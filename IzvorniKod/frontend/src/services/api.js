import axios from "axios";

// --- 1. Konfiguracija Axios Instance ---

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// --- 2. Axios Interceptor (za automatsko slanje tokena) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
  // ... (tvoje ostale API funkcije)
};

export default api;