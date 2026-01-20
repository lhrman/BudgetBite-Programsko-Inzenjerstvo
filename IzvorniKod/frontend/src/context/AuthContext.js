import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthService } from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

 // ... (iznad useEffect-a)

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          // AuthService.getLoggedInUser() će sam obrisati token iz localStorage ako istekne
          const userData = await AuthService.getLoggedInUser(); 

          if (userData) {
            // Ako je sve u redu, postavi usera
            setUser(userData);
          } else {
            // Ako je token bio neispravan (userData je null),
            // moramo obrisati OBOJE iz stanja.
            setToken(null);
            setUser(null); // <-- OVO JE KLJUČAN POPRAVAK
          }
        } catch (e) {
          // Ako se dogodi bilo kakva greška, također brišemo sve
          console.error("Greška pri provjeri tokena", e);
          setToken(null);
          setUser(null); // <-- OVO JE KLJUČAN POPRAVAK
        }
      }
      setIsAuthLoading(false);
    };
    checkUser();
  }, [token]); // Ovisnost ostaje 'token'

  // ... (ostatak koda u AuthContext.js)
  // --- AŽURIRANE FUNKCIJE ---

  const login = async (email, password) => { // <-- Prima password
    try {
      setError("");
      const { user, token } = await AuthService.login(email, password); // <-- Šalje password
      setUser(user);
      setToken(token);
      sessionStorage.setItem("token", token);
      handleRoleNavigation(user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Greška pri prijavi");
      throw err;
    }
  };

  const register = async (name, email, password) => { // <-- Prima password
    try {
      setError("");
      const { user, token } = await AuthService.register(name, email, password); // <-- Šalje password
      setUser(user);
      setToken(token);
      sessionStorage.setItem("token", token);
      navigate("/odabir-uloge"); // <-- Uvijek šalji na odabir uloge
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Greška pri registraciji");
      throw err;
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3004/api/auth/google";
  };
  
  const handleGoogleCallback = (token) => {
     AuthService.handleGoogleLogin(token);
     setToken(token);
     sessionStorage.setItem("token", token);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  // --- Pomoćne funkcije ---
  
  const handleRoleNavigation = (userToCheck) => {
    if (!userToCheck) return;
    
    const role = userToCheck.is_admin ? "admin"
               : userToCheck.is_student ? "student"
               : userToCheck.is_creator ? "creator"
               : "user"; 

    if (role === "admin") navigate("/admin");
    else if (role === "student") navigate("/student"); // Ili /dashboard
    else if (role === "creator") navigate("/creator"); // Ili /dashboard
    else if (role === "user") navigate("/odabir-uloge");
    else navigate("/");
  };

  const updateUser = (updatedUser) => {
  setUser(updatedUser);
  // Ako negdje spremate user u localStorage, onda i tu:
  localStorage.setItem("user", JSON.stringify(updatedUser));
};

  
  // Funkcija koju će zvati OdabirUlogePage
  const setRoleAndUpdateUser = async (role) => {
    try {
      setError("");
      const { user, token } = await AuthService.setRole(role);
      setUser(user);
      setToken(token);
      sessionStorage.setItem("token", token);
      handleRoleNavigation(user); // Preusmjeri na ispravnu stranicu
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Greška pri odabiru uloge");
      throw err;
    }
  }

const value = {
  user,
  token,
  isAuthLoading,
  error,
  login,
  register,
  logout,
  handleGoogleLogin,
  handleGoogleCallback,
  setRole: setRoleAndUpdateUser,
  updateUser, 
};


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};