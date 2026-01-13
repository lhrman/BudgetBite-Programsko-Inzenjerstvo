import React from "react";
import { MdStar, MdEuro, MdAccessTime, MdMood, MdMenuBook } from "react-icons/md";
import "../../styles/creator.css";

function StudentRecipeCard({ recipe, onClick, onLogMood }) {
  return (
    <div
      className="recipe-card cursor-pointer hover:shadow-lg"
      onClick={() => onClick(recipe.id)}
    >
      {/* Recipe Image */}
      <div className="recipe-card-image">
        <img 
          src={recipe.image || "/placeholder-recipe.jpg"} 
          alt={recipe.title}
        />
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
            <MdEuro className="stat-icon" /> {Number(recipe.price ?? 0).toFixed(2)} €
          </span>
          <span className="recipe-stat">
            <MdAccessTime className="stat-icon" /> {recipe.prepTime} min
          </span>
        </div>
        
        {/* Action Buttons */}
        {/* Students don’t see edit/delete buttons */}
        <div className="recipe-card-actions">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick(recipe.id);
            }}  
            className="recipe-btn-edit">
            <MdMenuBook /> Otvori recept
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLogMood(recipe);
            }}   
            className="recipe-btn-edit">
            <MdMood /> Log Mood
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentRecipeCard;
