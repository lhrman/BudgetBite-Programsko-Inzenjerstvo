import React from "react";
import { MdStar, MdEuro, MdAccessTime, MdMood } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/student.css";
import "../../styles/creator.css";

function StudentRecipeCard({ recipe }) {
  const navigate = useNavigate();

  const id = recipe?.id ?? recipe?._id ?? recipe?.recipe_id;
  const name = recipe?.recipe_name ?? recipe?.title ?? "Bez naziva";

  const priceVal = recipe?.price_estimate ?? recipe?.price;
  const timeVal = recipe?.prep_time_min ?? recipe?.prepTime;

  const price =
    priceVal === null || priceVal === undefined
      ? "—"
      : `${Number(priceVal).toFixed(2)} €`;

  const time =
    timeVal === null || timeVal === undefined ? "—" : `${Number(timeVal)} min`;

  const rating =
    recipe?.rating === null || recipe?.rating === undefined
      ? "—"
      : Number(recipe.rating).toFixed(1);

  const imageSrc =
    recipe?.image ||
    recipe?.image_url ||
    "/images/recipe-placeholder.jpg";

  // ✅ klik na gumb vodi na FoodMoodJournal s odabranim receptom
  const goToFoodMoodJournal = (e) => {
    e.stopPropagation(); // da ne otvori recipeview
    navigate("/student/food-mood-journal", {
      state: {
        selectedRecipe: {
          id,
          title: name,
        },
      },
    });
  };

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
      <div className="recipe-card-image" style={{ position: "relative" }}>
        <img
          src={imageSrc}
          alt={name}
          className="recipe-card-image-img"
          loading="lazy"
        />

        {/* ✅ Food Mood tipka */}
        <button
          type="button"
          onClick={goToFoodMoodJournal}
          className="foodmood-btn"
          title="Food Mood Journal"
          aria-label="Food Mood Journal"
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            width: 44,
            height: 44,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          }}
        >
          <MdMood size={22} />
        </button>
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
