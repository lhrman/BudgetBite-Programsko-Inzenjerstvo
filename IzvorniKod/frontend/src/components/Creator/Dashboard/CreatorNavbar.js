import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/creator.css";

function CreatorNavbar() {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/creator" className="navbar-logo-link">
          <img src="/logo.jpg" alt="BudgetBite" className="navbar-logo-img" />
        </Link>

        <div className="navbar-links">
          <Link to="/creator" className="navbar-link active">Dashboard</Link>
          <Link to="/recipes" className="navbar-link">Javna arhiva</Link>
        </div>

        <div className="navbar-actions">
          <button onClick={logout} className="button1">Odjava</button>
        </div>
      </div>
    </nav>
  );
}

export default CreatorNavbar;

