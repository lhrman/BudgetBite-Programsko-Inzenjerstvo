// src/components/Creator/RecipesSection.js
import React, { useEffect, useState } from "react";
import "./RecipesSection.css";
import RecipeCard from "./RecipeCard";

export default function RecipesSection() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK podaci – isto kao kod MealPlanPage, samo lista recepata
    const data = [
      {
        id: 101,
        title: "Piletina s povrćem",
        image: "https://www.apetit.hr/wp-content/uploads/2024/06/Piletina-u-umaku-od-povrca.jpg",
        rating: 4.5,
        price: 3.2,
        prepTime: 25,
        status: "Published",
      },
      {
        id: 102,
        title: "Banana Bread",
        image: "https://images.unsplash.com/photo-1497534547324-0ebb3f052e88?w=400",
        rating: 4.8,
        price: 1.5,
        prepTime: 5,
        status: "Published",
      },
      {
        id: 103,
        title: "Tjestenina s rajčicom",
        image: "https://gastro.24sata.hr/media/img/4d/7f/fc7a6c87b81dcf9294a5.jpeg",
        rating: 4.0,
        price: 1.9,
        prepTime: 18,
        status: "Published",
      },
    ];

    setRecipes(data);
    setLoading(false);
  }, []);

  if (loading) return <p>Učitavanje…</p>;
  if (!recipes.length) return <p>Još nemaš recepata. Dodaj prvi preko “Dodaj recept”.</p>;

  return (
    <div className="recipes-grid">
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          onEdit={(id) => console.log("Uredi", id)}
          onDelete={(id) => console.log("Obriši", id)}
        />
      ))}
    </div>
  );

  /*!!!!!const data = await Api.listCreatorRecipes();
    setRecipes(data.map(mapRecipe)); !!!!- ovo cu zamjenit sa mockom kad se spoji backend*/

}
