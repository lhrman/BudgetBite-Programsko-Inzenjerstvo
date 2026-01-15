import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Api } from "../services/api";
import "../styles/creator.css";

export default function RecipeView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [staticData, setStaticData] = useState({ equipment: [], allergens: [], restrictions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [r, s] = await Promise.all([
          Api.getRecipeById(id),
          Api.getRecipeStaticData(),
        ]);

        if (!alive) return;

        setRecipe(r);
        setStaticData({
          equipment: s?.equipment || [],
          allergens: s?.allergens || [],
          restrictions: s?.restrictions || [],
        });
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

  const equipmentById = useMemo(() => {
    const m = new Map();
    staticData.equipment.forEach((x) => m.set(x.equipment_id, x.equipment_name));
    return m;
  }, [staticData.equipment]);

  const allergensById = useMemo(() => {
    const m = new Map();
    staticData.allergens.forEach((x) => m.set(x.allergen_id, x.name));
    return m;
  }, [staticData.allergens]);

  const restrictionsById = useMemo(() => {
    const m = new Map();
    staticData.restrictions.forEach((x) => m.set(x.restriction_id, x.name));
    return m;
  }, [staticData.restrictions]);

  if (loading) return <div className="recipes-loading">Učitavanje…</div>;
  if (error) return <div className="recipes-error">{error}</div>;
  if (!recipe) return <div className="recipes-error">Recept nije pronađen.</div>;

  // ---- Adaptacija naziva (da preživi i ako backend koristi druga imena) ----
  const name = recipe.recipe_name ?? recipe.title ?? "Bez naziva";
  const description = recipe.description ?? "";
  const prepTime = recipe.prep_time_min ?? recipe.prepTime ?? "";
  const price = recipe.price_estimate ?? recipe.price ?? "";
  const calories = recipe.calories ?? "";
  const protein = recipe.protein ?? "";
  const carbs = recipe.carbs ?? "";
  const fat = recipe.fat ?? "";
  const imageUrl = recipe.image_url ?? recipe.imageUrl ?? recipe.image ?? "";
  const videoUrl = recipe.video_url ?? recipe.videoUrl ?? "";

  const ingredients = recipe.ingredients ?? []; // očekujemo array
  const steps = recipe.steps ?? []; // očekujemo array stringova

  // očekujemo ID liste (ako backend vraća drugačije, samo prilagodi ovdje)
  const equipmentIds = recipe.equipment_ids ?? recipe.selectedEquipmentIds ?? [];
  const allergenIds = recipe.allergen_ids ?? recipe.selectedAllergenIds ?? [];
  const restrictionIds = recipe.restriction_ids ?? recipe.selectedRestrictionIds ?? [];

  return (
    <div className="add-recipe-section">
      <div className="recipeview-header">
        <button className="recipeview-back" type="button" onClick={() => navigate(-1)}>
          ← Natrag
        </button>
        <h1 className="add-recipe-title">{name}</h1>
      </div>

      {/* CARD A: Osnovne informacije */}
      <div className="form-section">
        <h2 className="form-section-title">Osnovne informacije</h2>

        {imageUrl ? (
          <div className="recipeview-image">
            <img src={imageUrl} alt={name} />
          </div>
        ) : null}

        {description ? (
          <div className="recipeview-description">{description}</div>
        ) : null}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vrijeme (min)</label>
            <div className="recipeview-value">{prepTime || "—"}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Cijena (€)</label>
            <div className="recipeview-value">{price === "" ? "—" : Number(price).toFixed(2)}</div>
          </div>
        </div>

        <label className="form-label recipeview-blocklabel">Nutritivne vrijednosti (po porciji)</label>

        <div className="nutrition-grid">
          <div className="form-group">
            <small className="form-label">Kalorije</small>
            <div className="recipeview-value">{calories || "—"}</div>
          </div>
          <div className="form-group">
            <small className="form-label">Proteini (g)</small>
            <div className="recipeview-value">{protein || "—"}</div>
          </div>
          <div className="form-group">
            <small className="form-label">Ugljikohidrati (g)</small>
            <div className="recipeview-value">{carbs || "—"}</div>
          </div>
          <div className="form-group">
            <small className="form-label">Masti (g)</small>
            <div className="recipeview-value">{fat || "—"}</div>
          </div>
        </div>

        {videoUrl ? (
          <div className="recipeview-video">
            <label className="form-label">Video</label>
            <a className="recipeview-link" href={videoUrl} target="_blank" rel="noreferrer">
              {videoUrl}
            </a>
          </div>
        ) : null}
      </div>

      {/* CARD B: Sastojci */}
      <div className="form-section">
        <h2 className="form-section-title">Popis sastojaka</h2>

        {ingredients.length === 0 ? (
          <div className="recipeview-muted">Nema sastojaka.</div>
        ) : (
          <div className="recipeview-list">
            {ingredients.map((ing, idx) => {
              const ingName = ing.name ?? ing.ingredient_name ?? ing.ingredient?.name ?? "Sastojak";
              const qty = ing.quantity ?? "";
              const unit = ing.unit ?? "";
              return (
                <div className="recipeview-list-item" key={idx}>
                  <div className="recipeview-list-left">{ingName}</div>
                  <div className="recipeview-list-right">
                    {qty} {unit}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CARD C: Oprema / Alergeni / Restrikcije */}
      <div className="form-section">
        <h2 className="form-section-title">Oprema, Alergeni i Prehrambene restrikcije</h2>

        <div className="form-group">
          <label className="form-label">Kuhinjska oprema</label>
          <div className="tag-cloud">
            {(equipmentIds.length ? equipmentIds : []).map((eid) => (
              <div key={eid} className="pill selected">
                {equipmentById.get(eid) ?? `#${eid}`}
              </div>
            ))}
            {equipmentIds.length === 0 && <div className="recipeview-muted">Nije navedeno.</div>}
          </div>
        </div>

        <div className="form-group recipeview-mt">
          <label className="form-label">Alergeni</label>
          <div className="tag-cloud">
            {(allergenIds.length ? allergenIds : []).map((aid) => (
              <div key={aid} className="pill selected">
                {allergensById.get(aid) ?? `#${aid}`}
              </div>
            ))}
            {allergenIds.length === 0 && <div className="recipeview-muted">Nije navedeno.</div>}
          </div>
        </div>

        <div className="form-group recipeview-mt">
          <label className="form-label">Prehrambene restrikcije</label>
          <div className="tag-cloud">
            {(restrictionIds.length ? restrictionIds : []).map((rid) => (
              <div key={rid} className="pill selected">
                {restrictionsById.get(rid) ?? `#${rid}`}
              </div>
            ))}
            {restrictionIds.length === 0 && <div className="recipeview-muted">Nije navedeno.</div>}
          </div>
        </div>
      </div>

      {/* CARD D: Koraci */}
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

        {/* FOOTER ACTIONS */}
<div className="recipeview-footer">
  <button
    type="button"
    className="recipeview-footer-btn recipeview-footer-btn-primary"
    onClick={() => {
      navigate(-1);
    }}
  >
    Odrađeno
  </button>

  <button
    type="button"
    className="recipeview-footer-btn"
    onClick={() => {
      console.log("Log Mood: ", recipe);
    }}
  >
    Log Mood
  </button>
</div>


    </div>
  );
}
