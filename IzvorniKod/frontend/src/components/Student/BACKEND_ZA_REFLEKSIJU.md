Pregled

Frontend komponenta WeeklyReflection.js očekuje da backend implementira 2 endpointa:

GET /api/reflection/available-weeks

GET /api/reflection/details?weekStart=YYYY-MM-DD

Frontend koristi JWT preko Axios interceptora (Authorization: Bearer <token>), tako da backend mora čitati userId iz tokena (nema userId u queryju).

Konstanta:

MEALS_PER_WEEK = 21 (frontend koristi za completion rate u prikazu)

🗄️ Tablice koje se koriste (postojeće)

Backend koristi postojeće tablice:

mealplan (user_id, week_start, week_end, total_cost)

mealplan_items (user_id, week_start, recipe_id, day_of_week, meal_slot)

food_mood_journal (consumed_at, recipe_id, user_id, mood_before, mood_after, notes)

external_expenses (koristi se za dodatnu potrošnju u tjednu)

Napomena: nazivi stupaca u external_expenses mogu varirati; u nastavku pišem generički (amount, spent_at). Prilagoditi prema stvarnom \d external_expenses.

Ne treba dodavati nove tablice da bi frontend radio.

🔐 Autentifikacija

Oba endpointa su za studenta i moraju zahtijevati JWT.

userId se uzima iz tokena (npr. req.user.userId ili kako već imate nakon middleware-a).

Ako nema tokena / nije student → 401/403.

🌐 API Endpoints
1) GET /api/reflection/available-weeks
Opis

Vraća listu week_start datuma za koje student ima mealplan (preporuka: samo završeni tjedni ili svi, po dogovoru).

Frontend u WeeklyReflection.js očekuje da ovo vrati ili:

{ weeks: ["2025-01-13", "2025-01-06"] } (preporučeno)
ili (tolerira i):

["2025-01-13", "2025-01-06"]

Request
GET /api/reflection/available-weeks
Authorization: Bearer {token}

Response (preporučeno)
{
  "weeks": ["2025-01-13", "2025-01-06", "2024-12-30"]
}

SQL (Postgres)

Opcija A: svi tjedni koje user ima

SELECT week_start
FROM mealplan
WHERE user_id = $1
ORDER BY week_start DESC
LIMIT 20;


Opcija B: samo završeni tjedni

SELECT week_start
FROM mealplan
WHERE user_id = $1
  AND week_end < CURRENT_DATE
ORDER BY week_start DESC
LIMIT 20;

2) GET /api/reflection/details?weekStart=YYYY-MM-DD
Opis

Vraća sve podatke koje WeeklyReflection.js koristi za prikaz.

Frontend očekuje da response sadrži minimalno:

weekStart (string)

weekEnd (string)

totalSpent (number)

homeCooked (number)

avgMood (number)

moodBreakdown objekt sa ključevima: excellent, good, okay, bad

lastFourWeeks array: { weekStart, completionRate } gdje je completionRate broj ili null

Request
GET /api/reflection/details?weekStart=2025-01-13
Authorization: Bearer {token}

Response (format koji frontend koristi)
{
  "weekStart": "2025-01-13",
  "weekEnd": "2025-01-19",
  "totalSpent": 24.5,
  "homeCooked": 6,
  "avgMood": 4.2,
  "moodBreakdown": { "excellent": 2, "good": 8, "okay": 5, "bad": 1 },
  "lastFourWeeks": [
    { "weekStart": "2024-12-30", "completionRate": 19.05 },
    { "weekStart": "2025-01-06", "completionRate": 23.81 },
    { "weekStart": "2025-01-13", "completionRate": 28.57 },
    { "weekStart": "2025-01-20", "completionRate": null }
  ]
}

📌 Backend logika (što se računa i iz kojih tablica)
2.1 Dohvati tjedan (mealplan)

weekStart je query parametar. Prvo validirati da postoji mealplan za tog usera.

SELECT week_start, week_end, COALESCE(total_cost, 0) AS mealplan_cost
FROM mealplan
WHERE user_id = $1 AND week_start = $2;


Ako nema reda → 404 Not Found (nema refleksije bez mealplana).

weekEnd uzeti iz baze (mealplan.week_end) – to je izvor istine.

2.2 HomeCooked (broj napravljenih / ocijenjenih obroka)

Frontend tekst kaže “Napravio si / ocijenio”, pa je najlogičnije brojati unose u food_mood_journal u tom tjednu.

Vrijeme tjedna (Postgres):

from = week_start 00:00

to = week_end + 1 day 00:00 (exclusive)

SELECT COUNT(*)::int AS home_cooked
FROM food_mood_journal
WHERE user_id = $1
  AND consumed_at >= $2::date
  AND consumed_at < ($3::date + INTERVAL '1 day');


Ako želite brojati samo one koji su dio mealplana, dodajte JOIN/filter po mealplan_items (ali frontend to ne zahtijeva eksplicitno).

2.3 AvgMood (prosječno raspoloženje)

U food_mood_journal imate mood_before i mood_after. Frontend helperi rade na skali 1–5.

Preporuka: računaj prosjek kao (mood_before + mood_after) / 2.0, ali samo kad oba postoje.
Ako želite tolerantnije: koristiti COALESCE(mood_after, mood_before).

Striktnije (oba moraju biti non-null):

SELECT AVG((mood_before + mood_after) / 2.0) AS avg_mood
FROM food_mood_journal
WHERE user_id = $1
  AND consumed_at >= $2::date
  AND consumed_at < ($3::date + INTERVAL '1 day')
  AND mood_before IS NOT NULL
  AND mood_after IS NOT NULL;


Ako nema unosa → vratiti avgMood: 0 ili avgMood: null.
⚠️ Frontend trenutno radi reflectionData.avgMood.toFixed(1) pa je najsigurnije vratiti broj (npr. 0).

2.4 MoodBreakdown

Frontend očekuje kategorije:

excellent (>= 4.5)

good (>= 3.5)

okay (>= 2.5)

bad (< 2.5)

Kategorizacija je ista kao categorizeMood() u frontendu.

Možete to izračunati u JS-u nakon što dohvatite prosječne moodove, ili direktno u SQL-u.

SQL primjer (računa avg_entry_mood pa zbraja kategorije):

WITH entries AS (
  SELECT ((mood_before + mood_after) / 2.0) AS m
  FROM food_mood_journal
  WHERE user_id = $1
    AND consumed_at >= $2::date
    AND consumed_at < ($3::date + INTERVAL '1 day')
    AND mood_before IS NOT NULL
    AND mood_after IS NOT NULL
)
SELECT
  SUM(CASE WHEN m >= 4.5 THEN 1 ELSE 0 END)::int AS excellent,
  SUM(CASE WHEN m >= 3.5 AND m < 4.5 THEN 1 ELSE 0 END)::int AS good,
  SUM(CASE WHEN m >= 2.5 AND m < 3.5 THEN 1 ELSE 0 END)::int AS okay,
  SUM(CASE WHEN m < 2.5 THEN 1 ELSE 0 END)::int AS bad
FROM entries;


Ako nema entry-a, suma će biti null → backend treba mapirati u 0.

2.5 TotalSpent (ukupno potrošeno)

Vi ste rekli da imate i external_expenses za potrošeno.

Preporučeni model:

mealplan_cost iz mealplan.total_cost

external_cost kao suma external_expenses.amount u tjednu

totalSpent = mealplan_cost + external_cost

mealplan_cost već imamo iz 2.1.

external_cost (PRILAGODITI prema stvarnim stupcima):

SELECT COALESCE(SUM(amount), 0) AS external_cost
FROM external_expenses
WHERE user_id = $1
  AND spent_at >= $2::date
  AND spent_at < ($3::date + INTERVAL '1 day');


Ako nemate spent_at nego created_at ili expense_date, koristiti to.

2.6 lastFourWeeks (graf zadnja 4 tjedna)

Frontend prikazuje “postotak realizacije meal plana u zadnja 4 tjedna” i očekuje completionRate ili null za trenutni tjedan.

Definicija completionRate (kao u frontu):

completionRate = (homeCooked / 21) * 100

za “trenutni tjedan” completionRate = null (da graf ima '-' i disabled)

Kako generirati lastFourWeeks:

Dohvati zadnja 3 završena tjedna do uključivo odabranog weekStart:

SELECT week_start, week_end
FROM mealplan
WHERE user_id = $1
  AND week_start <= $2
ORDER BY week_start DESC
LIMIT 3;


Za svaki od njih izračunaj homeCooked (query iz 2.2) i napravi completionRate.

Dodaj “trenutni tjedan” (week_start od current week) kao četvrti element s completionRate: null ako je currentWeekStart > odabranog weekStart.

Kako izračunati currentWeekStart (ponedjeljak):

u backendu iz CURRENT_DATE, spusti na ponedjeljak (ovisno o locale).
U Postgresu npr.:

SELECT (date_trunc('week', CURRENT_DATE)::date) AS current_week_start;


(U Postgresu date_trunc('week') je ponedjeljak kao start.)

Zatim ako je current_week_start > selected_week_start, pushaj:

{ "weekStart": "<current_week_start>", "completionRate": null }


Na kraju vrati array od najstarijeg prema najnovijem (frontend očekuje da zadnji može biti “trenutni”).

🧩 Pseudo-kod za /reflection/details
async function getReflectionDetails(req, res) {
  const userId = req.user.user_id; // iz JWT
  const weekStart = req.query.weekStart; // "YYYY-MM-DD"

  // 1) mealplan row
  const mp = await db.oneOrNone(`
    SELECT week_start, week_end, COALESCE(total_cost, 0) AS mealplan_cost
    FROM mealplan
    WHERE user_id = $1 AND week_start = $2
  `, [userId, weekStart]);

  if (!mp) return res.status(404).json({ message: "No mealplan for week" });

  const weekEnd = mp.week_end;

  // 2) homeCooked
  const homeCooked = await db.one(`
    SELECT COUNT(*)::int AS home_cooked
    FROM food_mood_journal
    WHERE user_id = $1
      AND consumed_at >= $2::date
      AND consumed_at < ($3::date + INTERVAL '1 day')
  `, [userId, weekStart, weekEnd]);

  // 3) avgMood
  const avgMoodRow = await db.one(`
    SELECT COALESCE(AVG((mood_before + mood_after) / 2.0), 0) AS avg_mood
    FROM food_mood_journal
    WHERE user_id = $1
      AND consumed_at >= $2::date
      AND consumed_at < ($3::date + INTERVAL '1 day')
      AND mood_before IS NOT NULL
      AND mood_after IS NOT NULL
  `, [userId, weekStart, weekEnd]);

  // 4) moodBreakdown
  const breakdown = await db.one(`
    WITH entries AS (
      SELECT ((mood_before + mood_after) / 2.0) AS m
      FROM food_mood_journal
      WHERE user_id = $1
        AND consumed_at >= $2::date
        AND consumed_at < ($3::date + INTERVAL '1 day')
        AND mood_before IS NOT NULL
        AND mood_after IS NOT NULL
    )
    SELECT
      COALESCE(SUM(CASE WHEN m >= 4.5 THEN 1 ELSE 0 END), 0)::int AS excellent,
      COALESCE(SUM(CASE WHEN m >= 3.5 AND m < 4.5 THEN 1 ELSE 0 END), 0)::int AS good,
      COALESCE(SUM(CASE WHEN m >= 2.5 AND m < 3.5 THEN 1 ELSE 0 END), 0)::int AS okay,
      COALESCE(SUM(CASE WHEN m < 2.5 THEN 1 ELSE 0 END), 0)::int AS bad
    FROM entries;
  `, [userId, weekStart, weekEnd]);

  // 5) external expenses (prilagoditi kolone)
  const external = await db.one(`
    SELECT COALESCE(SUM(amount), 0) AS external_cost
    FROM external_expenses
    WHERE user_id = $1
      AND spent_at >= $2::date
      AND spent_at < ($3::date + INTERVAL '1 day')
  `, [userId, weekStart, weekEnd]);

  const totalSpent = Number(mp.mealplan_cost) + Number(external.external_cost);

  // 6) lastFourWeeks (3 završena + current null)
  // ... generirati kako opisano iznad ...

  return res.json({
    weekStart: mp.week_start,
    weekEnd: mp.week_end,
    totalSpent,
    homeCooked: homeCooked.home_cooked,
    avgMood: Number(avgMoodRow.avg_mood),
    moodBreakdown: breakdown,
    lastFourWeeks
  });
}

✅ Minimalni acceptance kriteriji (da frontend radi)

Backend je “gotov” kad:

GET /api/reflection/available-weeks vraća {weeks:[date...]} ili [date...]

GET /api/reflection/details?weekStart=... vraća sva polja koja frontend čita:

weekStart, weekEnd, totalSpent, homeCooked, avgMood,

moodBreakdown sa 4 ključa,

lastFourWeeks array.