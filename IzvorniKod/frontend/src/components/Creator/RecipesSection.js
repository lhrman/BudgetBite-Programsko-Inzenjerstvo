import React from "react";
import RecipeCard from "./RecipeCard";
import "./RecipesSection.css";

function RecipesSection() {
  // Mock data - zamjena za stvarne podatke iz backend-a
  const recipes = [
    {
      id: 1,
      title: "Brza Pasta Carbonara",
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
      rating: 4.5,
      price: 5.00,
      prepTime: 30,
      status: "Published"
    },
    {
      id: 2,
      title: "Studentski Doručak Bowl",
      image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400",
      rating: 4.8,
      price: 3.50,
      prepTime: 15,
      status: "Published"
    },
    {
      id: 3,
      title: "Jednostavno Wok Povrće",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
      rating: 4.2,
      price: 4.00,
      prepTime: 20,
      status: "Draft"
    },
    {
      id: 4,
      title: "Brzi Hummus Toast",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      rating: 4.6,
      price: 2.50,
      prepTime: 10,
      status: "Published"
    }
  ];

  const handleEdit = (id) => {
    console.log("Uredi recept:", id);
    // TODO: implementiraj edit funkcionalnost
  };

  const handleDelete = (id) => {
    console.log("Obriši recept:", id);
    // TODO: implementiraj delete funkcionalnost
  };

  return (
    <div className="recipes-section">
      <h1 className="recipes-section-title">Moji recepti</h1>
      <p className="recipes-section-subtitle">
        Ukupno recepta: {recipes.length}
      </p>
      
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default RecipesSection;