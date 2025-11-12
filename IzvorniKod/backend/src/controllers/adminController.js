import { pool } from "../config/db.js";

export const AdminController = {
  // PUT /api/admin/change-role
  async changeUserRole(req, res) {
    const { user_id, newRole } = req.body;

    if (!user_id || !newRole)
      return res.status(400).json({ message: "Nedostaju podaci" });

    if (!["student", "creator"].includes(newRole.toLowerCase()))
      return res.status(400).json({ message: "Neispravna uloga" });

    try {
      // Provjera korisnika
      const userCheck = await pool.query("SELECT * FROM appuser WHERE user_id=$1", [user_id]);
      if (userCheck.rows.length === 0)
        return res.status(404).json({ message: "Korisnik ne postoji" });

      //Brišemo iz obje uloge
      await pool.query("DELETE FROM student WHERE user_id=$1", [user_id]);
      await pool.query("DELETE FROM creator WHERE user_id=$1", [user_id]);

      // Dodajemo novu
      if (newRole.toLowerCase() === "student") {
        await pool.query("INSERT INTO student (user_id) VALUES ($1)", [user_id]);
      } else {
        await pool.query("INSERT INTO creator (user_id) VALUES ($1)", [user_id]);
      }

      return res.status(200).json({
        message: `Uloga korisnika promijenjena na '${newRole}'.`,
      });
    } catch (err) {
      console.error(" Greška pri promjeni uloge:", err.message);
      res.status(500).json({ message: "Greška na serveru", error: err.message });
    }
  },
};
