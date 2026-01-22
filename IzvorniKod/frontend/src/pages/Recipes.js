import { useEffect, useMemo, useState } from "react";
import { Api } from "../services/api";
import StudentRecipeCard from "../components/Student/StudentRecipeCard";
import "../styles/creator.css";
import { mapRecipeList } from "../services/adapters";

const CALORIE_RANGES = [
  { value: "0-300", label: "0–300 kcal", min: 0, max: 300 },
  { value: "301-500", label: "301–500 kcal", min: 301, max: 500 },
  { value: "501-700", label: "501–700 kcal", min: 501, max: 700 },
  { value: "701+", label: "701+ kcal", min: 701, max: Infinity },
];


export default function Recipes({ onOpenRecipe, onOpenFoodMoodJournal }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Search + filters
  const [query, setQuery] = useState("");
  const [timeMin, setTimeMin] = useState("2");
  const [timeMax, setTimeMax] = useState("30");
  const [calorieRange, setCalorieRange] = useState("all");

  
  useEffect(() => {
    Api.listPublicRecipes()
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : []).map(mapRecipeList);
        setRecipes(mapped);
      })
      .catch((e) => {
        console.error(e);
        setError("Ne mogu dohvatiti recepte.");
      })
      .finally(() => setLoading(false));
  }, []);

  const normalized = useMemo(() => {
  return recipes.map((r) => {
    const caloriesRaw =
      r?.nutrition?.calories ??
      r?.nutrition_calories ??
      r?.calories ??
      r?.kcal ??
      0;

    return {
      ...r,
      title: (r.title ?? r.recipe_name ?? "").toString(),
      prepTime: Number(r.prepTime ?? r.prep_time_min ?? r.prepTimeMin ?? 0),
      calories: Number(caloriesRaw),
    };
  });
}, [recipes]);


  const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  const pickedRange =
    calorieRange === "all"
      ? null
      : CALORIE_RANGES.find((x) => x.value === calorieRange) ?? null;

  const minT = timeMin === "" ? -Infinity : Number(timeMin);
  const maxT = timeMax === "" ? Infinity : Number(timeMax);

  return normalized.filter((r) => {
    if (q && !r.title.toLowerCase().includes(q)) return false;

    if (Number.isNaN(r.prepTime)) return false;
    if (r.prepTime < minT || r.prepTime > maxT) return false;

    if (pickedRange) {
      if (Number.isNaN(r.calories)) return false;
      if (r.calories < pickedRange.min || r.calories > pickedRange.max) return false;
    }

    return true;
  });
}, [normalized, query, timeMin, timeMax, calorieRange]);



  const resetAll = () => {
    setQuery("");
    setTimeMin("2");
    setTimeMax("30");
    setCalorieRange("all");
  };

  const closeDrawer = () => setDrawerOpen(false);
  const openDrawer = () => setDrawerOpen(true);

  if (loading) return <div className="recipes-loading">Učitavanje…</div>;
  if (error) return <div className="recipes-error">{error}</div>;

  return (
    <div className="recipes-page">
      {/* TOP BAR */}
      <div className="recipes-topbar2">
        <div className="recipes-searchwrap2">
          <input
            className="recipes-search2"
            type="text"
            placeholder="Traži po imenu recepta…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="recipes-actions2">
          <button className="recipes-btn recipes-btn-primary" type="button" onClick={openDrawer}>
            Filtriraj
          </button>
          <button className="recipes-btn" type="button" onClick={resetAll}>
            Resetiraj
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="recipes-grid">
        {filtered.map((r) => (
          <StudentRecipeCard
            key={r.id ?? r._id ?? r.recipe_id ?? r.recipe_name}
            recipe={r}
            onOpen={() => onOpenRecipe?.(r.id ?? r.recipe_id ?? r._id)}
            onOpenFoodMoodJournal={onOpenFoodMoodJournal}
      />
))}

      </div>

      {filtered.length === 0 && (
        <div className="recipes-empty">Nema recepata koji odgovaraju tražilici/filterima.</div>
      )}

      {/* OVERLAY */}
      {drawerOpen && <div className="recipes-overlay" onClick={closeDrawer} />}

      {/* SIDEBAR / DRAWER */}
      <aside className={`recipes-drawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="recipes-drawer-header">
          <div className="recipes-drawer-title">Filtri</div>
          <button className="recipes-drawer-close" type="button" onClick={closeDrawer}>
            ✕
          </button>
        </div>

        <div className="recipes-drawer-content">
          {/* Trajanje */}
          <div className="recipes-filter-section">
            <div className="recipes-filter-title">Trajanje (min)</div>

            <div className="recipes-time-row">
              <div className="recipes-time-field">
                <label className="recipes-label">Od</label>
                <input
  className="recipes-number"
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Od"
  value={timeMin}
  onChange={(e) => {
    // dozvoli samo znamenke ili prazno
    const v = e.target.value.replace(/\D/g, "");
    setTimeMin(v);
  }}
/>
              </div>

              <div className="recipes-time-field">
                <label className="recipes-label">Do</label>
                <input
  className="recipes-number"
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Do"
  value={timeMax}
  onChange={(e) => {
    const v = e.target.value.replace(/\D/g, "");
    setTimeMax(v);
  }}
/>
              </div>
            </div>
          </div>

          {/* Kalorije */}
          <div className="recipes-filter-section">
            <div className="recipes-filter-title">Kalorije</div>

            <select
              className="recipes-select"
              value={calorieRange}
              onChange={(e) => setCalorieRange(e.target.value)}
            >
              <option value="all">Sve</option>
              {CALORIE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="recipes-drawer-footer">
          <div className="recipes-count">
            Pronađeno: <strong>{filtered.length}</strong>
          </div>

          <div className="recipes-drawer-footer-actions">
            <button className="recipes-btn" type="button" onClick={resetAll}>
              Resetiraj
            </button>
            <button className="recipes-btn recipes-btn-primary" type="button" onClick={closeDrawer}>
              Gotovo
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
