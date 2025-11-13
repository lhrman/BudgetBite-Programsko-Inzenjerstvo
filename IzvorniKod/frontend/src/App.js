import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Router je uvezen
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Creator from "./pages/Creator";
import Student from "./pages/Student";
import Dashboard from "./pages/DashBoard";
import FoodMoodJournal from './components/Student/FoodMoodJournalPage';
import Admin from './pages/Admin';
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom"; 

import PrivateRoute from "./components/PrivateRoute";

// Komponenta za odabir uloge (ostaje ista)
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
    <div>
      <h2>Odaberite svoju ulogu</h2>
      <button onClick={() => handleSelect("student")}>Ja sam Student</button>
      <button onClick={() => handleSelect("creator")}>Ja sam Kreator</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

// Komponenta za Google callback (ostaje ista)
const GoogleCallbackPage = () => {
  const { handleGoogleCallback } = useAuth();
  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (token) {
      handleGoogleCallback(token);
    } else {
      window.location.href = "/login";
    }
  }, [token, handleGoogleCallback]);

  return <div>Obrada prijave...</div>;
};

// --- Glavna App komponenta ---

function App() {
  return (
    // 1. KORAK: <Router> mora biti na vrhu, izvan svega.
    <Router>
      {/* 2. KORAK: <AuthProvider> sada može sigurno koristiti useNavigate() */}
      <AuthProvider> 
        <Routes>
        
          {/* --- JAVNE RUTE --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} /> 
          <Route path="/google-callback" element={<GoogleCallbackPage />} /> 
          <Route path="/recipes" element={<div>Recepti</div>} />


          {/* --- PRIVATNE (ZAŠTIĆENE) RUTE --- */}
          <Route 
            path="/creator" 
            element={<PrivateRoute><Creator /></PrivateRoute>} 
          />
          <Route 
            path="/student" 
            element={<PrivateRoute><Student /></PrivateRoute>} 
          />
          <Route 
            path="/dashboard" 
            element={<PrivateRoute><Dashboard /></PrivateRoute>} 
          />
          <Route 
            path="/student/food-mood-journal" 
            element={<PrivateRoute><FoodMoodJournal /></PrivateRoute>} 
          />
          <Route 
            path="/profile" 
            element={<PrivateRoute><div>Moj profil</div></PrivateRoute>} 
          />
          <Route 
            path="/journal" 
            element={<PrivateRoute><div>Dnevnik</div></PrivateRoute>} 
          />
          <Route 
            path="/admin" 
            element={<PrivateRoute><Admin /></PrivateRoute>} 
          />
          <Route 
            path="/odabir-uloge" 
            element={<PrivateRoute><OdabirUlogePage /></PrivateRoute>} 
          />
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
