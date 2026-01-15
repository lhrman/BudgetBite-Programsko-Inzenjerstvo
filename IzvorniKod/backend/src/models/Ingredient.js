import { pool } from "../config/db.js";

export const IngredientModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT ingredient_id, name, default_unit FROM ingredient ORDER BY name`
    );
    return result.rows;
  },

  async search(search) {
    const result = await pool.query(
      `
      SELECT ingredient_id, name, default_unit
      FROM ingredient
      WHERE name ILIKE $1
      ORDER BY name
      LIMIT 20
      `,
      [`%${search}%`]
    );
    return result.rows;
  },

  async create({ name, category }) {
    const res = await pool.query(
      `
      INSERT INTO ingredient (name)
      VALUES ($1)
      RETURNING ingredient_id, name, default_unit
      `,
      [name]
    );

    return res.rows[0];
  },

};


