import React from "react";
import { 
  MdDashboard, 
  MdRestaurantMenu, 
  MdAddCircle, 
  MdPerson 
} from "react-icons/md";
import "../../../styles/creator.css";

function Sidebar({ activeSection, onSectionChange }) {
  const menuItems = [
    { id: "overview", label: "Pregled", icon: <MdDashboard /> },
    { id: "recipes", label: "Moji recepti", icon: <MdRestaurantMenu /> },
    { id: "addRecipe", label: "Dodaj recept", icon: <MdAddCircle /> },
    { id: "profile", label: "Moj profil", icon: <MdPerson /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Kreator Panel</h2>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${activeSection === item.id ? "active" : ""}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;

