import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentRecipeCard from "./StudentRecipeCard";
import api from "../../services/api";
import "../../styles/global.css";

function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const dayNames = {
    1: "Ponedjeljak",
    2: "Utorak",
    3: "Srijeda",
    4: "Četvrtak",
    5: "Petak",
    6: "Subota",
    7: "Nedjelja",
  };

  const fetchMealPlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/student/mealplan/current");
      const data = res.data;

      const grouped = {};

      data.items.forEach((item) => {
        const dayName = dayNames[item.day_of_week];

        if (!grouped[dayName]) {
          grouped[dayName] = [];
        }

        grouped[dayName].push({
          id: item.recipe_id,
          title: item.recipe_name,
          image: "https://via.placeholder.com/400x250?text=Recipe",
          rating: null,
          price: Number(item.price_estimate ?? 0),
          prepTime: item.prep_time_min,
          status: "Generated",
        });
      });

      const formatted = Object.keys(grouped).map((day) => ({
        day,
        meals: grouped[day],
      }));

      setMealPlan(formatted);
    } catch (err) {
      if (err.response?.status === 404) {
        setMealPlan([]);
      } else {
        console.error(err);
        setError("Greška pri dohvaćanju tjednog plana.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      await api.post("/student/mealplan/generate", {
        week_start: new Date().toISOString().slice(0, 10),
      });

      await fetchMealPlan();
    } catch (err) {
      console.error(err);
      setError("Greška pri generiranju plana.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const handleRecipeClick = (id) => {
    alert(`Otvaram recept ID: ${id}`);
  };

  const handleLogMood = (recipe) => {
    navigate("/student/food-mood-journal", {
      state: { selectedRecipe: recipe },
    });
  };

  if (loading) {
    return <p className="text-center mt-6">Učitavanje plana...</p>;
  }

  if (error) {
    return <p className="text-center mt-6 text-red-500">{error}</p>;
  }

  return (
    <div className="mealplan-page p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tvoj tjedni plan obroka</h1>

      {mealPlan.length === 0 && (
        <>
          <p className="text-center text-gray-500 mb-4">
            Trenutno nema generiranog plana za ovaj tjedan.
          </p>
          <div className="text-center">
            <button
              onClick={generateMealPlan}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Generiraj meal plan
            </button>
          </div>
        </>
      )}

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
