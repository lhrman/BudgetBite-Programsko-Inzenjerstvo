# Vodič za integraciju recepata

Ovaj dokument definira sučelje između novog strukturiranog Creator obrasca i Backend API-ja.

## Potrebni endpointi

### 1. GET /api/ingredients

Dohvati sve sastojke s njihovim ID-ovima i mjernim jedinicama.

**Tijelo odgovora:**

```json
[
  {
    "ingredient_id": 1,
    "name": "Piletina",
    "default_unit": "g",
    "category": "Meso"
  },
  {
    "ingredient_id": 125,
    "name": "Jaje",
    "default_unit": "kom",
    "category": "Životinjski proizvodi"
  }
]
```

**SQL upit:**

```sql
SELECT ingredient_id, name, default_unit, category
FROM ingredient
ORDER BY name;
```

---

### 2. GET /api/equipment

Dohvati svu dostupnu kuhinjsku opremu.

**Tijelo odgovora:**

```json
[
  { "equipment_id": 1, "equipment_name": "Tava" },
  { "equipment_id": 4, "equipment_name": "Pećnica" }
]
```

**SQL upit:**

```sql
SELECT equipment_id, equipment_name
FROM equipment
ORDER BY equipment_name;
```

---

### 3. GET /api/allergens

Dohvati sve dostupne alergene.

**Tijelo odgovora:**

```json
[
  { "allergen_id": 1, "name": "Gluten" },
  { "allergen_id": 2, "name": "Laktoza" }
]
```

**SQL upit:**

```sql
SELECT allergen_id, name
FROM allergen
ORDER BY name;
```

---

### 4. GET /api/dietary-restrictions

Dohvati sve prehrambene restrikcije (vegetarijansko, veganske, bezglutensko...).

**Tijelo odgovora:**

```json
[
  { "restriction_id": 1, "restriction_name": "Vegetarijansko" },
  { "restriction_id": 2, "restriction_name": "Veganske" },
  { "restriction_id": 3, "restriction_name": "Bezglutensko" }
]
```

**SQL upit:**

```sql
SELECT restriction_id, restriction_name
FROM dietary_restriction
ORDER BY restriction_name;
```

---

### 5. GET /api/ingredients?search=<query>

Pretraživanje sastojaka po nazivu (autocomplete).

**Query parametar:** `search` (min 2 znaka)

**Primjer:** `/api/ingredients?search=bra`

**Tijelo odgovora:**

```json
[
  {
    "ingredient_id": 1,
    "name": "Brašno",
    "default_unit": "g",
    "category": "Pekarski"
  },
  {
    "ingredient_id": 15,
    "name": "Brazil orah",
    "default_unit": "kom",
    "category": "Orasi"
  }
]
```

**SQL upit:**

```sql
SELECT ingredient_id, name, default_unit, category
FROM ingredient
WHERE LOWER(name) LIKE LOWER('%' || $1 || '%')
ORDER BY name
LIMIT 10;
```

**Napomena:** Vraća maksimalno 10 rezultata koji sadrže traženi tekst (case-insensitive).

---

### 6. POST /api/ingredients

Dodavanje novog sastojka iz forme (kada creator tipka sastojak koji ne postoji u bazi).

**Tijelo zahtjeva:**

```json
{
  "name": "Grčki jogurt",
  "category": "Mliječni proizvodi"
}
```

**Pravila:**

- `name` je obavezan (trim, ne prazan)
- `category` je opcionalan (default "Ostalo" u bazi)
- `default_unit` se **NE šalje** → baza ga automatski postavlja na "g" (DEFAULT vrijednost)

**Duplikati:**

- U bazi postoji unique index na `LOWER(name)`
- Backend radi "create or return existing":
  - Ako insert prođe → vrati novi ingredient
  - Ako je konflikt (sastojak već postoji) → vrati postojeći ingredient

**SQL logika:**

```sql
INSERT INTO ingredient (name, category, default_unit)
VALUES ($1, $2, 'g')
ON CONFLICT (LOWER(name))
DO UPDATE SET name = EXCLUDED.name
RETURNING ingredient_id, name, default_unit, category;
```

**Success response (uvijek):**

```json
{
  "ingredient_id": 123,
  "name": "Grčki jogurt",
  "default_unit": "g",
  "category": "Mliječni proizvodi"
}
```

**Error response:**

```json
{
  "success": false,
  "message": "Greška pri dodavanju sastojka: [detalji]"
}
```

---

### 7. POST /api/recipes

Pošalji novi recept. Ovaj endpoint treba obraditi spremanje u više tablica:

- `recipe` (osnovni podaci)
- `recipe_ingredients` (sastojci recepta)
- `recipe_equipment` (oprema)
- `recipe_allergen` (alergeni)
- `recipe_restrictions` (prehrambene restrikcije)
- `recipe_media` (slike i videi)

**Očekivano tijelo zahtjeva:**

```json
{
  "recipe_name": "Brza Pasta Carbonara",
  "description": "Klasična talijanska tjestenina...",
  "prep_time_min": 20,
  "price_estimate": 5.5,
  "calories": 650,
  "protein": 25,
  "carbs": 70,
  "fats": 30,
  "ingredients": [
    { "ingredient_id": 113, "quantity": 200, "unit": "g" },
    { "ingredient_id": 125, "quantity": 2, "unit": "kom" }
  ],
  "equipmentIds": [2, 3],
  "allergenIds": [1, 4],
  "restrictionIds": [1, 3],
  "preparation_steps": "Skuhajte tjesteninu...\nPopržite pancetu...",
  "media": [
    { "media_type": "image", "media_url": "https://..." },
    { "media_type": "video", "media_url": "https://..." }
  ]
}
```

**Backend validacija:**

- `ingredients` mora imati barem 1 stavku
- `ingredient_id` mora postojati u tablici `ingredient`
- `quantity` > 0
- `unit` nije prazan (trim)

**Backend logika (transakcija - OBAVEZNO):**

```sql
BEGIN;

-- 1. Spremi osnovni recept
INSERT INTO recipe (recipe_name, description, prep_time_min, price_estimate, calories, protein, carbs, fats, preparation_steps, creator_id)
VALUES (...) RETURNING recipe_id;

-- 2. Spremi sastojke
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES
  (recipe_id, 113, 200, 'g'),
  (recipe_id, 125, 2, 'kom');

-- 3. Spremi opremu
INSERT INTO recipe_equipment (recipe_id, equipment_id)
VALUES
  (recipe_id, 2),
  (recipe_id, 3);

-- 4. Spremi alergene
INSERT INTO recipe_allergen (recipe_id, allergen_id)
VALUES
  (recipe_id, 1),
  (recipe_id, 4);

-- 5. Spremi prehrambene restrikcije
INSERT INTO recipe_restrictions (recipe_id, restriction_id)
VALUES
  (recipe_id, 1),
  (recipe_id, 3);

-- 6. Spremi medije
INSERT INTO recipe_media (recipe_id, media_type, media_url)
VALUES
  (recipe_id, 'image', 'https://...'),
  (recipe_id, 'video', 'https://...');

COMMIT;
```

**Napomena o `unit`:**

- Backend **NE dira** `unit` osim trimanja
- Backend ga sprema u `recipe_ingredients.unit` točno kako je creator poslao
- Kreator može poslati bilo koju jedinicu (g, ml, kom, žlica...) neovisno o `default_unit` iz `ingredient` tablice

**Success response:**

```json
{
  "success": true,
  "message": "Recept uspješno kreiran",
  "recipe_id": 101
}
```

**Error response:**

```json
{
  "success": false,
  "message": "Greška pri spremanju recepta: [detalji]"
}
```

**Ako išta pukne:** ROLLBACK i vratiti error (nema polu-upisa!)

---

### 8. GET /api/recipes/my

Dohvati sve recepte koje je kreirao trenutno prijavljeni korisnik (Creator).

**Autentikacija:** Potreban JWT token u Authorization headeru.

**Tijelo odgovora:**

```json
[
  {
    "recipe_id": 101,
    "recipe_name": "Piletina s povrćem",
    "description": "Opis...",
    "prep_time_min": 25,
    "price_estimate": 3.2,
    "average_rating": 4.5,
    "media": [{ "media_type": "image", "media_url": "https://..." }]
  }
]
```

**SQL upit:**

```sql
SELECT r.recipe_id, r.recipe_name, r.description, r.prep_time_min, r.price_estimate,
       AVG(rev.rating) as average_rating
FROM recipe r
LEFT JOIN review rev ON r.recipe_id = rev.recipe_id
WHERE r.creator_id = [trenutni_korisnik_id]
GROUP BY r.recipe_id
ORDER BY r.created_at DESC;
```

---

### 9. DELETE /api/recipes/:id

Briše određeni recept. Backend mora provjeriti pripada li recept prijavljenom kreatoru prije brisanja.

**Parametar:** `id` (recipe_id)

**Autentikacija:** Potreban JWT token.

**Success response:**

```json
{
  "success": true,
  "message": "Recept uspješno obrisan"
}
```

**Error response (ako recept nije kreatorov):**

```json
{
  "success": false,
  "message": "Nemate dozvolu za brisanje ovog recepta"
}
```

---

### 10. Profil i Statistika

#### GET /api/creator/stats

Dohvaća agregirane podatke za kreatora.

**Tijelo odgovora:**

```json
{
  "recipeCount": 12,
  "avgRating": 4.7
}
```

**SQL upit:**

```sql
SELECT
  COUNT(r.recipe_id) as recipeCount,
  AVG(rev.rating) as avgRating
FROM recipe r
LEFT JOIN review rev ON r.recipe_id = rev.recipe_id
WHERE r.creator_id = [trenutni_korisnik_id];
```

---

#### PUT /api/auth/profile/name

Ažurira ime kreatora.

**Tijelo zahtjeva:**

```json
{
  "name": "Novo Ime"
}
```

**Success response:**

```json
{
  "success": true,
  "message": "Ime uspješno ažurirano"
}
```

---

## Mapiranje UI na API (adapters.js)

Frontend koristi `toCreateRecipePayload(form)` u `src/services/adapters.js` za transformaciju React stanja u JSON strukturu prikazanu iznad.

- **Sastojci**: UI automatski učitava `default_unit` iz baze podataka, ali šalje `ingredient_id`, `quantity` i `unit` backendu.
- **Koraci pripreme**: Šalju se kao jedan string (`preparation_steps`) spojen novim redovima (`\n`).
- **Nutritivne informacije**: Šalju se kao ravni numerički stupci (uključujući `fats`).
- **Lista recepata**: `mapRecipe` u `adapters.js` pretvara backend objekte (npr. `recipe_name`) u camelCase koji koristi frontend (`title`).

---

## Što se sprema gdje (da nema zabune)

### Tablica `ingredient`

- `name` = naziv sastojka
- `default_unit` = "g" za sve nove sastojke (automatski iz baze)
- `category` = za grupiranje u UI-u (npr. "Meso", "Povrće")

### Tablica `recipe_ingredients`

- `quantity` = broj (npr. 200, 2, 0.5)
- `unit` = stvarna jedinica za taj recept (creatorova) - npr. "g", "ml", "kom", "žlica"
- `(recipe_id, ingredient_id)` je primarni ključ (nema duplikata istog sastojka u istom receptu)

---

## Frontend UX Detalji

### Autocomplete Ponašanje

- Dok creator tipka u polje "Sastojak", frontend šalje `GET /api/ingredients?search=<tekst>`
- **Debounce od 300ms** - čeka nakon zadnjeg keystroke-a prije slanja zahtjeva (smanjuje broj API poziva)
- Prikazuje dropdown rezultata s formatom: `{name} ({category})`
- Ako nema rezultata: dropdown prikazuje opciju "+ Dodaj '<uneseni_tekst>'"

### Dodavanje Novog Sastojka

Kada creator klikne "+ Dodaj":

1. Frontend otvara modal s poljima:
   - `name` (već popunjen s onim što je creator upisao)
   - `category` (opcionalno)
   - **NE pita** `default_unit` (baza ga automatski postavlja na "g")
2. Frontend šalje `POST /api/ingredients`
3. Backend vraća kompletan ingredient objekt
4. Frontend automatski:
   - Popunjava ingredient u trenutnom retku
   - Postavlja `unit` na `default_unit` iz odgovora (obično "g")
   - **Stavlja fokus na polje "Količina"** (UX optimizacija)

### Unit Selection

- Creator može birati/mijenjati mjernu jedinicu iz dropdowna
- Dostupne jedinice: `g`, `kg`, `ml`, `l`, `dl`, `kom`, `žlica`, `žličica`, `šalica`, `prstohvat`
- Automatski se predlaže `default_unit` iz baze, ali creator **MOŽE PROMIJENITI** ako treba
- Primjer: Ingredient "Jaja" ima `default_unit = "kom"`, ali creator može promijeniti na "žlica" ako mu treba

### Validacija Prije Submita

Za svaki red sastojka:

- Mora postojati `ingredient_id`
- `quantity` > 0
- `unit` nije prazan (trim)

Ako nešto fali → blokira submit i prikazuje error poruku: "Molimo unesite sve sastojke, količine i jedinice."

---

## Važne napomene

1. **Transakcije**: POST /api/recipes **MORA** koristiti SQL transakciju - ako išta pukne, rollback sve.
2. **Autentikacija**: Svi endpointi osim GET lookup endpointa (#1-5) zahtijevaju JWT token.
3. **Validacija**: Backend mora validirati da `creator_id` iz tokena odgovara korisniku koji šalje zahtjev.
4. **Error handling**: Uvijek vraćaj strukturirane error poruke s `success: false`.
5. **CORS**: Omogući CORS za frontend (localhost:3000 u developmentu).
6. **Duplikati sastojaka**: Unique index na `LOWER(ingredient.name)` sprječava duplikate (case-insensitive).
7. **Unit handling**: Backend samo trima `unit`, ali ga **NE mijenja** - sprema točno što creator pošalje.

---

## Testiranje

Za testiranje endpointa koristi:

- **Postman** ili **Insomnia**
- Primjer JWT tokena možeš dobiti prijavljujući se kao Creator na frontendu
- Kopiraj token iz localStorage (F12 → Application → Local Storage → token)
- Stavi token u Authorization header kao `Bearer <token>`

### Primjer testiranja POST /api/ingredients:

**Request:**

```http
POST http://localhost:3001/api/ingredients
Content-Type: application/json

{
  "name": "Avokado",
  "category": "Voće"
}
```

**Expected Response:**

```json
{
  "ingredient_id": 156,
  "name": "Avokado",
  "default_unit": "g",
  "category": "Voće"
}
```

### Primjer testiranja GET /api/ingredients?search=:

**Request:**

```http
GET http://localhost:3001/api/ingredients?search=pas
```

**Expected Response:**

```json
[
  {
    "ingredient_id": 42,
    "name": "Pasta",
    "default_unit": "g",
    "category": "Tjestenina"
  },
  {
    "ingredient_id": 87,
    "name": "Papar",
    "default_unit": "g",
    "category": "Začini"
  }
]
```

---

## Sažetak endpointa

| #   | Metoda | Endpoint                      | Opis                             | Auth |
| --- | ------ | ----------------------------- | -------------------------------- | ---- |
| 1   | GET    | /api/ingredients              | Dohvati sve sastojke             | ❌   |
| 2   | GET    | /api/equipment                | Dohvati svu opremu               | ❌   |
| 3   | GET    | /api/allergens                | Dohvati sve alergene             | ❌   |
| 4   | GET    | /api/dietary-restrictions     | Dohvati prehrambene restrikcije  | ❌   |
| 5   | GET    | /api/ingredients?search=query | Pretraži sastojke (autocomplete) | ❌   |
| 6   | POST   | /api/ingredients              | Dodaj novi sastojak              | ✅   |
| 7   | POST   | /api/recipes                  | Kreiraj novi recept              | ✅   |
| 8   | GET    | /api/recipes/my               | Dohvati recepte kreatora         | ✅   |
| 9   | DELETE | /api/recipes/:id              | Obriši recept                    | ✅   |
| 10  | GET    | /api/creator/stats            | Statistika kreatora              | ✅   |
| 11  | PUT    | /api/auth/profile/name        | Ažuriraj ime kreatora            | ✅   |

---

**Frontend je potpuno implementiran i spreman za spajanje s ovim endpointima!** 🚀
