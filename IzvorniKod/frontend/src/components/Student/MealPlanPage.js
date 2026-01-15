import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentRecipeCard from "./StudentRecipeCard";
import { Api } from "../../services/api";
import dayjs from "dayjs";
import "../../styles/global.css";
import "../../styles/student.css";
import "../../styles/creator.css";

function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noPlan, setNoPlan] = useState(false);

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

  const formatFromApi = (data) => {
    const grouped = {};
    (data.items || []).forEach((item) => {
      const dayName = dayNames[item.day_of_week] || `Dan ${item.day_of_week}`;
      if (!grouped[dayName]) grouped[dayName] = [];

      grouped[dayName].push({
        id: item.recipe_id,
        title: item.recipe_name,
        image: "https://via.placeholder.com/400x250?text=Recipe",
        rating: null,
        price: Number(item.price_estimate ?? item.est_cost ?? 0),
        prepTime: item.prep_time_min ?? null,
        status: "Generated",
      });
    });

    return Object.keys(grouped).map((day) => ({
      day,
      meals: grouped[day],
    }));
  };

  const fetchMealPlan = async () => {
    setLoading(true);
    setError(null);
    setNoPlan(false);

    try {
      const data = await Api.getCurrentMealPlan();
      setMealPlan(formatFromApi(data));
    } catch (err) {
      // 404 => nema plana, pokaži gumb
      if (err?.response?.status === 404) {
        setNoPlan(true);
        setMealPlan([]);
      } else {
        setError("Greška pri dohvaćanju tjednog plana.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
  setLoading(true);
  setError(null);

  try {
    const weekStart = dayjs().format("YYYY-MM-DD");
    const force = !noPlan; // ako već ima plan, regeneriraj
    await Api.generateMealPlan(weekStart, force);
    await fetchMealPlan();
  } catch (err) {
    setError(err?.response?.data?.message || "Greška pri generiranju plana.");
  } finally {
    setLoading(false);
  }
};

  const handleRecipeClick = (id) => {
    alert(`Otvaram recept ID: ${id}`);
  };

  const handleLogMood = (recipe) => {
    navigate("/student/food-mood-journal", { state: { selectedRecipe: recipe } });
  };

  if (loading) return <p className="text-center mt-6">Učitavanje plana...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <div className="mealplan-page p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tvoj tjedni plan obroka</h1>

      <div className="flex items-center gap-3 mb-4">
  <button className="button1" onClick={handleGenerate} disabled={loading}>
    {noPlan ? "Generiraj plan" : "Regeneriraj plan"}
  </button>

  {!noPlan && (
    <span className="text-sm text-gray-500">
      Klikni “Regeneriraj” nakon promjene upitnika.
    </span>
  )}
</div>

{noPlan && (
  <p className="text-gray-500 mb-4">
    Trenutno nema generiranog plana. Klikni gumb da ga generiraš.
  </p>
)}


      {!noPlan &&
        mealPlan.map((dayPlan) => (
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
