import React from "react";
import { MdTimer, MdEuro, MdStar, MdDelete } from "react-icons/md";
import "../../../styles/creator.css";

function RecipeCard({ recipe, onDelete }) {
  return (
    <div className="recipe-card">
      <div className="recipe-card-image">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} />
        ) : (
          <div className="no-image-placeholder">Nema slike</div>
        )}
        <div className="recipe-card-status">{recipe.status}</div>
      </div>
      
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        
        <div className="recipe-card-stats">
          <div className="recipe-stat">
            <MdStar className="icon-star" />
            <span>{recipe.rating || "N/A"}</span>
          </div>
          <div className="recipe-stat">
            <MdTimer />
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="recipe-stat">
            <MdEuro />
            <span>{recipe.price}</span>
          </div>
        </div>

        <div className="recipe-card-actions">
          <button 
            className="btn-delete" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Obriši recept"
          >
            <MdDelete /> Obriši
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
