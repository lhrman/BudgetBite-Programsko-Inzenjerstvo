import { pool } from "../config/db.js";

export const GdprController = {
  async exportMyData(req, res) {
    const userId = req.user.id;

    try {
      // 1) appuser (bez osjetljivih polja)
      const userRes = await pool.query(
        `
        SELECT user_id, name, email, auth_provider, provider_user_id, role_chosen_at, created_at
        FROM appuser
        WHERE user_id = $1
        `,
        [userId]
      );
      if (userRes.rowCount === 0) {
        return res.status(404).json({ message: "Korisnik nije pronađen." });
      }

      // 2) roles
      const [isAdminRes, isStudentRes, isCreatorRes] = await Promise.all([
        pool.query(`SELECT 1 FROM admin WHERE user_id=$1`, [userId]),
        pool.query(`SELECT 1 FROM student WHERE user_id=$1`, [userId]),
        pool.query(`SELECT 1 FROM creator WHERE user_id=$1`, [userId]),
      ]);

      const roles = {
        is_admin: isAdminRes.rowCount > 0,
        is_student: isStudentRes.rowCount > 0,
        is_creator: isCreatorRes.rowCount > 0,
      };

      // 3) student data (ako postoji)
      let student = null;
      let student_allergens = [];
      let student_restrictions = [];
      let student_equipment = [];
      let goals = [];
      let mealplans = [];
      let mealplan_items = [];
      let mood_journal = [];
      let ratings = [];
      let reflections = [];
      let student_challenges = [];

      if (roles.is_student) {
        const [
          studentRes,
          allergensRes,
          restrictionsRes,
          equipmentRes,
          goalsRes,
          mealplansRes,
          mealplanItemsRes,
          moodRes,
          ratingRes,
          reflectionRes,
          challengesRes,
        ] = await Promise.all([
          pool.query(`SELECT * FROM student WHERE user_id=$1`, [userId]),
          pool.query(
            `
            SELECT sa.allergen_id, a.name
            FROM student_allergen sa
            JOIN allergen a ON a.allergen_id = sa.allergen_id
            WHERE sa.user_id=$1
            ORDER BY sa.allergen_id
            `,
            [userId]
          ),
          pool.query(
            `
            SELECT sd.restriction_id, dr.name
            FROM student_diet sd
            JOIN dietary_restriction dr ON dr.restriction_id = sd.restriction_id
            WHERE sd.user_id=$1
            ORDER BY sd.restriction_id
            `,
            [userId]
          ),
          pool.query(
            `
            SELECT se.equipment_id, e.equipment_name
            FROM student_equipment se
            JOIN equipment e ON e.equipment_id = se.equipment_id
            WHERE se.user_id=$1
            ORDER BY se.equipment_id
            `,
            [userId]
          ),
          pool.query(
            `
            SELECT cs.cilj_id, pc.naziv, pc.opis, cs.created_at
            FROM cilj_student cs
            JOIN prehrambeni_cilj pc ON pc.cilj_id = cs.cilj_id
            WHERE cs.user_id=$1
            ORDER BY cs.created_at DESC
            `,
            [userId]
          ),
          pool.query(`SELECT * FROM mealplan WHERE user_id=$1 ORDER BY week_start DESC`, [userId]),
          pool.query(`SELECT * FROM mealplan_items WHERE user_id=$1 ORDER BY date, meal_type`, [userId]),
          pool.query(`SELECT * FROM food_mood_journal WHERE user_id=$1 ORDER BY created_at DESC`, [userId]),
          pool.query(`SELECT * FROM rating WHERE user_id=$1 ORDER BY created_at DESC`, [userId]),
          pool.query(`SELECT * FROM reflection WHERE user_id=$1 ORDER BY week_start DESC`, [userId]),
          pool.query(`SELECT * FROM student_challenge WHERE user_id=$1`, [userId]),
        ]);

        student = studentRes.rows[0] ?? null;
        student_allergens = allergensRes.rows;
        student_restrictions = restrictionsRes.rows;
        student_equipment = equipmentRes.rows;
        goals = goalsRes.rows;
        mealplans = mealplansRes.rows;
        mealplan_items = mealplanItemsRes.rows;
        mood_journal = moodRes.rows;
        ratings = ratingRes.rows;
        reflections = reflectionRes.rows;
        student_challenges = challengesRes.rows;
      }

      // 4) creator data (ako postoji)
      let recipes = [];
      let recipe_media = [];
      if (roles.is_creator) {
        const [recipesRes, mediaRes] = await Promise.all([
          pool.query(`SELECT * FROM recipe WHERE user_id=$1 ORDER BY created_at DESC`, [userId]),
          pool.query(
            `
            SELECT rm.*
            FROM recipe_media rm
            JOIN recipe r ON r.recipe_id = rm.recipe_id
            WHERE r.user_id = $1
            ORDER BY rm.recipe_id, rm.media_type
            `,
            [userId]
          ),
        ]);
        recipes = recipesRes.rows;
        recipe_media = mediaRes.rows;
      }

      // final export payload
      return res.status(200).json({
        exported_at: new Date().toISOString(),
        user: userRes.rows[0],
        roles,
        student: {
          profile: student,
          allergens: student_allergens,
          restrictions: student_restrictions,
          equipment: student_equipment,
          goals,
          mealplans,
          mealplan_items,
          mood_journal,
          ratings,
          reflections,
          challenges: student_challenges,
        },
        creator: {
          recipes,
          recipe_media,
        },
      });
    } catch (err) {
      console.error("GDPR export error:", err);
      return res.status(500).json({ message: "Greška pri izvozu podataka." });
    }
  },

 async deleteMyAccount(req, res) {
  const userId = req.user?.id;
  console.log("[GDPR DELETE] req.user =", req.user);

  if (!userId) return res.status(401).json({ message: "Nema user id u tokenu." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const rRecipes = await client.query(`DELETE FROM recipe WHERE user_id=$1`, [userId]);
    console.log("[GDPR DELETE] deleted recipes:", rRecipes.rowCount);

    const rUser = await client.query(`DELETE FROM appuser WHERE user_id=$1`, [userId]);
    console.log("[GDPR DELETE] deleted appuser:", rUser.rowCount);

    const check = await client.query(`SELECT user_id FROM appuser WHERE user_id=$1`, [userId]);
    console.log("[GDPR DELETE] exists after delete?", check.rowCount);

    await client.query("COMMIT");

    if (rUser.rowCount === 0) {
      return res.status(404).json({ message: "Nema tog user_id u appuser.", userId });
    }

    return res.status(200).json({ message: "Obrisano.", userId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[GDPR DELETE] error:", err);
    return res.status(500).json({ message: "Greška pri brisanju.", error: err.message });
  } finally {
    client.release();
  }
}

};
