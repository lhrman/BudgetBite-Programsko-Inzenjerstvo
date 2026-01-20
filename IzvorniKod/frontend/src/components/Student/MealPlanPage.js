import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentRecipeCard from "./StudentRecipeCard";
import { Api } from "../../services/api";
import dayjs from "dayjs";
import "../../styles/global.css";
import "../../styles/student.css";
import "../../styles/creator.css";

function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState([]); // [{ day, slots: { breakfast:[], lunch:[], dinner:[] } }]
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

  const slotLabels = {
    breakfast: "Doručak",
    lunch: "Ručak",
    dinner: "Večera",
  };

  const slotOrder = ["breakfast", "lunch", "dinner"];

  const formatFromApi = (data) => {
    const grouped = {}; // dayName -> slots -> meals[]

    (data?.items || []).forEach((item) => {
      const dayName = dayNames[item.day_of_week] || `Dan ${item.day_of_week}`;
      if (!grouped[dayName]) grouped[dayName] = { breakfast: [], lunch: [], dinner: [] };

      const slot = item.meal_slot || "lunch";
      if (!grouped[dayName][slot]) grouped[dayName][slot] = [];

      grouped[dayName][slot].push({
        recipe_id: item.recipe_id,
        recipe_name: item.recipe_name,
        image: item.image_url || item.media_url || null,
        price_estimate: Number(item.price_estimate ?? item.est_cost ?? 0),
        prep_time_min: item.prep_time_min ?? null,
        meal_slot: slot,
        day_of_week: item.day_of_week,
      });
    });

    return Object.keys(grouped).map((day) => ({
      day,
      slots: grouped[day],
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
      if (err?.response?.status === 404) {
        setNoPlan(true);
        setMealPlan([]);
      } else {
        setError(err?.response?.data?.message || "Greška pri dohvaćanju tjednog plana.");
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
      const force = !noPlan; // ako već postoji plan -> regeneriraj
      await Api.generateMealPlan(weekStart, force);
      await fetchMealPlan();
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri generiranju plana.");
    } finally {
      setLoading(false);
    }
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
        (mealPlan || []).map((dayPlan) => (
          <div key={dayPlan.day} className="mb-10">
            <h2 className="font-semibold text-xl mb-4">{dayPlan.day}</h2>

            {slotOrder.map((slot) => (
              <div key={slot} className="mb-6">
                <h3 className="font-semibold mb-2">{slotLabels[slot]}</h3>

                <div className="recipes-grid">
                  {(dayPlan?.slots?.[slot] || []).map((meal) => (
                    <StudentRecipeCard
                      key={`${meal.recipe_id}-${dayPlan.day}-${slot}`}
                      recipe={meal}
                      onLogMood={handleLogMood}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default MealPlanPage;
