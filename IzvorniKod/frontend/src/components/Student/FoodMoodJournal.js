import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/student.css";
import { Api } from "../../services/api"; 

function FoodMoodJournal() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedRecipe = location.state?.selectedRecipe || null;

  const [rating, setRating] = useState(0);
  const [beforeMood, setBeforeMood] = useState("");
  const [afterMood, setAfterMood] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRecipe) {
      // If user landed here without selecting a recipe, go back
      navigate(-1);
    }
  }, [selectedRecipe, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipe) return;

    try {
      setLoading(true);

      // Send rating if set
      if (rating > 0) {
        await Api.post(`/recipes/${selectedRecipe.id}/rating`, { rating });
      }

      // Send mood if both moods are selected
      if (beforeMood && afterMood) {
        await Api.post("/food-mood", {
          recipeId: selectedRecipe.id,
          beforeMood,
          afterMood,
          notes,
        });
      }

      alert("Vaš unos je spremljen!");
      navigate(-1); // back to previous page
    } catch (e) {
      console.error(e);
      alert("Greška pri spremanju unosa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="food-mood-journal p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {selectedRecipe ? selectedRecipe.title : "Food Mood Journal"}
      </h1>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="form-group">
            <label className="form-label">Ocijeni recept</label>
            <div className="tag-cloud">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`pill ${n <= rating ? "selected" : ""}`}
                  onClick={() => setRating(n)}
                  style={{ cursor: "pointer" }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* Mood before eating */}
          <div className="form-group">
            <label className="form-label">Raspoloženje prije obroka</label>
            <select
              value={beforeMood}
              onChange={(e) => setBeforeMood(e.target.value)}
              className="form-input"
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
          <div className="form-group">
            <label className="form-label">Raspoloženje nakon obroka</label>
            <select
              value={afterMood}
              onChange={(e) => setAfterMood(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Odaberi...</option>
              <option value="sit">Sit</option>
              <option value="gladan">Gladan</option>
              <option value="mucnina">Mučnina</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Bilješke</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              placeholder="Kako si se osjećao?"
            />
          </div>

          {/* Action buttons */}
          <div className="form-row mt-4">
            <button
              type="button"
              className="recipeview-footer-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Odustani
            </button>
            <button
              type="submit"
              className="recipeview-footer-btn recipeview-footer-btn-primary"
              disabled={loading}
            >
              Spremi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FoodMoodJournal;
