# Vodič za integraciju recepata

Ovaj dokument definira sučelje između novog strukturiranog Creator obrasca i Backend API-ja.

## Potrebni endpointi

### 1. GET /api/ingredients
Dohvati sve sastojke s njihovim ID-ovima i mjernim jedinicama.
**Tijelo odgovora:**
```json
[
  { "ingredient_id": 1, "name": "Piletina", "default_unit": "g" },
  { "ingredient_id": 125, "name": "Jaje", "default_unit": "kom" }
]
```

### 2. GET /api/equipment
Dohvati svu dostupnu kuhinjsku opremu.
**Tijelo odgovora:**
```json
[
  { "equipment_id": 1, "equipment_name": "Tava" },
  { "equipment_id": 4, "equipment_name": "Pećnica" }
]
```

### 3. GET /api/allergens
Dohvati sve dostupne alergene.
**Tijelo odgovora:**
```json
[
  { "allergen_id": 1, "name": "Gluten" },
  { "allergen_id": 2, "name": "Laktoza" }
]
```

### 4. POST /api/recipes
Pošalji novi recept. Ovaj endpoint treba obraditi spremanje u više tablica (Recipe, recipe_ingredients, recipe_equipment, recipe_allergen, RECIPE_MEDIA).

Treba dodati takodje i success/error response

**Očekivano tijelo zahtjeva:**
```json
{
  "recipe_name": "Brza Pasta Carbonara",
  "description": "Klasična talijanska tjestenina...",
  "prep_time_min": 20,
  "price_estimate": 5.50,
  "calories": 650,
  "protein": 25,
  "carbs": 70,
  "fats": 30,
  "ingredients": [
    { "ingredient_id": 113, "quantity": 200 },
    { "ingredient_id": 125, "quantity": 2 }
  ],
  "equipmentIds": [2, 3],
  "allergenIds": [1, 4],
  "preparation_steps": "Skuhajte tjesteninu...\nPopržite pancetu...",
  "media": [
    { "media_type": "image", "media_url": "https://..." },
    { "media_type": "video", "media_url": "https://..." }
  ]
}
```

### 5. GET /api/recipes/my
Dohvati sve recepte koje je kreirao trenutno prijavljeni korisnik (Creator).
**Tijelo odgovora:**
```json
[
  {
    "recipe_id": 101,
    "recipe_name": "Piletina s povrćem",
    "description": "Opis...",
    "prep_time_min": 25,
    "price_estimate": 3.20,
    "average_rating": 4.5,
    "media": [
      { "media_type": "image", "media_url": "https://..." }
    ]
  }
]
```

### 6. DELETE /api/recipes/:id
Briše određeni recept. Backend mora provjeriti pripada li recept prijavljenom kreatoru prije brisanja.

### 7. Profil i Statistika

#### GET /api/creator/stats
Dohvaća agregirane podatke za kreatora.
**Tijelo odgovora:**
```json
{
  "recipeCount": 12,
  "avgRating": 4.7
}
```

#### PUT /api/auth/profile/name
Ažurira ime kreatora.
**Tijelo zahtjeva:**
```json
{
  "name": "Novo Ime"
}
```

## Mapiranje UI na API (adapters.js)
Frontend koristi `toCreateRecipePayload(form)` u `src/services/adapters.js` za transformaciju React stanja u JSON strukturu prikazanu iznad.

- **Sastojci**: UI automatski učitava `default_unit` iz baze podataka, ali šalje samo `ingredient_id` i `quantity` backendu.
- **Koraci pripreme**: Šalju se kao jedan string (`preparation_steps`) spojen novim redovima (`\n`).
- **Nutritivne informacije**: Šalju se kao ravni numerički stupci (uključujući `fats`).
- **Lista recepata**: `mapRecipe` u `adapters.js` pretvara backend objekte (npr. `recipe_name`) u camelCase koji koristi frontend (`title`).
