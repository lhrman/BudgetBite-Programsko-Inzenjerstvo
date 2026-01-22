import { pool } from "../config/db.js";
import dayjs from "dayjs";

// --- helper: week start (ponedjeljak) ---
function getWeekStart(dateStr) {
  const d = dateStr ? dayjs(dateStr) : dayjs();
  const dow = d.day(); // 0=Sunday ... 1=Monday
  const diffToMonday = (dow + 6) % 7; // Monday->0, Sunday->6
  return d.subtract(diffToMonday, "day").startOf("day");
}

export const StudentController = {
  // ==========================
  // F2 - Upitnik (BUDGET + alergeni + oprema + restrikcije)
  // ==========================
 async setupProfile(req, res) {
  const { weekly_budget, allergens, equipment, restrictions, goals } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE student SET weekly_budget = $1 WHERE user_id = $2",
      [weekly_budget, userId]
    );

    // alergeni...
    await client.query("DELETE FROM student_allergen WHERE user_id = $1", [userId]);
    if (Array.isArray(allergens) && allergens.length > 0) {
      for (const allergenId of allergens) {
        await client.query(
          "INSERT INTO student_allergen (user_id, allergen_id) VALUES ($1, $2)",
          [userId, allergenId]
        );
      }
    }

    // oprema...
    await client.query("DELETE FROM student_equipment WHERE user_id = $1", [userId]);
    if (Array.isArray(equipment) && equipment.length > 0) {
      for (const equipmentId of equipment) {
        await client.query(
          "INSERT INTO student_equipment (user_id, equipment_id) VALUES ($1, $2)",
          [userId, equipmentId]
        );
      }
    }

    // restrikcije...
    await client.query("DELETE FROM student_diet WHERE user_id = $1", [userId]);
    if (Array.isArray(restrictions) && restrictions.length > 0) {
      for (const restrictionId of restrictions) {
        await client.query(
          "INSERT INTO student_diet (user_id, restriction_id) VALUES ($1, $2)",
          [userId, restrictionId]
        );
      }
    }

    // ✅ CILJEVI (novo)
    await client.query("DELETE FROM cilj_student WHERE user_id = $1", [userId]);
    if (Array.isArray(goals) && goals.length > 0) {
      for (const goalId of goals) {
        await client.query(
          "INSERT INTO cilj_student (user_id, cilj_id) VALUES ($1, $2)",
          [userId, goalId]
        );
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: "Upitnik uspješno spremljen!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("setupProfile error:", err);
    return res.status(500).json({ error: "Greška na serveru." });
  } finally {
    client.release();
  }
},

  // ==========================
  // Opcije za upitnik
  // ==========================
  async getStaticData(req, res) {
  try {
    const allergens = await pool.query("SELECT * FROM allergen ORDER BY name");
    const equipment = await pool.query("SELECT * FROM equipment ORDER BY equipment_name");
    const restrictions = await pool.query(
      "SELECT * FROM dietary_restriction ORDER BY name"
    );

    const goals = await pool.query(
      `SELECT cilj_id AS goal_id, cilj_name AS name
       FROM prehrambeni_cilj
       ORDER BY cilj_name`
    );

    return res.status(200).json({
      allergens: allergens.rows,
      equipment: equipment.rows,
      restrictions: restrictions.rows,
      goals: goals.rows, // ✅ BITNO
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
},

  // ==========================
// F3 - GENERIRAJ MEAL PLAN (po useru, 3 obroka dnevno)
// ==========================
async generateMealPlan(req, res) {
  const userId = req.user.id;
  const { week_start } = req.body || {};
  const force = String(req.query?.force || "0") === "1";

  const weekStart = getWeekStart(week_start);
  const weekEnd = weekStart.add(6, "day");
  const ws = weekStart.format("YYYY-MM-DD");
  const we = weekEnd.format("YYYY-MM-DD");

  const MEAL_SLOTS = ["breakfast", "lunch", "dinner"];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 0) Ako već postoji plan za taj tjedan i nije force -> vrati ga
    if (!force) {
      const existingPlan = await client.query(
        `SELECT week_start, week_end, total_cost
         FROM mealplan
         WHERE user_id = $1 AND week_start = $2
         LIMIT 1`,
        [userId, ws]
      );

      if (existingPlan.rows.length > 0) {
        const items = await client.query(
  `
  SELECT
    i.week_start,
    i.day_of_week,
    i.meal_slot,
    i.recipe_id,
    r.recipe_name,
    r.price_estimate,
    r.prep_time_min,
    rm.media_url AS image_url,
    ROUND(COALESCE(rt.avg_score, 0)::numeric, 1) AS rating
  FROM mealplan_items i
  JOIN recipe r ON r.recipe_id = i.recipe_id
  LEFT JOIN recipe_media rm
    ON rm.recipe_id = r.recipe_id
   AND rm.media_type = 'picture'
  LEFT JOIN (
    SELECT recipe_id, AVG(score) AS avg_score
    FROM rating
    GROUP BY recipe_id
  ) rt ON rt.recipe_id = r.recipe_id
  WHERE i.user_id = $1 AND i.week_start = $2
  ORDER BY
    i.day_of_week ASC,
    CASE i.meal_slot
      WHEN 'breakfast' THEN 1
      WHEN 'lunch' THEN 2
      WHEN 'dinner' THEN 3
      ELSE 99
    END ASC
  `,
  [userId, ws]
);


        await client.query("COMMIT");
        return res.status(200).json({
          ...existingPlan.rows[0],
          items: items.rows,
        });
      }
    }

    // 1) student budget + filteri
    const studentData = await client.query(
      `
      SELECT 
        s.weekly_budget,
        COALESCE(ARRAY(SELECT allergen_id FROM student_allergen WHERE user_id = $1), '{}'::int[]) as allergens,
        COALESCE(ARRAY(SELECT equipment_id FROM student_equipment WHERE user_id = $1), '{}'::int[]) as equipment,
        COALESCE(ARRAY(SELECT restriction_id FROM student_diet WHERE user_id = $1), '{}'::int[]) as restrictions
      FROM student s
      WHERE s.user_id = $1
      `,
      [userId]
    );

    if (studentData.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Korisnik nema student profil." });
    }

    const { weekly_budget, allergens, equipment, restrictions } = studentData.rows[0];
    const budgetLimit = Number(weekly_budget || 0);

    // Validacije
    if (!budgetLimit || budgetLimit < 20) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Molimo upišite veći budžet od 20€." });
    }

    if (!Array.isArray(equipment) || equipment.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Potrebno je odabrati minimalno jedan komad opreme.",
      });
    }

    // 2) kandidati recepata (filtri)
    const recipesRes = await client.query(
      `
      SELECT r.recipe_id, r.recipe_name, r.price_estimate, r.prep_time_min
      FROM recipe r
      WHERE
        NOT EXISTS (
          SELECT 1
          FROM recipe_allergen ra
          WHERE ra.recipe_id = r.recipe_id
            AND ra.allergen_id = ANY($1)
        )
        AND (
          NOT EXISTS (
            SELECT 1
            FROM recipe_equipment re
            WHERE re.recipe_id = r.recipe_id
              AND NOT (re.equipment_id = ANY($2))
          )
        )
        AND (
          array_length($3::int[], 1) IS NULL
          OR (
            (SELECT COUNT(DISTINCT rr.restriction_id)
             FROM recipe_restriction rr
             WHERE rr.recipe_id = r.recipe_id
               AND rr.restriction_id = ANY($3)
            ) = array_length($3::int[], 1)
          )
        )
      `,
      [allergens, equipment, restrictions]
    );

    const recipes = recipesRes.rows.map((r) => ({
      ...r,
      price_estimate: Number(r.price_estimate || 0),
      prep_time_min: Number(r.prep_time_min || 0),
    }));

    if (recipes.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Nemoguće stvoriti plan prehrane." });
    }

    // 3) TEK SAD (nakon validacija) brišemo postojeći plan za user+tjedan
    await client.query(
      "DELETE FROM mealplan_items WHERE user_id = $1 AND week_start = $2",
      [userId, ws]
    );
    await client.query(
      "DELETE FROM mealplan WHERE user_id = $1 AND week_start = $2",
      [userId, ws]
    );

    // 4) Odabir 21 obroka (3 x 7), maksimalno raznoliko
    const usedWeek = new Set(); // za "što više različitih" kroz tjedan
    const items = [];
    let total = 0;

    const wPrice = 0.65;
    const wTime = 0.35;
    const topK = Math.min(12, recipes.length);

    function pickRecipe(remainingBudget, forbiddenIds = new Set()) {
      // ako možeš -> drži budžet, ali ako nema takvih, pusti sve (da ipak složi plan)
      let candidates = recipes;
      const withinBudget = recipes.filter((r) => r.price_estimate <= remainingBudget);
      if (withinBudget.length > 0) candidates = withinBudget;

      // makni zabranjene (npr. već odabrane u tom danu)
      candidates = candidates.filter((r) => !forbiddenIds.has(r.recipe_id));

      // preferiraj još neiskorištene u tjednu
      const unusedWeek = candidates.filter((r) => !usedWeek.has(r.recipe_id));
      if (unusedWeek.length > 0) candidates = unusedWeek;

      if (candidates.length === 0) return null;

      const scored = candidates
        .map((r) => {
          const priceNorm = budgetLimit > 0 ? r.price_estimate / budgetLimit : r.price_estimate;
          const timeNorm = (r.prep_time_min || 0) / 60;
          const jitter = Math.random() * 0.15;
          const score = wPrice * priceNorm + wTime * timeNorm + jitter;
          return { r, score };
        })
        .sort((a, b) => a.score - b.score);

      const window = scored.slice(0, Math.min(topK, scored.length));
      return window[Math.floor(Math.random() * window.length)]?.r || scored[0].r;
    }

    for (let day = 1; day <= 7; day++) {
      const usedToday = new Set(); // KLJUČNO: sprječava duplikat istog recepta u istom danu

      for (const slot of MEAL_SLOTS) {
        const remaining = budgetLimit - total;

        // prvi pokušaj
        let selected = pickRecipe(remaining, usedToday);

        // ako baš nema (npr. svi su forbidden), probaj bez budžetnog limita (ali i dalje bez duplikata u danu)
        if (!selected) selected = pickRecipe(Number.MAX_SAFE_INTEGER, usedToday);

        if (!selected) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Nemoguće stvoriti plan prehrane." });
        }

        const cost = Number(selected.price_estimate || 0);

        items.push({
          user_id: userId,
          week_start: ws,
          day_of_week: day,
          meal_slot: slot,
          recipe_id: selected.recipe_id,
          est_cost: cost,
        });

        total += cost;
        usedToday.add(selected.recipe_id);
        usedWeek.add(selected.recipe_id);
      }
    }

    // 5) spremi header
    await client.query(
      "INSERT INTO mealplan (user_id, week_start, week_end, total_cost) VALUES ($1, $2, $3, $4)",
      [userId, ws, we, total]
    );

    // 6) spremi stavke (sad imamo 21 reda)
    for (const it of items) {
      await client.query(
        "INSERT INTO mealplan_items (user_id, week_start, recipe_id, day_of_week, meal_slot) VALUES ($1, $2, $3, $4, $5)",
        [it.user_id, it.week_start, it.recipe_id, it.day_of_week, it.meal_slot]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Meal plan generiran!",
      week_start: ws,
      week_end: we,
      total_cost: total,
      items,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("generateMealPlan error:", err);
    return res.status(500).json({ message: "Greška na serveru.", error: err.message });
  } finally {
    client.release();
  }
},


  // ==========================
  // F3 - DOHVATI TRENUTNI PLAN
  // ==========================
  async getCurrentMealPlan(req, res) {
    const userId = req.user.id;

    try {
      const plan = await pool.query(
        `
        SELECT week_start, week_end, total_cost
        FROM mealplan
        WHERE user_id = $1
        ORDER BY week_start DESC
        LIMIT 1
        `,
        [userId]
      );

      if (plan.rows.length === 0) {
        return res.status(404).json({ message: "Nema generiranog meal plana." });
      }

      const weekStart = plan.rows[0].week_start;

     const items = await pool.query(
  `
  SELECT
    i.week_start,
    i.day_of_week,
    i.meal_slot,
    i.recipe_id,
    r.recipe_name,
    r.price_estimate,
    r.prep_time_min,
    rm.media_url AS image_url,
    ROUND(COALESCE(rt.avg_score, 0)::numeric, 1) AS rating
  FROM mealplan_items i
  JOIN recipe r ON r.recipe_id = i.recipe_id
  LEFT JOIN recipe_media rm
    ON rm.recipe_id = r.recipe_id
   AND rm.media_type = 'picture'
  LEFT JOIN (
    SELECT recipe_id, AVG(score) AS avg_score
    FROM rating
    GROUP BY recipe_id
  ) rt ON rt.recipe_id = r.recipe_id
  WHERE i.user_id = $1
    AND i.week_start = $2
  ORDER BY i.day_of_week ASC,
           CASE i.meal_slot
             WHEN 'breakfast' THEN 1
             WHEN 'lunch' THEN 2
             WHEN 'dinner' THEN 3
             ELSE 4
           END
  `,
  [userId, weekStart]
);


      return res.status(200).json({
        ...plan.rows[0],
        items: items.rows,
      });
    } catch (err) {
      console.error("getCurrentMealPlan error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },

  // ==========================
  // F18 - FOOD LOG
  // ==========================
  async createFoodLog(req, res) {
    const userId = req.user.id;
    const {
      consumed_at,
      recipe_id,
      mood_before = null,
      mood_after = null,
      notes = null,
      actual_cost = null,
      is_home_cooked = true,
    } = req.body;

    if (!consumed_at || !recipe_id) {
      return res.status(400).json({ message: "consumed_at i recipe_id su obavezni." });
    }

    try {
      await pool.query(
        `
        INSERT INTO food_mood_journal
          (consumed_at, recipe_id, user_id, mood_before, mood_after, notes, actual_cost, is_home_cooked)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (consumed_at, recipe_id, user_id)
        DO UPDATE SET mood_before = EXCLUDED.mood_before,
                      mood_after = EXCLUDED.mood_after,
                      notes = EXCLUDED.notes,
                      actual_cost = EXCLUDED.actual_cost,
                      is_home_cooked = EXCLUDED.is_home_cooked
        `,
        [consumed_at, recipe_id, userId, mood_before, mood_after, notes, actual_cost, is_home_cooked]
      );

      return res.status(201).json({ message: "Obrok spremljen u dnevnik." });
    } catch (err) {
      console.error("createFoodLog error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },

  async listFoodLog(req, res) {
    const userId = req.user.id;
    const { from, to } = req.query;

    const fromD = from ? dayjs(from) : dayjs().subtract(7, "day");
    const toD = to ? dayjs(to) : dayjs();

    try {
      const rows = await pool.query(
        `
        SELECT f.consumed_at, f.recipe_id, r.recipe_name, 
               COALESCE(f.actual_cost, r.price_estimate, 0) AS cost,
               f.is_home_cooked, f.mood_before, f.mood_after, f.notes
        FROM food_mood_journal f
        JOIN recipe r ON r.recipe_id = f.recipe_id
        WHERE f.user_id = $1
          AND f.consumed_at >= $2
          AND f.consumed_at <= $3
        ORDER BY f.consumed_at DESC
        `,
        [userId, fromD.toISOString(), toD.toISOString()]
      );

      return res.status(200).json({ items: rows.rows });
    } catch (err) {
      console.error("listFoodLog error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },

  async getWeeklyStats(req, res) {
    const userId = req.user.id;
    const weekStart = getWeekStart(req.query.week_start).format("YYYY-MM-DD");
    const weekEnd = dayjs(weekStart).add(6, "day").endOf("day").toISOString();

    try {
      const agg = await pool.query(
        `
        SELECT
          COALESCE(SUM(COALESCE(f.actual_cost, r.price_estimate, 0)), 0) AS total_spent,
          COALESCE(AVG(f.mood_before), 0) AS avg_mood_before,
          COALESCE(AVG(f.mood_after), 0) AS avg_mood_after,
          COALESCE(SUM(CASE WHEN COALESCE(f.is_home_cooked, true) = true THEN 1 ELSE 0 END), 0) AS home_cooked_count,
          COALESCE(SUM(CASE WHEN COALESCE(f.is_home_cooked, true) = false THEN 1 ELSE 0 END), 0) AS bought_count
        FROM food_mood_journal f
        JOIN recipe r ON r.recipe_id = f.recipe_id
        WHERE f.user_id = $1
          AND f.consumed_at >= $2
          AND f.consumed_at <= $3
        `,
        [userId, weekStart, weekEnd]
      );

      const perDay = await pool.query(
        `
        SELECT
          DATE(f.consumed_at) AS day,
          COALESCE(SUM(COALESCE(f.actual_cost, r.price_estimate, 0)), 0) AS spent
        FROM food_mood_journal f
        JOIN recipe r ON r.recipe_id = f.recipe_id
        WHERE f.user_id = $1
          AND f.consumed_at >= $2
          AND f.consumed_at <= $3
        GROUP BY DATE(f.consumed_at)
        ORDER BY day ASC
        `,
        [userId, weekStart, weekEnd]
      );

      return res.status(200).json({
        week_start: weekStart,
        ...agg.rows[0],
        per_day: perDay.rows,
      });
    } catch (err) {
      console.error("getWeeklyStats error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },
};
