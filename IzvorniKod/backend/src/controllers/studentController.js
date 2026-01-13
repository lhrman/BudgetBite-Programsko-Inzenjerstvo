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
  // F2 - Upitnik
  // ==========================
  async setupProfile(req, res) {
    const { weekly_budget, goals, allergens, equipment, restrictions } = req.body;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "UPDATE student SET weekly_budget = $1, goals = $2 WHERE user_id = $3",
        [weekly_budget, goals, userId]
      );

      // alergeni
      await client.query("DELETE FROM student_allergen WHERE user_id = $1", [userId]);
      if (Array.isArray(allergens) && allergens.length > 0) {
        for (const allergenId of allergens) {
          await client.query(
            "INSERT INTO student_allergen (user_id, allergen_id) VALUES ($1, $2)",
            [userId, allergenId]
          );
        }
      }

      // oprema (ako tablica postoji)
      try {
        await client.query("DELETE FROM student_equipment WHERE user_id = $1", [userId]);
        if (Array.isArray(equipment) && equipment.length > 0) {
          for (const equipmentId of equipment) {
            await client.query(
              "INSERT INTO student_equipment (user_id, equipment_id) VALUES ($1, $2)",
              [userId, equipmentId]
            );
          }
        }
      } catch (_) {
        // ignoriramo ako u Railwayu nema te tablice
      }

      // restrikcije (ako tablica postoji)
      try {
        await client.query("DELETE FROM student_diet WHERE user_id = $1", [userId]);
        if (Array.isArray(restrictions) && restrictions.length > 0) {
          for (const restrictionId of restrictions) {
            await client.query(
              "INSERT INTO student_diet (user_id, restriction_id) VALUES ($1, $2)",
              [userId, restrictionId]
            );
          }
        }
      } catch (_) {
        // ignoriramo ako nema tablice
      }

      await client.query("COMMIT");
      return res.status(200).json({ message: "Anketa uspješno spremljena!" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("setupProfile error:", err);
      return res.status(500).json({ error: "Greška na serveru." });
    } finally {
      client.release();
    }
  },

  async getStaticData(req, res) {
    try {
      const allergens = await pool.query("SELECT * FROM allergen");
      const equipment = await pool.query("SELECT * FROM equipment");
      const restrictions = await pool.query("SELECT * FROM dietary_restriction");

      return res.status(200).json({
        allergens: allergens.rows,
        equipment: equipment.rows,
        restrictions: restrictions.rows,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // ==========================
  // F3 - GENERIRAJ MEAL PLAN (po korisniku)
  // ==========================
  async generateMealPlan(req, res) {
    const userId = req.user.id;
    const { week_start } = req.body || {};

    const weekStart = getWeekStart(week_start);
    const weekEnd = weekStart.add(6, "day");

    // 1 obrok dnevno (po želji možeš: ["breakfast","lunch","dinner"])
    const mealSlots = ["meal"];

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1) Student budget
      const st = await client.query(
        "SELECT weekly_budget FROM student WHERE user_id = $1",
        [userId]
      );

      if (st.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Korisnik nije student ili nema profil." });
      }

      const weeklyBudget = Number(st.rows[0].weekly_budget || 0);
      if (!weeklyBudget || weeklyBudget <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Postavi weekly_budget prije generiranja plana." });
      }

      // 2) Kandidati recepata (v1: sortiraj po cijeni i vremenu)
      const recipesRes = await client.query(`
        SELECT recipe_id, recipe_name, price_estimate, prep_time_min
        FROM recipe
        ORDER BY COALESCE(price_estimate, 999999) ASC, COALESCE(prep_time_min, 999999) ASC
      `);

      const recipes = recipesRes.rows;
      if (recipes.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Nema recepata u bazi." });
      }

      const ws = weekStart.format("YYYY-MM-DD");
      const we = weekEnd.format("YYYY-MM-DD");

      // 3) Obriši postojeći plan tog korisnika za taj tjedan
      await client.query(
        "DELETE FROM mealplan_items WHERE user_id = $1 AND week_start = $2",
        [userId, ws]
      );
      await client.query(
        "DELETE FROM mealplan WHERE user_id = $1 AND week_start = $2",
        [userId, ws]
      );

      // 4) Generiraj raspored
      const items = [];
      let total = 0;

      let idx = 0;
      for (let day = 1; day <= 7; day++) {
        for (const slot of mealSlots) {
          // ako idx ode preko broja recepata, vratimo se na početak (ponavljanje dozvoljeno)
          const r = recipes[idx % recipes.length];
          const cost = Number(r.price_estimate ?? 0);

          // jednostavna budžet logika:
          // ako ne stane, pokušaj najjeftiniji (recipes[0]); ako ni to ne stane, ipak dodaj (da plan postoji)
          if (total + cost > weeklyBudget) {
            const cheapest = recipes[0];
            const cheapestCost = Number(cheapest.price_estimate ?? 0);

            if (total + cheapestCost <= weeklyBudget) {
              items.push({
                user_id: userId,
                week_start: ws,
                day_of_week: day,
                meal_slot: slot,
                recipe_id: cheapest.recipe_id,
                est_cost: cheapestCost,
              });
              total += cheapestCost;
              idx++;
              continue;
            }
          }

          items.push({
            user_id: userId,
            week_start: ws,
            day_of_week: day,
            meal_slot: slot,
            recipe_id: r.recipe_id,
            est_cost: cost,
          });

          total += cost;
          idx++;
        }
      }

      // 5) Insert mealplan (po korisniku)
      await client.query(
        `
        INSERT INTO mealplan (user_id, week_start, week_end, total_cost)
        VALUES ($1, $2, $3, $4)
        `,
        [userId, ws, we, total]
      );

      // 6) Insert items (s user_id)
      for (const it of items) {
        await client.query(
          `
          INSERT INTO mealplan_items (user_id, week_start, recipe_id, day_of_week, meal_slot)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [userId, it.week_start, it.recipe_id, it.day_of_week, it.meal_slot]
        );
      }

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Meal plan generiran.",
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
  // F3 - DOHVATI TRENUTNI PLAN (zadnji generirani)
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
          i.week_start, i.day_of_week, i.meal_slot, i.recipe_id,
          r.recipe_name, r.price_estimate, r.prep_time_min
        FROM mealplan_items i
        JOIN recipe r ON r.recipe_id = i.recipe_id
        WHERE i.user_id = $1 AND i.week_start = $2
        ORDER BY i.day_of_week ASC
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
  // F18 - FOOD LOG (ako ti baza još nema kolone actual_cost / is_home_cooked, ovo će pucati)
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
        INSERT INTO food_mood_journal (consumed_at, recipe_id, user_id, mood_before, mood_after, notes, actual_cost, is_home_cooked)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
