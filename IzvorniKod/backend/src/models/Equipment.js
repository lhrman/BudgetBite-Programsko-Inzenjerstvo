import { pool } from "../config/db.js";

export const EquipmentModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT equipment_id, equipment_name FROM equipment ORDER BY equipment_name`
    );
    return result.rows;
  },
};
