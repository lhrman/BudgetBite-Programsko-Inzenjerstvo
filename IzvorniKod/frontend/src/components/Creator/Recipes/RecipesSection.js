import React, { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { Api } from "../../../services/api";
import { mapRecipe } from "../../../services/adapters";
import { MdAddCircleOutline } from "react-icons/md";
import "../../../styles/creator.css";

export default function RecipesSection({ onAddRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await Api.listCreatorRecipes();
      // Ensure data is an array and map it using our adapter
      const mappedRecipes = (Array.isArray(data) ? data : []).map(mapRecipe);
      setRecipes(mappedRecipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      // Fallback to empty list on error for now
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Jeste li sigurni da želite obrisati ovaj recept?");
    if (confirmDelete) {
      try {
        await Api.deleteRecipe(id);
        alert("Recept uspješno obrisan!");
        fetchRecipes(); // Refresh list
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        alert("Greška pri brisanju recepta.");
      }
    }
  };

  if (loading) return <div className="loading-container">Učitavanje recepata...</div>;

  if (recipes.length === 0) {
    return (
      <div className="empty-recipes-container">
        <div className="empty-state-card">
          <MdAddCircleOutline className="empty-state-icon" />
          <h2>Još nemate objavljenih recepata</h2>
          <p>Podijelite svoje kulinarske vještine sa studentima!</p>
          <button className="button1" onClick={onAddRecipe}>
            Objavi recept
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipes-section">
      <div className="section-header">
        <div>
          <h1 className="recipes-section-title">Moji recepti</h1>
          <p className="recipes-section-subtitle">Upravljaj svojim objavljenim receptima i skicama.</p>
        </div>
        <button className="button1" onClick={onAddRecipe}>
          Novi recept
        </button>
      </div>

      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onDelete={() => handleDelete(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
