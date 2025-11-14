import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Creator/AddRecipeSection.css";

function FoodMoodJournal() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRecipe = location.state?.selectedRecipe || null;

  const [currentEntry, setCurrentEntry] = useState({
    recipeId: selectedRecipe ? selectedRecipe.id : null,
    meal: selectedRecipe ? selectedRecipe.title : "",
    components: selectedRecipe ? selectedRecipe.components || "" : "",
    beforeMood: "",
    afterMood: ""
  });
  
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (selectedRecipe) {
      setCurrentEntry({
        recipeId: selectedRecipe.id,
        meal: selectedRecipe.title,
        components: selectedRecipe.components || "",
        beforeMood: "",
        afterMood: ""
      });
    }
  }, [selectedRecipe]);

  const handleChange = (e) => {
    setCurrentEntry({ ...currentEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const entry = { ...currentEntry, id: Date.now() };
    setEntries([...entries, entry]);
    
    // TODO: POST entry to backend: { recipeId, beforeMood, afterMood }
    alert("Raspoloženje za obrok spremljeno!");
    
    // Navigate back to meal plan
    // navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="food-mood-journal p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Food Mood Journal</h1>
      
      {/* Form Card */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal input */}
          <div>
            <label className="block font-semibold mb-1">Obrok</label>
            <input
              type="text"
              name="meal"
              value={currentEntry.meal}
              readOnly
              className="form-input w-full bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Mood before eating */}
          <div>
            <label className="block font-semibold mb-1">Raspoloženje prije obroka</label>
            <select
              name="beforeMood"
              value={currentEntry.beforeMood}
              onChange={handleChange}
              className="form-input w-full"
              required
            >
              <option value="">Odaberi...</option>
              <option value="sretan">Sretan</option>
              <option value="energican">Energičan</option>
              <option value="umoran">Umoran</option>
              <option value="ljut">Ljut</option>
            </select>
          </div>

          {/* Mood after eating */}
          <div>
            <label className="block font-semibold mb-1">Raspoloženje nakon obroka</label>
            <select
              name="afterMood"
              value={currentEntry.afterMood}
              onChange={handleChange}
              className="form-input w-full"
              required
            >
              <option value="">Odaberi...</option>
              <option value="gladan">Gladan</option>
              <option value="sit">Sit</option>
              <option value="mucnina">Mučnina</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="recipe-card-actions">
            <button type="submit" className="button1">
              Spremi raspoloženje
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="button2"
            >
              Odustani
            </button>
          </div>
        </form>
      </div>

      {/* Previous entries Card */}
      {entries.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
          <h2 className="font-semibold text-xl mb-2">Zadnji unosi</h2>
          <ul className="list-disc pl-5">
            {entries.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.meal}</strong>: prije: {entry.beforeMood}, nakon: {entry.afterMood} 
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FoodMoodJournal;