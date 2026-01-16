import React from "react";
import { MdStar, MdEuro, MdAccessTime } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/student.css";
import "../../styles/creator.css";

function StudentRecipeCard({ recipe }) {
  const navigate = useNavigate();

  // Adapter shape
  const id = recipe?.id;
  const name = recipe?.title || "Bez naziva";

  const rating =
    recipe?.rating === null || recipe?.rating === undefined
      ? "—"
      : Number(recipe.rating).toFixed(1);

  const price =
    recipe?.price === null || recipe?.price === undefined
      ? "—"
      : `${Number(recipe.price).toFixed(2)} €`;

  const time =
    recipe?.prepTime === null || recipe?.prepTime === undefined
      ? "—"
      : `${Number(recipe.prepTime)} min`;

  const image = recipe?.image || "/placeholder-recipe.jpg";

  return (
    <div
      className="recipe-card cursor-pointer hover:shadow-lg"
      onClick={() => navigate(`/recipeview/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/recipeview/${id}`);
      }}
    >
      <div className="recipe-card-image">
        <img src={image} alt={name} />
      </div>

      <div className="recipe-card-content">
        <h3 className="student-recipe-name">{name}</h3>

        <div className="recipe-card-stats">
          <span className="recipe-stat">
            <MdStar className="stat-icon" /> {rating}
          </span>
          <span className="recipe-stat">
            <MdEuro className="stat-icon" /> {price}
          </span>
          <span className="recipe-stat">
            <MdAccessTime className="stat-icon" /> {time}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StudentRecipeCard;
