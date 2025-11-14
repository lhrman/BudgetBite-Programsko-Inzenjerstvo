// src/components/Creator/RecipeCard.js
import React from "react";
import { MdEdit, MdDelete, MdStar, MdEuro, MdAccessTime } from "react-icons/md";
import "./RecipeCard.css";

function RecipeCard({ recipe, onEdit, onDelete }) {
  const price =
    typeof recipe.price === "number" ? recipe.price.toFixed(2) : recipe.price || "-";
  const rating =
    typeof recipe.rating === "number" ? recipe.rating.toFixed(1) : (recipe.rating ?? "-");
  const prep = recipe.prepTime ?? "-";
  const statusText = (recipe.status || "Published") === "Published" ? "Objavljeno" : "Skica";

  return (
    <div className="recipe-card">
      {/* Image */}
      <div className="recipe-card-image">
        <img src={recipe.image || "/placeholder-recipe.jpg"} alt={recipe.title} />
        <span className={`recipe-status ${(recipe.status || "Published").toLowerCase()}`}>
          {statusText}
        </span>
      </div>

      {/* Content */}
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>

        <div className="recipe-card-stats">
          <span className="recipe-stat">
            <MdStar className="stat-icon" /> {rating}
          </span>
          <span className="recipe-stat">
            <MdEuro className="stat-icon" /> {price}
          </span>
          <span className="recipe-stat">
            <MdAccessTime className="stat-icon" /> {prep} min
          </span>
        </div>

        <div className="recipe-card-actions">
          <button className="recipe-btn-edit" onClick={() => onEdit(recipe.id)}>
            <MdEdit /> Uredi
          </button>
          <button className="recipe-btn-delete" onClick={() => onDelete(recipe.id)}>
            <MdDelete /> Obriši
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
