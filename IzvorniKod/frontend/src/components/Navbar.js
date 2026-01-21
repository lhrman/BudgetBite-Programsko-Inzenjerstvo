import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "bg-gray-700" : "";
  };

  return (
    React.createElement("nav", { className: "bg-gray-800 text-white p-4" },
      React.createElement("div", { className: "flex justify-between items-center" },
        // Logo
        React.createElement(Link, { 
          to: "/dashboard", 
          className: "text-lg font-bold" 
        }, "Moji recepti"),

        React.createElement("div", { className: "flex space-x-4" },
          React.createElement(Link, { 
            to: "/dashboard", 
            className: `px-3 py-2 rounded hover:bg-gray-700 ${isActive("/dashboard")}` 
          }, "Početna stranica"),
          
          React.createElement(Link, { 
            to: "/recipes", 
            className: `px-3 py-2 rounded hover:bg-gray-700 ${isActive("/recipes")}` 
          }, "Recepti"),
          
          React.createElement(Link, { 
            to: "/journal", 
            className: `px-3 py-2 rounded hover:bg-gray-700 ${isActive("/journal")}` 
          }, "Dnevnik"),

          React.createElement(Link, { 
            to: "/profile", 
            className: `px-3 py-2 rounded hover:bg-gray-700 ${isActive("/journal")}` 
          }, "Moj profil")
        ),
        
        React.createElement("div", { className: "flex items-center space-x-4" },
          React.createElement(Link, { 
            to: "/logout", 
            className: "bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm" 
          }, "Odjava")
        )
      )
    )
  );
}

export default Navbar;