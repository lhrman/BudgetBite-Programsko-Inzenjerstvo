import { pool } from "../config/db.js";

// Pomoćna funkcija za dohvaćanje korisnika 
const findUserWithRoles = async (field, value) => {
  const query = `
    SELECT 
      a.*, 
      CASE WHEN ad.user_id IS NOT NULL THEN true ELSE false END AS is_admin,
      CASE WHEN s.user_id IS NOT NULL THEN true ELSE false END AS is_student,
      CASE WHEN c.user_id IS NOT NULL THEN true ELSE false END AS is_creator
    FROM appuser a
    LEFT JOIN admin ad ON a.user_id = ad.user_id
    LEFT JOIN student s ON a.user_id = s.user_id
    LEFT JOIN creator c ON a.user_id = c.user_id
    WHERE a.${field} = $1
  `;
  const result = await pool.query(query, [value]);
  return result.rows[0];
};

export const UserModel = {
  // Dohvati korisnika prema emailu 
  async findByEmail(email) {
    return findUserWithRoles("email", email);
  },

  // Dohvati korisnika prema ID-u 
  async findById(user_id) {
    return findUserWithRoles("user_id", user_id);
  },

  // Kreiraj novog korisnika
  async create({ name, email, authProvider = "manual", providerUserId = null }) {
    try {
      const providerId = providerUserId || email;

      const result = await pool.query(
        `
        INSERT INTO appuser
        (name, email, auth_provider, provider_user_id, role_chosen_at)
        VALUES ($1, $2, $3, $4, NULL) 
        RETURNING *;
        `,
       
        [name, email, authProvider, providerId]
      );

      // Vraćamo novog korisnika (ali još bez uloga)
      const newUser = result.rows[0];
      newUser.is_admin = false;
      newUser.is_student = false;
      newUser.is_creator = false;
      return newUser;

    } catch (err) {
      console.error(" Greška u UserModel.create:", err.message);
      throw err;
    }
  },
};