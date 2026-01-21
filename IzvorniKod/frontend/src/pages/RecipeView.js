import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Api } from "../services/api";
import { mapRecipeList } from "../services/adapters";
import { useNotifications } from "../context/NotificationContext";
import "../styles/creator.css";

function getRoleFromToken() {
  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token"); // fallback

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role ?? null;
  } catch (e) {
    return null;
  }
}




export default function RecipeView({ embedded = false, recipeId }) {
  const params = useParams();
  const id = embedded ? recipeId : params.id;
  const navigate = useNavigate();

  const role = getRoleFromToken();
  const isStudent = role === "student";
  const { addNotification } = useNotifications();


  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listImageUrl, setListImageUrl] = useState(null);


  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await Api.getFullRecipe(id);
        if (!alive) return;

        setRecipe(data);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("Ne mogu dohvatiti recept.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
  let alive = true;

  const loadImageFromList = async () => {
    try {
      const data = await Api.listPublicRecipes();
      if (!alive) return;

      const mapped = (Array.isArray(data) ? data : []).map(mapRecipeList);

      const match = mapped.find(
        (r) => String(r.id) === String(id)
      );

      setListImageUrl(match?.image ?? null);
    } catch (e) {
      console.error("Ne mogu dohvatiti sliku iz liste:", e);
    }
  };

  loadImageFromList();
  return () => {
    alive = false;
  };
}, [id]);


  if (loading) return <div className="recipes-loading">Učitavanje…</div>;
  if (error) return <div className="recipes-error">{error}</div>;
  if (!recipe) return <div className="recipes-error">Recept nije pronađen.</div>;

  // --- Normalizacija ---
  const name = recipe.recipe_name ?? "Bez naziva";
  const description = recipe.description ?? "";
  const prepTime = recipe.prep_time_min ?? "—";
  const price =
    recipe.price_estimate !== null && recipe.price_estimate !== undefined
      ? Number(recipe.price_estimate).toFixed(2)
      : "—";

  const calories = recipe.calories ?? "—";
  const protein = recipe.protein ?? "—";
  const carbs = recipe.carbs ?? "—";
  const fats = recipe.fats ?? "—";

  const imageUrl =
  recipe.media?.find((m) => m.media_type === "image")?.media_url ??
  recipe.image_url ??
  listImageUrl ??
  null;

  const videoUrl =
    recipe.media?.find((m) => m.media_type === "video")?.media_url ?? null;

  const ingredients = recipe.ingredients ?? [];
  const equipment = recipe.equipment ?? [];
  const allergens = recipe.allergens ?? [];
  const restrictions = recipe.restrictions ?? [];

  const steps = recipe.preparation_steps
    ? recipe.preparation_steps.split("\n")
    : [];

  return (
    <div className="add-recipe-section">
      {/* HEADER */}
      <div className="recipeview-header">

        <h1 className="add-recipe-title">{name}</h1>
      </div>

      {/* OSNOVNE INFORMACIJE */}
      <div className="form-section">
        <h2 className="form-section-title">Osnovne informacije</h2>

        {imageUrl && (
          <div className="recipeview-image">
            <img src={imageUrl} alt={name} />
          </div>
        )}

        {description && (
          <div className="recipeview-description">{description}</div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vrijeme (min)</label>
            <div className="recipeview-value">{prepTime}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Cijena (€)</label>
            <div className="recipeview-value">{price}</div>
          </div>
        </div>

        <label className="form-label recipeview-blocklabel">
          Nutritivne vrijednosti (po porciji)
        </label>

        <div className="nutrition-grid">
          <div className="form-group">
            <small className="form-label">Kalorije</small>
            <div className="recipeview-value">{calories}</div>
          </div>
          <div className="form-group">
            <small className="form-label">Proteini (g)</small>
            <div className="recipeview-value">{protein}</div>
          </div>
          <div className="form-group">
            <small className="form-label">Ugljikohidrati (g)</small>
            <div className="recipeview-value">{carbs}</div>
          </div>
          <div className="form-group">
            <small className="form-label">Masti (g)</small>
            <div className="recipeview-value">{fats}</div>
          </div>
        </div>

        {videoUrl && (
          <div className="recipeview-video">
            <label className="form-label">Video</label>
            <a
              className="recipeview-link"
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              {videoUrl}
            </a>
          </div>
        )}
      </div>

      {/* SASTOJCI */}
      <div className="form-section">
        <h2 className="form-section-title">Popis sastojaka</h2>

        {ingredients.length === 0 ? (
          <div className="recipeview-muted">Nema sastojaka.</div>
        ) : (
          <div className="recipeview-list">
            {ingredients.map((ing, idx) => (
              <div className="recipeview-list-item" key={idx}>
                <div className="recipeview-list-left">{ing.name}</div>
                <div className="recipeview-list-right">
                  {ing.quantity} {ing.unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OPREMA / ALERGENI / RESTRIKCIJE */}
      <div className="form-section">
        <h2 className="form-section-title">
          Oprema, Alergeni i Prehrambene restrikcije
        </h2>

        <div className="form-group">
          <label className="form-label">Kuhinjska oprema</label>
          <div className="tag-cloud">
            {equipment.length === 0 ? (
              <div className="recipeview-muted">Nije navedeno.</div>
            ) : (
              equipment.map((e) => (
                <div key={e.equipment_id} className="pill selected">
                  {e.equipment_name}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-group recipeview-mt">
          <label className="form-label">Alergeni</label>
          <div className="tag-cloud">
            {allergens.length === 0 ? (
              <div className="recipeview-muted">Nije navedeno.</div>
            ) : (
              allergens.map((a) => (
                <div key={a.allergen_id} className="pill selected">
                  {a.name}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-group recipeview-mt">
          <label className="form-label">Prehrambene restrikcije</label>
          <div className="tag-cloud">
            {restrictions.length === 0 ? (
              <div className="recipeview-muted">Nije navedeno.</div>
            ) : (
              restrictions.map((r) => (
                <div key={r.restriction_id} className="pill selected">
                  {r.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KORACI */}
      <div className="form-section">
        <h2 className="form-section-title">Koraci pripreme</h2>

        {steps.length === 0 ? (
          <div className="recipeview-muted">Nema koraka.</div>
        ) : (
          <div className="recipeview-steps">
            {steps.map((s, idx) => (
              <div key={idx} className="step-row">
                <div className="step-number">{idx + 1}</div>
                <div className="recipeview-step-text">{s}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
        {/* FOOTER ACTIONS */}
      <div className="recipeview-footer">
      {isStudent && (
    <button
      type="button"
      className="recipeview-footer-btn recipeview-footer-btn-primary"
      onClick={() => {
  addNotification({
    type: "streak",
    title: "🔥 Streak povećan!",
    body: "Bravo! Sada imaš 5 dana u nizu.",
  });

  addNotification({
    type: "badge",
    title: "🏅 Novi badge!",
    body: "Osvojio/la si badge: Tjedni ratnik",
  });

  localStorage.setItem("finished_today", "true");

  // PRIVREMENO: NE REDIRECTAJ NIKAMO
  alert("Recept završen! (Food Mood Journal će se otvoriti kad backend proradi)");
}}


    >
      Završi
    </button>
  )}
</div>

    </div>
  );
}