import { pool } from "../config/db.js";

// Pomoćna funkcija za dohvaćanje korisnika s ISPRAVNIM ulogama i HASHOM
const findUserWithRoles = async (field, value) => {
  const query = `
    SELECT 
      a.*, 
      -- DODALI SMO password_hash U SELECT
      a.password_hash, 
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
  // Dohvati korisnika prema emailu (sada vraća i password_hash)
  async findByEmail(email) {
    return findUserWithRoles("email", email);
  },

  // Dohvati korisnika prema ID-u (sada vraća i password_hash)
  async findById(user_id) {
    return findUserWithRoles("user_id", user_id);
  },

  // Kreiraj novog korisnika (sada prihvaća i passwordHash)
  async create({
    name,
    email,
    authProvider = "manual",
    providerUserId = null,
    passwordHash = null, // <-- DODALI SMO OVO
  }) {
    try {
      const providerId = providerUserId || email;

      const result = await pool.query(
        `
        INSERT INTO appuser
        (name, email, auth_provider, provider_user_id, role_chosen_at, password_hash)
        VALUES ($1, $2, $3, $4, NULL, $5) 
        RETURNING *;
        `,
        // POPRAVAK: role_chosen_at = NULL, dodan passwordHash kao $5
        [name, email, authProvider, providerId, passwordHash]
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

  async setResetToken(userId, token, expiresAt) {
    await pool.query(
      `
      UPDATE appuser
      SET reset_password_token = $1,
          reset_password_expires = $2
      WHERE user_id = $3
      `,
      [token, expiresAt, userId]
    );
  },

  async findByResetToken(token) {
    const result = await pool.query(
      `
      SELECT *
      FROM appuser
      WHERE reset_password_token = $1
        AND reset_password_expires > NOW()
      `,
      [token]
    );

    return result.rows[0];
  },

  async resetPassword(userId, newPasswordHash) {
    await pool.query(
      `
      UPDATE appuser
      SET password_hash = $1,
          reset_password_token = NULL,
          reset_password_expires = NULL
      WHERE user_id = $2
      `,
      [newPasswordHash, userId]
    );
  },
};