import { useEffect, useState } from "react";
import { Api } from "../services/api";
import StudentRecipeCard from "../components/Student/StudentRecipeCard";
import "../styles/creator.css";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Api.listPublicRecipes()
      .then((data) => setRecipes(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e);
        setError("Ne mogu dohvatiti recepte.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="recipes-loading">Učitavanje…</div>;
  }

  if (error) {
    return <div className="recipes-error">{error}</div>;
  }

  return (
    <div className="recipes-page">
      <h1 className="recipes-title">Recepti</h1>

      <div className="recipes-grid">
        {recipes.map((r) => (
          <StudentRecipeCard key={r.id ?? r._id} recipe={r} />
        ))}
      </div>
    </div>
  );
}
