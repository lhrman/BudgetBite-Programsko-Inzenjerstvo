# Weekly Reflection - Backend Implementation Guide

## 📋 Pregled

Tjedna refleksija je nova funkcionalnost koja studentima omogućuje pregled njihovog napretka kroz tjedne. Frontend je spreman i koristi mock podatke. Ovaj dokument opisuje što backend tim treba implementirati.

---

## 🗄️ Promjene u bazi podataka

### 1. Dodavanje nove kolone u `reflection` tablicu

```sql
ALTER TABLE reflection
ADD COLUMN avg_mood DECIMAL(2,1);
```

**Objašnjenje:**

- `avg_mood` - prosječna ocjena raspoloženja za taj tjedan (1.0 - 5.0)
- Izračunava se iz `food_mood_journal` tablice

**Napomena:** Ostale potrebne kolone već postoje:

- `home_cooked_m` - broj napravljenih obroka (već postoji, koristi se kao `completed_meals`)
- Planiranih obroka je uvijek **21** (3 obroka × 7 dana) - hardcoded konstanta

---

## 🔄 Cron Job - Kreiranje tjednih refleksija

### Kada se izvršava:

**Svake nedjelje u 23:59**

### Za koga:

Za sve korisnike koji imaju meal plan za tjedan koji se upravo završava.

### Što računa:

#### 1. **total_spent** (ukupno potrošeno)

```sql
SELECT SUM(r.price_estimate) as total_spent
FROM food_mood_journal fmj
JOIN recipes r ON fmj.recipe_id = r.id
WHERE fmj.user_id = ?
  AND fmj.consumed_at BETWEEN ? AND ?
  AND fmj.recipe_id IN (
    SELECT recipe_id FROM mealplan_items
    WHERE user_id = ? AND week_start = ?
  )
```

#### 2. **home_cooked_m** (broj napravljenih/ocijenjenih obroka)

```sql
SELECT COUNT(DISTINCT fmj.recipe_id) as completed_meals
FROM food_mood_journal fmj
WHERE fmj.user_id = ?
  AND fmj.consumed_at BETWEEN ? AND ?
  AND fmj.recipe_id IN (
    SELECT recipe_id FROM mealplan_items
    WHERE user_id = ? AND week_start = ?
  )
```

**Napomena:** `home_cooked_m` = completed_meals = broj obroka koje je student napravio i ocijenio u food mood journal-u

#### 3. **avg_mood** (prosječno raspoloženje)

```sql
SELECT AVG((mood_before + mood_after) / 2.0) as avg_mood
FROM food_mood_journal
WHERE user_id = ?
  AND consumed_at BETWEEN ? AND ?
```

**Skala raspoloženja:**

- 1.0 - 5.0 (mood_before i mood_after su od 1 do 5)
- Prosijek se računa kao `(mood_before + mood_after) / 2`

#### 4. **Mood Breakdown** (kategorizacija raspoloženja)

Za svaki unos u `food_mood_journal`, izračunaj prosječan mood i kategoriziraj:

```javascript
function categorizeMood(avgMood) {
  if (avgMood >= 4.5) return "excellent";
  if (avgMood >= 3.5) return "good";
  if (avgMood >= 2.5) return "okay";
  return "bad";
}
```

Prebroj koliko unosa pada u koju kategoriju.

### Pseudo-kod Cron Job-a:

```javascript
async function createWeeklyReflections() {
  const today = new Date();
  const weekEnd = today; // nedjelja
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6); // 7 dana unatrag

  // Dohvati sve korisnike s meal planom za ovaj tjedan
  const users = await db.query(
    `
    SELECT DISTINCT user_id 
    FROM mealplan 
    WHERE week_start = ?
  `,
    [weekStart],
  );

  for (const user of users) {
    // 1. Izračunaj total_spent
    const totalSpent = await calculateTotalSpent(
      user.user_id,
      weekStart,
      weekEnd,
    );

    // 2. Izračunaj completed_meals (home_cooked_m)
    const completedMeals = await calculateCompletedMeals(
      user.user_id,
      weekStart,
      weekEnd,
    );

    // 3. Izračunaj avg_mood
    const avgMood = await calculateAvgMood(user.user_id, weekStart, weekEnd);

    // 4. Insert u reflection tablicu
    await db.query(
      `
      INSERT INTO reflection (
        user_id, 
        week_start, 
        total_spent, 
        home_cooked_m, 
        avg_mood
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [user.user_id, weekStart, totalSpent, completedMeals, avgMood],
    );
  }
}
```

---

## 🌐 API Endpoints

### 1. GET `/api/reflection/available-weeks`

**Opis:** Vraća listu svih završenih tjedana za trenutno prijavljenog studenta.

**Request:**

```
GET /api/reflection/available-weeks
Authorization: Bearer {token}
```

**Response:**

```json
{
  "weeks": ["2025-01-13", "2025-01-06", "2024-12-30", "2024-12-23"]
}
```

**SQL Query:**

```sql
SELECT week_start
FROM reflection
WHERE user_id = ?
ORDER BY week_start DESC
LIMIT 20
```

---

### 2. GET `/api/reflection/details?weekStart=YYYY-MM-DD`

**Opis:** Vraća sve podatke o refleksiji za specifičan tjedan.

**Request:**

```
GET /api/reflection/details?weekStart=2025-01-13
Authorization: Bearer {token}
```

**Response:**

```json
{
  "weekStart": "2025-01-13",
  "weekEnd": "2025-01-19",
  "totalSpent": 24.5,
  "homeCooked": 6,
  "avgMood": 4.2,
  "moodBreakdown": {
    "excellent": 2,
    "good": 8,
    "okay": 5,
    "bad": 1
  },
  "lastFourWeeks": [
    { "weekStart": "2024-12-30", "completionRate": 19.05 },
    { "weekStart": "2025-01-06", "completionRate": 23.81 },
    { "weekStart": "2025-01-13", "completionRate": 28.57 },
    { "weekStart": "2025-01-20", "completionRate": null }
  ]
}
```

**Backend logika:**

```javascript
async function getReflectionDetails(userId, weekStart) {
  // 1. Dohvati osnovne podatke iz reflection tablice
  const reflection = await db.query(
    `
    SELECT 
      week_start,
      total_spent,
      home_cooked_m,
      avg_mood
    FROM reflection
    WHERE user_id = ? AND week_start = ?
  `,
    [userId, weekStart],
  );

  // 2. Izračunaj weekEnd (week_start + 6 dana)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // 3. Izračunaj mood breakdown
  const moodEntries = await db.query(
    `
    SELECT (mood_before + mood_after) / 2.0 as avg_mood
    FROM food_mood_journal
    WHERE user_id = ?
      AND consumed_at BETWEEN ? AND ?
  `,
    [userId, weekStart, weekEnd],
  );

  const moodBreakdown = {
    excellent: 0,
    good: 0,
    okay: 0,
    bad: 0,
  };

  moodEntries.forEach((entry) => {
    if (entry.avg_mood >= 4.5) moodBreakdown.excellent++;
    else if (entry.avg_mood >= 3.5) moodBreakdown.good++;
    else if (entry.avg_mood >= 2.5) moodBreakdown.okay++;
    else moodBreakdown.bad++;
  });

  // 4. Dohvati zadnja 4 tjedna za graf
  const lastFourWeeks = await db.query(
    `
    SELECT 
      week_start,
      home_cooked_m,
      (home_cooked_m / 21.0 * 100) as completion_rate
    FROM reflection
    WHERE user_id = ?
      AND week_start <= ?
    ORDER BY week_start DESC
    LIMIT 3
  `,
    [userId, weekStart],
  );

  // Dodaj trenutni tjedan (ako nije završen)
  const currentWeekStart = getCurrentWeekStart();
  if (currentWeekStart > weekStart) {
    lastFourWeeks.push({
      weekStart: currentWeekStart,
      completionRate: null,
    });
  }

  // 5. Vrati podatke
  return {
    weekStart: reflection.week_start,
    weekEnd: weekEnd.toISOString().split("T")[0],
    totalSpent: parseFloat(reflection.total_spent),
    homeCooked: reflection.home_cooked_m,
    avgMood: parseFloat(reflection.avg_mood),
    moodBreakdown,
    lastFourWeeks: lastFourWeeks.reverse(), // najstariji prvo
  };
}
```

**Napomene:**

- `completionRate` se računa kao: `(home_cooked_m / 21) * 100`
- Broj 21 je fiksna konstanta (3 obroka × 7 dana)
- Trenutni (nezavršeni) tjedan ima `completionRate: null`

---

## 📊 Struktura podataka

### Reflection tablica (after changes):

| Kolona        | Tip          | Opis                                 |
| ------------- | ------------ | ------------------------------------ |
| user_id       | INTEGER      | ID studenta                          |
| week_start    | DATE         | Prvi dan tjedna (ponedjeljak)        |
| total_spent   | DECIMAL      | Ukupno potrošeno (€)                 |
| home_cooked_m | INTEGER      | Broj napravljenih/ocijenjenih obroka |
| avg_mood      | DECIMAL(2,1) | Prosječno raspoloženje (1.0-5.0)     |
| summary_text  | TEXT         | Dodatni tekst (optional)             |

### Konstante:

```javascript
const MEALS_PER_WEEK = 21; // 3 obroka × 7 dana
```

---

## 🔗 Frontend integracija

### Lokacija filea:

**File:** `src/components/Student/WeeklyReflection.js`

---

### ŠTO TREBA PROMIJENITI:

#### 1. **Dodati import za token (ako već ne postoji)**

Na vrh filea, dodaj import za AuthContext:

```javascript
import { useAuth } from "../../context/AuthContext"; // ili gdje god je AuthContext
```

I u komponenti:

```javascript
function WeeklyReflection() {
  const { token } = useAuth(); // ili kako god pristupate tokenu
  // ... ostali useState
```

---

#### 2. **Zamijeniti useEffect hook (linija ~44-52)**

**OBRISATI OVO:**

```javascript
// TODO: Replace with real API call
useEffect(() => {
  // Mock data - replace with: fetch('/api/reflection/available-weeks')
  const mockWeeks = ["2025-01-13", "2025-01-06", "2024-12-30", "2024-12-23"];
  setAvailableWeeks(mockWeeks);

  // Load first (most recent) week
  loadWeekData(mockWeeks[0]);
}, []);
```

**ZAMIJENITI SA:**

```javascript
useEffect(() => {
  const fetchAvailableWeeks = async () => {
    try {
      const response = await fetch("/api/reflection/available-weeks", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available weeks");
      }

      const data = await response.json();
      setAvailableWeeks(data.weeks);

      // Load first (most recent) week
      if (data.weeks.length > 0) {
        loadWeekData(data.weeks[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching available weeks:", error);
      setLoading(false);
      // TODO: Dodati error state i prikazati poruku korisniku
    }
  };

  fetchAvailableWeeks();
}, [token]);
```

---

#### 3. **Zamijeniti loadWeekData funkciju (linija ~54-79)**

**OBRISATI SVE mockData objekte i logiku:**

```javascript
const loadWeekData = async (weekStart) => {
  setLoading(true);

  // TODO: Replace with real API call
  // const response = await fetch(`/api/reflection/details?weekStart=${weekStart}`);
  // const data = await response.json();

  // Mock data
  const mockData = {
    weekStart: weekStart,
    weekEnd: calculateWeekEnd(weekStart),
    totalSpent: weekStart === "2025-01-13" ? 24.5 : 28.0,
    homeCooked: weekStart === "2025-01-13" ? 6 : 5,
    avgMood: weekStart === "2025-01-13" ? 4.2 : 3.8,
    moodBreakdown: {
      excellent: 2,
      good: 8,
      okay: 5,
      bad: 1,
    },
    lastFourWeeks: [
      { weekStart: "2024-12-30", completionRate: 19.05 }, // 4/21
      { weekStart: "2025-01-06", completionRate: 23.81 }, // 5/21
      { weekStart: "2025-01-13", completionRate: 28.57 }, // 6/21
      { weekStart: "2025-01-20", completionRate: null }, // current week
    ],
  };

  setReflectionData(mockData);
  setLoading(false);
};
```

**ZAMIJENITI SA:**

```javascript
const loadWeekData = async (weekStart) => {
  setLoading(true);

  try {
    const response = await fetch(
      `/api/reflection/details?weekStart=${weekStart}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reflection details");
    }

    const data = await response.json();
    setReflectionData(data);
  } catch (error) {
    console.error("Error loading week data:", error);
    // TODO: Dodati error state i prikazati poruku korisniku
  } finally {
    setLoading(false);
  }
};
```

---

#### 4. **OPCIONO: Dodati error state i prikaz**

Na vrh komponente, dodaj:

```javascript
const [error, setError] = useState(null);
```

U try-catch blokovima, postavi error:

```javascript
catch (error) {
  console.error('Error:', error);
  setError('Došlo je do greške pri učitavanju podataka. Molimo pokušajte ponovno.');
  setLoading(false);
}
```

I dodaj prikaz greške u JSX-u (nakon loading state-a):

```javascript
if (error) {
  return (
    <div className="weekly-reflection">
      <div className="error-state">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Pokušaj ponovno
        </button>
      </div>
    </div>
  );
}
```

---

### OPCIONO: CSS za error state

Dodaj u `student.css`:

```css
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
  color: #d32f2f;
}

.error-state button {
  background: var(--dark-green, #2d5016);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
```

---

## 📝 SAŽETAK - Što obrisati i dodati

### ❌ OBRISATI:

1. Mock podatke u `useEffect` hook-u (linija ~46-48)
2. Cijelu mock logiku u `loadWeekData` funkciji (linija ~58-75)
3. Sve `// TODO:` komentare nakon implementacije

### ✅ DODATI:

1. Import za `useAuth` hook (ili kako god pristupate tokenu)
2. Pravi API pozivi u `useEffect` i `loadWeekData`
3. Error handling (try-catch)
4. Error state i prikaz (opciono ali preporučeno)

### ✅ ZADRŽATI:

- Sve helper funkcije (`getMoodEmoji`, `getMoodLabel`, itd.)
- Funkciju `calculateWeekEnd` (backend vraća `weekEnd`, ali može ostati kao backup)
- Cijeli JSX render dio (ne dira se)
- CSS stilovi (ne diraju se)

---

## 🧪 Testiranje nakon integracije

1. **Pokreni aplikaciju:** `npm start`
2. **Prijavi se kao student**
3. **Klikni na "Tjedna refleksija"**
4. **Provjeri:**
   - Učitavaju li se pravi tjedni?
   - Prikazuju li se točni podaci?
   - Rade li gumbi "Prethodni" i "Sljedeći"?
   - Što se dešava ako nema podataka?
   - Što se dešava pri greški (testiraj bez interneta)?

---

## 🐛 Najčešći problemi i rješenja

### Problem: CORS error

**Rješenje:** Backend mora imati omogućen CORS za frontend domenu

### Problem: 401 Unauthorized

**Rješenje:** Provjeriti da se token pravilno šalje u Authorization header-u

### Problem: Prazna stranica

**Rješenje:** Provjeriti da backend vraća podatke u točnom formatu (vidi Response primjere)

### Problem: Loading spinner beskonačno

**Rješenje:** Dodati error handling i postaviti `setLoading(false)` u finally bloku

---

## ✅ Checklist za backend tim

- [ ] **Baza podataka:**
  - [ ] Dodana `avg_mood` kolona u `reflection` tablicu
  - [ ] Testirano dodavanje i čitanje podataka

- [ ] **Cron Job:**
  - [ ] Implementiran scheduled task (svake nedjelje 23:59)
  - [ ] Računa `total_spent` iz `food_mood_journal` + `recipes`
  - [ ] Računa `home_cooked_m` iz `food_mood_journal`
  - [ ] Računa `avg_mood` iz `food_mood_journal`
  - [ ] Kreira reflection red za sve korisnike s meal planom
  - [ ] Testiran na dev okolini

- [ ] **API Endpoints:**
  - [ ] `GET /api/reflection/available-weeks` - vraća listu tjedana
  - [ ] `GET /api/reflection/details?weekStart=...` - vraća detalje refleksije
  - [ ] Dodana autentifikacija (JWT token)
  - [ ] Testirani endpointi (Postman/Thunder Client)
  - [ ] Error handling implementiran

- [ ] **Dokumentacija:**
  - [ ] API dokumentiran (Swagger/Postman collection)
  - [ ] Primjeri request/response dodani

- [ ] **Testing:**
  - [ ] Unit testovi za cron job funkcije
  - [ ] Integration testovi za API endpoints
  - [ ] Testiranje s pravim podacima

---

## 🐛 Debugging i testiranje

### Testiranje Cron Job-a ručno:

```javascript
// Temporary endpoint za testiranje
app.post("/api/admin/trigger-reflection-cron", async (req, res) => {
  await createWeeklyReflections();
  res.json({ message: "Cron job executed" });
});
```

### Testiranje API-ja:

#### Test 1: Dohvati dostupne tjedne

```bash
curl -X GET http://localhost:5000/api/reflection/available-weeks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test 2: Dohvati detalje refleksije

```bash
curl -X GET "http://localhost:5000/api/reflection/details?weekStart=2025-01-13" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Dodatni resursi

- **Mood skala:** 1-5 (ne 1-10!)
- **Planiranih obroka:** Uvijek 21 (3×7)
- **Completion rate formula:** `(completed_meals / 21) * 100`

**Frontend je spreman i čeka backend implementaciju!** 🚀
