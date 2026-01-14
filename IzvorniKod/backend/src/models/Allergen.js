import { pool } from "../config/db.js";

export const AllergenModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT allergen_id, name FROM allergen ORDER BY name`
    );
    return result.rows;
  },
};
