### POST /api/completed-meals

Endpoint za označavanje recepta kao završenog.

**Tijelo zahtjeva:**

```json
{
  "recipe_id": <integer>
}

**Tijelo odgovora:**

{
  "success": true
}

**Tijelo odgovora (error):**
{
  "success": false,
  "error": "Opis greške"
}

**SQL integracija:**

-- 1. Provjeri da recept postoji i dohvatite cijenu
SELECT price_estimate
FROM recipe
WHERE recipe_id = <recipe_id>;

-- 2. Insert u completed_meals
INSERT INTO completed_meals (
    user_id,         -- iz tokena/sessiona
    recipe_id,       -- iz request body-a
    price_at_time,   -- iz recipe.price_estimate
    completed_at,
    created_at
)
VALUES (
    <user_id>,
    <recipe_id>,
    <price_estimate>,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

