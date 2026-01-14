import { pool } from "../config/db.js";

export const IngredientModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT ingredient_id, name, default_unit FROM ingredient ORDER BY name`
    );
    return result.rows;
  },
};
