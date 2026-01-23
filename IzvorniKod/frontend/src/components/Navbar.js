import React from "react";
import { useAuth } from "../context/AuthContext";
import NotificationsBell from "../components/NotificationsBell";
import "../styles/student.css";

function CreatorNavbar() {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <img src="/logo.jpg" alt="BudgetBite" className="navbar-logo-img" />

        <div className="navbar-actions">
          <NotificationsBell />
          <button onClick={logout} className="button1">Odjava</button>
        </div>
      </div>
    </nav>
  );
}


export default CreatorNavbar;

