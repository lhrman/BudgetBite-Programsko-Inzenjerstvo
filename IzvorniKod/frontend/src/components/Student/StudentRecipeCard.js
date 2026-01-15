import React from "react";
import { MdStar, MdEuro, MdAccessTime } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/student.css";
import "../../styles/creator.css";

function StudentRecipeCard({ recipe }) {
  const navigate = useNavigate();

  const id = recipe?.id ?? recipe?._id ?? recipe?.recipe_id;
  const name = recipe?.recipe_name ?? "Bez naziva";

  const rating =
    recipe?.average_rating === null || recipe?.average_rating === undefined
      ? "—"
      : Number(recipe.average_rating).toFixed(1);

  const price =
    recipe?.price_estimate === null || recipe?.price_estimate === undefined
      ? "—"
      : `${Number(recipe.price_estimate).toFixed(2)} €`;

  const time =
    recipe?.prep_time_min === null || recipe?.prep_time_min === undefined
      ? "—"
      : `${Number(recipe.prep_time_min)} min`;

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
        <img src={recipe?.image || "/placeholder-recipe.jpg"} alt={name} />
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
