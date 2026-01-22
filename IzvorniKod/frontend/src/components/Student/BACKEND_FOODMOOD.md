# API Dokumentacija – External Expenses & Completed Meals

### POST /api/completed-meals
Endpoint za označavanje recepta kao završenog.


**Tijelo zahtjeva:**  
{ "recipe_id": 123 }

**Tijelo odgovora (success):**  
{ "success": true }

**Tijelo odgovora (error):**  
{ "success": false, "error": "Opis greške" }

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

### POST /api/external-expenses
Dodavanje vanjskog troška.

**Tijelo zahtjeva:**  
{ "amount": 5.5, "spent_at": "2026-01-22" }

**Tijelo odgovora (success):**  
{
  "success": true,
  "expense": {
    "external_expense_id": 1,
    "user_id": 123,
    "amount": 5.5,
    "spent_at": "2026-01-22"
  }
}

**Tijelo odgovora (error):**  
{ "success": false, "error": "Opis greške" }

**SQL integracija:**
-- 1. Provjeri da su podaci validni (amount > 0, datum u ispravnom formatu)

-- 2. Insert u external_expenses
INSERT INTO external_expenses (
    user_id,      -- iz tokena/sessiona
    amount,       -- iz request body-a
    spent_at,     -- iz request body-a
    created_at
)
VALUES (
    <user_id>,
    <amount>,
    '<spent_at>',
    CURRENT_TIMESTAMP
);

### GET /api/external-expenses?date=YYYY-MM-DD
Dohvat vanjskih troškova za određeni datum (današnji total).

**Query params:**  
date – string u formatu YYYY-MM-DD  

**Tijelo odgovora:**  
[
  { "external_expense_id": 1, "amount": 5.5, "spent_at": "2026-01-22" },
  { "external_expense_id": 2, "amount": 3.0, "spent_at": "2026-01-22" }
]

### GET /api/completed-meals?week_start=YYYY-MM-DD
Dohvat tjednih podataka za completed meals.  

week_start je datum prvog dana tjedna (ponedjeljak). Backend vraća sve obroke tog korisnika od week_start do week_start + 6 dana.

**Tijelo odgovora:**  
[
  { "complted_meal_id": 1, "price_at_time": 3.5, "date": "2026-01-20" },
  { "complted_meal_id": 2, "price_at_time": 4.0, "date": "2026-01-21" }
]

### GET /api/external-expenses?week_start=YYYY-MM-DD
Dohvat tjednih podataka za vanjske troškove.  

Backend vraća sve vanjske troškove tog korisnika u tom tjednu.

**Tijelo odgovora:**  
[
  { "external_expense_id": 1, "amount": 5.5, "spent_at": "2026-01-20" },
  { "external_expense_id": 2, "amount": 3.0, "spent_at": "2026-01-21" }
]
