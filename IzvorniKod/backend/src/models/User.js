import { pool } from "../config/db.js";

export const UserModel = {
  // Dohvati korisnika prema emailu
  async findByEmail(email) {
    const result = await pool.query(
      "SELECT * FROM appuser WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },

  // Dohvati korisnika prema ID-u
  async findById(user_id) {
    const result = await pool.query(
      "SELECT * FROM appuser WHERE user_id = $1",
      [user_id]
    );
    return result.rows[0];
  },

  // Kreiraj novog korisnika
  async create({ name, email, authProvider = "manual", providerUserId = null }) {
    try {
      const providerId = providerUserId || email;

      const result = await pool.query(
        `
        INSERT INTO appuser
        (name, email, auth_provider, provider_user_id, role_chosen_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
        `,
        [name, email, authProvider, providerId]
      );

      return result.rows[0];
    } catch (err) {
      console.error(" Greška u UserModel.create:", err.message);
      throw err;
    }
  },
};
