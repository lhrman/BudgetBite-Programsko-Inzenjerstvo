import { pool } from "../config/db.js";

const findUserWithRoles = async (field, value) => {
  const query = `
    SELECT 
      a.*,
      a.password_hash,

      -- student profil (ako postoji)
      s.weekly_budget,

      -- uloge
      CASE WHEN ad.user_id IS NOT NULL THEN true ELSE false END AS is_admin,
      CASE WHEN s.user_id  IS NOT NULL THEN true ELSE false END AS is_student,
      CASE WHEN c.user_id  IS NOT NULL THEN true ELSE false END AS is_creator,

      -- allergens (kao JSON array objekata)
      COALESCE((
        SELECT json_agg(json_build_object(
          'allergen_id', al.allergen_id,
          'name', al.name
        ) ORDER BY al.allergen_id)
        FROM student_allergen sa
        JOIN allergen al ON al.allergen_id = sa.allergen_id
        WHERE sa.user_id = a.user_id
      ), '[]'::json) AS allergens,

      -- restrictions (kao JSON array objekata)
      COALESCE((
        SELECT json_agg(json_build_object(
          'restriction_id', dr.restriction_id,
          'name', dr.name
        ) ORDER BY dr.restriction_id)
        FROM student_diet sd
        JOIN dietary_restriction dr ON dr.restriction_id = sd.restriction_id
        WHERE sd.user_id = a.user_id
      ), '[]'::json) AS restrictions,

      -- equipment (kao JSON array objekata)
      COALESCE((
        SELECT json_agg(json_build_object(
          'equipment_id', e.equipment_id,
          'equipment_name', e.equipment_name
        ) ORDER BY e.equipment_id)
        FROM student_equipment se
        JOIN equipment e ON e.equipment_id = se.equipment_id
        WHERE se.user_id = a.user_id
      ), '[]'::json) AS equipment

    FROM appuser a
    LEFT JOIN admin ad   ON ad.user_id = a.user_id
    LEFT JOIN student s  ON s.user_id  = a.user_id
    LEFT JOIN creator c  ON c.user_id  = a.user_id
    WHERE a.${field} = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [value]);
  return result.rows[0];
};

export const UserModel = {
  async findByEmail(email) {
    return findUserWithRoles("email", email);
  },

  async findById(user_id) {
    return findUserWithRoles("user_id", user_id);
  },

  async create({ name, email, authProvider = "manual", providerUserId = null, passwordHash = null }) {
    const providerId = providerUserId || email;

    const result = await pool.query(
      `
      INSERT INTO appuser
        (name, email, auth_provider, provider_user_id, role_chosen_at, password_hash)
      VALUES ($1, $2, $3, $4, NULL, $5)
      RETURNING *;
      `,
      [name, email, authProvider, providerId, passwordHash]
    );

    const newUser = result.rows[0];
    newUser.is_admin = false;
    newUser.is_student = false;
    newUser.is_creator = false;
    newUser.allergens = [];
    newUser.restrictions = [];
    newUser.equipment = [];
    return newUser;
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

  async updateName(userId, name) {
  const result = await pool.query(
    `
    UPDATE appuser
    SET name = $1
    WHERE user_id = $2
    RETURNING user_id, name, email, auth_provider, provider_user_id, role_chosen_at, created_at
    `,
    [name, userId]
  );
  return result.rows[0];
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
