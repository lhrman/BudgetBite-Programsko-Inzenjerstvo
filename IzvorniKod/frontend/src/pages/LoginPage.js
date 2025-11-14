import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom"; 
import '../styles/global.css';

function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // <-- Treba nam state za lozinku
  const [name, setName] = useState("");
  
  // Dohvaćamo funkcije iz globalnog AuthContext-a
  const { login, register, handleGoogleLogin, error } = useAuth();
  // Detect URL: /login → true, /register → false
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // <-- Šaljemo email I password
      // AuthContext će sam odraditi navigaciju
    } catch (err) {
      console.error("Failed to login");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password); // <-- Šaljemo name, email I password
      // AuthContext će nas preusmjeriti na /odabir-uloge
    } catch (err) {
      console.error("Failed to register");
    }
  };
  
  // Funkcije za UI
  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  // Vraćamo JSX radi čitljivosti (umjesto React.createElement)
  return (
    <div className="login-outer-container">
      <div className="login-inner-container">

        {/* --- PRIKAZ FORME ZA PRIJAVU --- */}
        {isLogin && (
          <>
            <h2 className="login-title">Prijava</h2>
            
            <div className="login-buttons-container">
              <button type="button" onClick={handleGoogleLogin} className="button2">
                Google prijava
              </button>
              {/* <button type="button" onClick={() => alert('Apple nije implementiran')} className="button2">
                Apple Prijava
              </button> */}
            </div>

            <form onSubmit={handleLoginSubmit}>
              <p style={{textAlign: 'center', margin: '1rem 0', fontWeight: 'bold'}}>Ili se prijavi emailom:</p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
              />
              {/* DODALI SMO LOZINKU */}
              <input
                type="password"
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
                required
              />
              
              {error && <p className="error-title">{error}</p>}

              <div className="switch-button-container">
                <button type="submit" className="button2">
                  Prijavi se
                </button>
                <button type="button" onClick={switchToRegister} className="button2">
                  Nemaš račun? Registriraj se
                </button>
              </div>
            </form>
          </>
        )}

        {/* --- PRIKAZ FORME ZA REGISTRACIJU --- */}
        {!isLogin && (
          <>
            <h2 className="login-title">Registracija</h2>

            <div className="login-buttons-container">
              <button type="button" onClick={handleGoogleLogin} className="button2">
                Google registracija
              </button>
              {/* <button type="button" onClick={() => alert('Apple nije implementiran')} className="button2">
                Apple registracija
              </button> */}
            </div>

            {/* OVDJE JE UKLONJEN ODABIR ULOGE */}
            <form onSubmit={handleRegisterSubmit}>
              <p style={{textAlign: 'center', margin: '1rem 0', fontWeight: 'bold'}}>Ili se registriraj emailom:</p>
              <input
                type="text"
                placeholder="Ime i prezime"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name-input"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
              />
              {/* DODALI SMO LOZINKU */}
              <input
                type="password"
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
                required
              />
              
              {error && <p className="error-title">{error}</p>}

              <div className="switch-button-container">
                <button type="submit" className="button2">
                  Registriraj se
                </button>
                <button type="button" onClick={switchToLogin} className="button2">
                  Već imaš račun? Prijavi se
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;