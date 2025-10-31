import React from "react";
import { MdEdit, MdDelete, MdStar, MdEuro, MdAccessTime } from "react-icons/md";
import "./RecipeCard.css";

function RecipeCard({ recipe, onEdit, onDelete }) {
  return (
    <div className="recipe-card">
      {/* Recipe Image */}
      <div className="recipe-card-image">
        <img 
          src={recipe.image || "/placeholder-recipe.jpg"} 
          alt={recipe.title}
        />
        {/* Status Badge */}
        <span className={`recipe-status ${recipe.status.toLowerCase()}`}>
          {recipe.status === "Published" ? "Objavljeno" : "Skica"}
        </span>
      </div>

      {/* Recipe Info */}
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        
        {/* Stats Row */}
        <div className="recipe-card-stats">
          <span className="recipe-stat">
            <MdStar className="stat-icon" /> {recipe.rating}
          </span>
          <span className="recipe-stat">
            <MdEuro className="stat-icon" /> {recipe.price}
          </span>
          <span className="recipe-stat">
            <MdAccessTime className="stat-icon" /> {recipe.prepTime} min
          </span>
        </div>

        {/* Action Buttons */}
        <div className="recipe-card-actions">
          <button 
            className="recipe-btn-edit"
            onClick={() => onEdit(recipe.id)}
          >
            <MdEdit /> Uredi
          </button>
          <button 
            className="recipe-btn-delete"
            onClick={() => onDelete(recipe.id)}
          >
            <MdDelete /> Obriši
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;