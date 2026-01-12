import { pool } from "../config/db.js";

export const StudentController = {
  // Spremanje ankete (F-2)
  async setupProfile(req, res) {
    const { weekly_budget, goals, allergens, equipment } = req.body;
    const userId = req.user.id; // Dobivamo iz tokena preko middlewarea

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Update osnovnih podataka u tablici Student
      await client.query(
        "UPDATE Student SET weekly_budget = $1, goals = $2 WHERE user_id = $3",
        [weekly_budget, goals, userId]
      );

      // 2. Brisanje starih pa unos novih alergija (da nema duplića)
      await client.query("DELETE FROM student_allergen WHERE user_id = $1", [userId]);
      if (allergens && allergens.length > 0) {
        for (const allergenId of allergens) {
          await client.query(
            "INSERT INTO student_allergen (user_id, allergen_id) VALUES ($1, $2)",
            [userId, allergenId]
          );
        }
      }

      await client.query("COMMIT");
      res.status(200).json({ message: "Anketa uspješno spremljena!" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ error: "Greška na serveru." });
    } finally {
      client.release();
    }
  },


  // Dodaj ovo za dohvaćanje opcija za upitnik
  async getStaticData(req, res) {
    try {
      const allergens = await pool.query("SELECT * FROM ALLERGEN");
      const equipment = await pool.query("SELECT * FROM EQUIPMENT");
      const restrictions = await pool.query("SELECT * FROM DIETARY_RESTRICTION");

      res.status(200).json({
        allergens: allergens.rows,
        equipment: equipment.rows,
        restrictions: restrictions.rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};