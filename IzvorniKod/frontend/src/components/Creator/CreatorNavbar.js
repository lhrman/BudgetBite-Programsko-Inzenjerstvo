import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./CreatorNavbar.css";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - clickable image that goes to homepage */}
        <Link to="/" className="navbar-logo-link">
          <img 
            src="/icon.ico" 
            alt="BudgetBite Logo" 
            className="navbar-logo-img"
          />
        </Link>
    
        
        {/* Logout Button */}
        <div className="navbar-actions">
          <Link to="/logout" className="button1">
            Odjava
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;