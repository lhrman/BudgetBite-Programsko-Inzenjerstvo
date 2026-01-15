import React from "react";
import { MdDashboard, MdPerson, MdRestaurantMenu, MdMood, MdQuiz, MdEmojiEvents  } from "react-icons/md";

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
              onClick={() => onSectionChange("questionnaire")}
              className={`nav-button ${activeSection === "questionnaire" ? "active" : ""}`}
            >
              <MdQuiz className="nav-icon" />
              <span>Prehrambeni upitnik</span>
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
            <button
              onClick={() => onSectionChange("gamification")}
              className={`nav-button ${activeSection === "gamification" ? "active" : ""}`}
            >
              <MdEmojiEvents className="nav-icon" />
              <span>Izazovi i nagrade</span>
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