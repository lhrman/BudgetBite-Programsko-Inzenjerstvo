import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";


import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Creator from "./pages/Creator";
import Student from "./pages/Student";
import Dashboard from "./pages/DashBoard";
import Admin from "./pages/Admin";
import PrivateRoute from "./components/PrivateRoute";
import Recipes from "./pages/Recipes";
//import RecipeView from "./pages/RecipeView";


//import FoodMoodJournal from "./components/Student/FoodMoodJournal";



// --- Komponenta za odabir uloge ---
const OdabirUlogePage = () => {
  const { setRole, error } = useAuth();

  const handleSelect = async (role) => {
    try {
      await setRole(role);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="odabir-uloge-container">
      <div className="odabir-uloge-card">
        <h2>Odaberite svoju ulogu</h2>
        <div className="uloge-buttons">
          <button
            className="uloga-button student"
            type="button"
            onClick={() => handleSelect("student")}
          >
            <span className="uloga-icon">🎓</span>
            Ja sam Student
          </button>
          <button
            className="uloga-button creator"
            type="button"
            onClick={() => handleSelect("creator")}
          >
            <span className="uloga-icon">👨‍🍳</span>
            Ja sam Kreator
          </button>
        </div>
        {error && <div className="odabir-uloge-error">{error}</div>}
      </div>
    </div>
  );
};

// --- Google Callback koji prepoznaje ulogu ---
const GoogleCallbackPage = () => {
  const { handleGoogleCallback } = useAuth();
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    const processGoogleLogin = async () => {
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Spremi token kroz AuthService (obično localStorage)
      handleGoogleCallback(token);

      // Spremi token i u sessionStorage (tab-specific)
      sessionStorage.setItem("token", token);

      try {
        const response = await fetch("http://localhost:3004/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.user) {
          window.location.href = "/login";
          return;
        }

        const user = data.user;

        // Preusmjeri korisnika ovisno o ulozi
        if (user.is_admin) window.location.href = "/admin";
        else if (user.is_student) window.location.href = "/student";
        else if (user.is_creator) window.location.href = "/creator";
        else window.location.href = "/odabir-uloge";
      } catch (error) {
        console.error("Greška pri obradi Google login-a:", error);
        window.location.href = "/login";
      }
    };

    processGoogleLogin();
  }, [token, handleGoogleCallback]);

  return <div>🔄 Obrada Google prijave...</div>;
};

// --- Glavna App komponenta ---
function App() {
  return (
    <Router>
        <AuthProvider>
            <Routes>
              {/* --- JAVNE RUTE --- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="/google-callback" element={<GoogleCallbackPage />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/reset-password" element={<LoginPage />} />

              {/* --- PRIVATNE RUTE --- */}
              <Route
                path="/creator"
                element={
                  <PrivateRoute>
                    <Creator />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <PrivateRoute>
                    <Student />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Ako ti ikad zatreba ruta za FoodMoodJournal kao poseban URL,
                odkomentiraj import i ovu rutu.
              */}
              {/*
              <Route
                path="/student/food-mood-journal"
                element={
                  <PrivateRoute>
                    <FoodMoodJournal />
                  </PrivateRoute>
                }
              />
              */}

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <div>Moj profil</div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <PrivateRoute>
                    <div>Dnevnik</div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <Admin />
                  </PrivateRoute>
                }
              />
              <Route
                path="/odabir-uloge"
                element={
                  <PrivateRoute>
                    <OdabirUlogePage />
                  </PrivateRoute>
                }
              />

              {/* --- FALLBACK --- */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    </Router>
  );
}

export default App;
