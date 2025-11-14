import React from "react";
import { MdDashboard, MdRestaurantMenu, MdAdd, MdPerson } from "react-icons/md";
import "./Sidebar.css";

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
              onClick={() => onSectionChange("recipes")}
              className={`nav-button ${activeSection === "recipes" ? "active" : ""}`}
            >
              <MdRestaurantMenu className="nav-icon" />
              <span>Moji recepti</span>
            </button>
            <button
              onClick={() => onSectionChange("addRecipe")}
              className={`nav-button ${activeSection === "addRecipe" ? "active" : ""}`}
            >
              <MdAdd className="nav-icon" />
              <span>Dodaj recept</span>
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