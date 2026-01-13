import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom"; 
import '../styles/global.css';

function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // NOVA STANJA ZA FORGOT PASSWORD
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot-password' | 'reset-password'
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { login, register, handleGoogleLogin, error } = useAuth();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");

  // Provjeri ima li token u URL-u (za reset password)
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      setView('reset-password');
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error("Failed to login");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
    } catch (err) {
      console.error("Failed to register");
    }
  };

  // NOVA FUNKCIJA - Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
      } else {
        setResetError(data.message || 'Greška pri slanju emaila');
      }
    } catch (err) {
      setResetError('Greška s mrežom. Pokušajte ponovo.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNKCIJA - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmPassword) {
      setResetError('Lozinke se ne podudaraju');
      return;
    }

    setLoading(true);


    try {
      const token = new URLSearchParams(window.location.search).get('token');
      
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Lozinka uspješno promijenjena! Prijavite se s novom lozinkom.');
        setView('login');
        setIsLogin(true);
        // Očisti URL token
        window.history.replaceState({}, document.title, "/login");
      } else {
        setResetError(data.message || 'Resetiranje nije uspjelo. Link je možda istekao.');
      }
    } catch (err) {
      setResetError('Greška s mrežom. Pokušajte ponovo.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const switchToLogin = () => {
    setIsLogin(true);
    setView('login');
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setView('register');
  };

  const switchToForgotPassword = () => {
    setView('forgot-password');
  };

  // ==================== FORGOT PASSWORD VIEW ====================
  if (view === 'forgot-password') {
    if (emailSent) {
      return (
        <div className="login-outer-container">
          <div className="login-inner-container" style={{textAlign: 'center'}}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 20px'
            }}>✓</div>
            <h2 className="login-title" style={{color: '#4CAF50'}}>Email Poslan</h2>
            <p style={{color: '#666', marginBottom: '20px'}}>
              Ako postoji račun za <strong>{resetEmail}</strong>, 
              primit ćete link za reset lozinke uskoro.
            </p>
            <p style={{color: '#999', fontSize: '13px', marginBottom: '20px'}}>
              Link će isteći za 1 sat.
            </p>
            <button 
              onClick={() => {
                switchToLogin();
                setEmailSent(false);
                setResetEmail('');
              }}
              className="button2"
            >
              Povratak na prijavu
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="login-outer-container">
        <div className="login-inner-container">
          <h2 className="login-title">Resetiraj Lozinku</h2>
          <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>
            Unesite vašu email adresu i poslat ćemo vam link za reset lozinke.
          </p>

          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Email adresa"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="email-input"
              required
              disabled={loading}
            />

            {resetError && <p className="error-title">{resetError}</p>}

            <button type="submit" className="button2" disabled={loading}>
              {loading ? 'Šaljem...' : 'Pošalji Link'}
            </button>

            <button 
              type="button" 
              onClick={switchToLogin}
              className="button2"
              style={{marginTop: '10px'}}
            >
              ← Povratak na prijavu
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== RESET PASSWORD VIEW ====================
  if (view === 'reset-password') {
    return (
      <div className="login-outer-container">
        <div className="login-inner-container">
          <h2 className="login-title">Nova Lozinka</h2>
          <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>
            Unesite vašu novu lozinku ispod.
          </p>

          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="Nova lozinka"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="password-input"
              required
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Potvrdi lozinku"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="password-input"
              required
              disabled={loading}
            />

            {resetError && <p className="error-title">{resetError}</p>}

            <button type="submit" className="button2" disabled={loading}>
              {loading ? 'Resetiram...' : 'Resetiraj Lozinku'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== LOGIN VIEW ====================
  if (isLogin && view === 'login') {
    return (
      <div className="login-outer-container">
        <div className="login-inner-container">
          <h2 className="login-title">Prijava</h2>
          
          <div className="login-buttons-container">
            <button type="button" onClick={handleGoogleLogin} className="button2">
              Google prijava
            </button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <p style={{textAlign: 'center', margin: '1rem 0', fontWeight: 'bold'}}>
              Ili se prijavi emailom:
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input"
              required
            />
            <input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              required
            />

            {/* DODANO: Forgot Password Link */}
            <div style={{textAlign: 'right', marginTop: '-10px', marginBottom: '15px'}}>
              <button 
                type="button"
                onClick={switchToForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4CAF50',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: 0
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Zaboravili ste lozinku?
              </button>
            </div>
            
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
        </div>
      </div>
    );
  }

  // ==================== REGISTER VIEW ====================
  return (
    <div className="login-outer-container">
      <div className="login-inner-container">
        <h2 className="login-title">Registracija</h2>

        <div className="login-buttons-container">
          <button type="button" onClick={handleGoogleLogin} className="button2">
            Google registracija
          </button>
        </div>

        <form onSubmit={handleRegisterSubmit}>
          <p style={{textAlign: 'center', margin: '1rem 0', fontWeight: 'bold'}}>
            Ili se registriraj emailom:
          </p>
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
      </div>
    </div>
  );
}

export default LoginPage;