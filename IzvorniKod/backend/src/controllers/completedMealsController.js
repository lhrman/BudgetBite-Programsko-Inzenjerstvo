import { pool } from "../config/db.js";
import dayjs from "dayjs";

export const CompletedMealsController = {
  // POST /api/completed-meals
  async create(req, res) {
    const userId = req.user.id;
    const { recipe_id } = req.body;

    if (!recipe_id || Number(recipe_id) <= 0) {
      return res.status(400).json({ success: false, error: "recipe_id je obavezan." });
    }

    try {
      // 1) Provjeri recept + cijenu
      const recipeRes = await pool.query(
        `SELECT price_estimate FROM recipe WHERE recipe_id = $1`,
        [recipe_id]
      );

      if (recipeRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Recept ne postoji." });
      }

      const priceAtTime = Number(recipeRes.rows[0].price_estimate || 0);

      // 2) Insert u completed_meals
      await pool.query(
        `
        INSERT INTO completed_meals (
          user_id, recipe_id, price_at_time, completed_at, created_at
        )
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        [userId, recipe_id, priceAtTime]
      );

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("CompletedMeals create error:", err);
      return res.status(500).json({ success: false, error: "Greška na serveru." });
    }
  },

  // GET /api/completed-meals?week_start=YYYY-MM-DD
  async list(req, res) {
    const userId = req.user.id;
    const { week_start } = req.query;

    if (!week_start) {
      return res.status(400).json({ success: false, error: "Nedostaje week_start." });
    }

    const start = dayjs(week_start).startOf("day");
    const end = start.add(6, "day").endOf("day");

    try {
      const rows = await pool.query(
        `
        SELECT
          completed_meal_id,
          price_at_time,
          DATE(completed_at) AS date
        FROM completed_meals
        WHERE user_id = $1
          AND completed_at >= $2
          AND completed_at <= $3
        ORDER BY completed_at ASC
        `,
        [userId, start.toISOString(), end.toISOString()]
      );

      return res.status(200).json(rows.rows);
    } catch (err) {
      console.error("CompletedMeals list error:", err);
      return res.status(500).json({ success: false, error: "Greška na serveru." });
    }
  },
};
