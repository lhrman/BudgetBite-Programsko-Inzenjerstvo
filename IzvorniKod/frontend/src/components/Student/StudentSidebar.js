import React from "react";
import { MdDashboard, MdNotifications, MdPerson, MdRestaurantMenu, MdMood, MdQuiz, MdEmojiEvents, MdSettings, MdInsights } from "react-icons/md";
import { useNotifications } from "../../context/NotificationContext";
import "../../styles/global.css";
import "../../styles/student.css";

function Sidebar({ activeSection, onSectionChange }) {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

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
              <span>Javna arhiva</span>
            </button>
            
            
            <button
              onClick={() => onSectionChange("notifications")}
              className={`nav-button ${activeSection === "notifications" ? "active" : ""}`}
            >
              <MdNotifications className="nav-icon" />
              <span>Notifikacije</span>

              {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
              )}
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
              onClick={() => onSectionChange("reflection")}
              className={`nav-button ${activeSection === "reflection" ? "active" : ""}`}
            >
              <MdInsights className="nav-icon" />
              <span>Tjedna refleksija</span>
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
        
        <div>
          <button
            onClick={() => onSectionChange("profile")}
            className={`nav-button ${activeSection === "profile" ? "active" : ""}`}
          >
            <MdPerson className="nav-icon" />
            <span>Profil</span>
          </button>
          <button
            onClick={() => onSectionChange("settings")}
            className={`nav-button ${activeSection === "settings" ? "active" : ""}`}
          >
            <MdSettings className="nav-icon" />
            <span>Postavke</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;