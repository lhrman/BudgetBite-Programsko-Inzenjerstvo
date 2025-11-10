import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentRecipeCard from "./StudentRecipeCard";
import "../../styles/global.css";

function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealPlan = async () => {
      setLoading(true);
      try {
        // MOCK data
        const data = [
          {
            day: "Ponedjeljak",
            meals: [
              {
                id: 1,
                title: "Brza Pasta Carbonara",
                image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
                rating: 4.5,
                price: 5.0,
                prepTime: 30,
                status: "Published"
              },
              {
                id: 2,
                title: "Omlet s povrćem",
                image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400",
                rating: 4.2,
                price: 3.5,
                prepTime: 15,
                status: "Published"
              }
            ]
          },
          {
            day: "Utorak",
            meals: [
              {
                id: 3,
                title: "Jednostavni burger",
                image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
                rating: 4.6,
                price: 6.0,
                prepTime: 25,
                status: "Published"
              },
              {
                id: 4,
                title: "Torilla chips s guacamoleom",
                image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
                rating: 4.3,
                price: 2.5,
                prepTime: 10,
                status: "Published"
              }
            ]
          }
          // Add more days as needed
        ];

        setMealPlan(data);
        setLoading(false);
      } catch (err) {
        setError("Greška pri dohvaćanju tjednog plana.");
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  const handleRecipeClick = (id) => {
    // TODO: Open modal or navigate to recipe detail page
    alert(`Otvaram recept ID: ${id}`);
  };

  const handleLogMood = (recipe) => {
    navigate('/student/food-mood-journal', { state: { selectedRecipe: recipe } });
  };
  
if (loading) return <p className="text-center mt-6">Učitavanje plana...</p>;
if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;


return (
  <div className="mealplan-page p-4 max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Tvoj tjedni plan obroka</h1>

      {mealPlan.map((dayPlan) => (
        <div key={dayPlan.day} className="mb-10">
          <h2 className="font-semibold text-xl mb-4">{dayPlan.day}</h2>
          <div className="recipes-grid">
            {dayPlan.meals.map((meal) => (
              <StudentRecipeCard
                key={meal.id}
                recipe={meal}
                onClick={handleRecipeClick}
                onLogMood={handleLogMood}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MealPlanPage;
