import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/student.css";
import { Api } from "../../services/api";

// ✅ mapping: string → int (jer mood_before/mood_after su INT u bazi)
const BEFORE_MOOD_TO_INT = {
  sretan: 5,
  energican: 4,
  umoran: 2,
  ljut: 1,
};

const AFTER_MOOD_TO_INT = {
  sit: 5,
  gladan: 2,
  mucnina: 1,
};

function FoodMoodJournal() {
  const location = useLocation();
  const navigate = useNavigate();

  // očekujemo da dolazi iz StudentRecipeCard preko navigate state
  const selectedRecipe = location.state?.selectedRecipe || null;

  const [rating, setRating] = useState(0); // trenutno samo UI, ne spremamo
  const [beforeMood, setBeforeMood] = useState("");
  const [afterMood, setAfterMood] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // ako user otvori journal bez recepta
  if (!selectedRecipe) {
    return (
      <div className="food-mood-journal p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Food Mood Journal</h1>
        <div className="form-section">
          <p style={{ marginBottom: 16 }}>
            Odaberi recept (npr. iz Javne arhive ili Tjednog plana) i klikni na ikonu
            za Food Mood Journal kako bi unio raspoloženje.
          </p>
          <button
            type="button"
            className="recipeview-footer-btn"
            onClick={() => navigate("/student")}
          >
            Nazad
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const mood_before = BEFORE_MOOD_TO_INT[beforeMood];
      const mood_after = AFTER_MOOD_TO_INT[afterMood];

      // safety check (iako imamo required)
      if (!mood_before || !mood_after) {
        alert("Molimo odaberite raspoloženje prije i nakon obroka.");
        return;
      }

      await Api.createMoodEntry({
        consumed_at: new Date().toISOString(),
        recipe_id: selectedRecipe.id,
        mood_before,
        mood_after,
        notes,
      });

      alert("Vaš unos je spremljen!");
      navigate(-1);
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert(err?.response?.data?.message || "Greška pri spremanju unosa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="food-mood-journal p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {selectedRecipe?.title || "Food Mood Journal"}
      </h1>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating (opcionalno UI) */}
          <div className="form-group">
            <label className="form-label">Ocijeni recept (opcionalno)</label>
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

          {/* Mood before */}
          <div className="form-group">
            <label className="form-label">Raspoloženje prije obroka</label>
            <select
              value={beforeMood}
              onChange={(e) => setBeforeMood(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            >
              <option value="">Odaberi...</option>
              <option value="sretan">Sretan</option>
              <option value="energican">Energičan</option>
              <option value="umoran">Umoran</option>
              <option value="ljut">Ljut</option>
            </select>
          </div>

          {/* Mood after */}
          <div className="form-group">
            <label className="form-label">Raspoloženje nakon obroka</label>
            <select
              value={afterMood}
              onChange={(e) => setAfterMood(e.target.value)}
              className="form-input"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Buttons */}
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
              {loading ? "Spremam..." : "Spremi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FoodMoodJournal;
