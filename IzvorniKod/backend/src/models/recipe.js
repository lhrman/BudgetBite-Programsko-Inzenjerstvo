import { pool } from "../config/db.js";

export const RecipeModel = {

  async create({
    recipe_name,
    description,
    prep_time_min,
    price_estimate,
    calories,
    protein,
    carbs,
    fats,
    preparation_steps,
    user_id,
  }) {
    const result = await pool.query(
      `
      INSERT INTO recipe
      (recipe_name, description, prep_time_min, price_estimate,
       calories, protein, carbs, fats, preparation_steps, user_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
      `,
      [
        recipe_name,
        description,
        prep_time_min,
        price_estimate,
        calories,
        protein,
        carbs,
        fats,
        preparation_steps,
        user_id,
      ]
    );

    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query(
      `
      SELECT r.*, u.name AS creator_name
      FROM recipe r
      JOIN appuser u ON u.user_id = r.user_id
      ORDER BY r.created_at DESC
      `
    );
    return result.rows;
  },

  async getById(recipe_id) {
    const result = await pool.query(
      `
      SELECT r.*, u.name AS creator_name
      FROM recipe r
      JOIN appuser u ON u.user_id = r.user_id
      WHERE r.recipe_id = $1
      `,
      [recipe_id]
    );
    return result.rows[0];
  },
};
