import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/global.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-outer-container">
      <img src="/logo.jpg" alt="logo" style={{width: '300px', height: '300px'}}/>
      <div className="home-inner-container">
        <h1>Dobrodošli u BudgetBite!</h1>
        <p>
          Upravljajte svojim budžetom kroz recepte i planiranje obroka.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="button1"
        >
          Prijava
        </button>

        <button
          onClick={() => navigate("/register")}
          className="button1"
        >
          Registracija
        </button>

      </div>
    </div>
  );
}

export default Home;
