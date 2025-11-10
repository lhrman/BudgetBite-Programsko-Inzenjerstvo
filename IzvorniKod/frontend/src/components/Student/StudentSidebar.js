import React from "react";
import { MdDashboard, MdPerson,  MdRestaurantMenu, MdMood } from "react-icons/md";

function Sidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div>
          <nav className="sidebar-nav">
            <button
              onClick={() => onSectionChange("overview")}
              className={`nav-button ${activeSection === "overview" ? "active" : ""}`}
            >
              <MdDashboard className="nav-icon" />
              <span>Pregled</span>
            </button>
            <button
              onClick={() => onSectionChange("mealplan")}
              className={`nav-button ${activeSection === "mealplan" ? "active" : ""}`}
            >
              <MdRestaurantMenu className="nav-icon" />
              <span>Tjedni plan</span>
            </button>
            <button
              onClick={() => onSectionChange("foodmood")}
              className={`nav-button ${activeSection === "foodmood" ? "active" : ""}`}
            >
              <MdMood className="nav-icon" />
              <span>Food Mood Journal</span>
            </button>
          </nav>
        </div>
        
        {/* Profile button at bottom */}
        <button
          onClick={() => onSectionChange("profile")}
          className={`nav-button ${activeSection === "profile" ? "active" : ""}`}
        >
          <MdPerson className="nav-icon" />
          <span>Profil</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;