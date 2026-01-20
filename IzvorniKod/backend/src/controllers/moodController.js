import { pool } from "../config/db.js";

export const MoodController = {
  // POST /api/mood
  async createEntry(req, res) {
    const userId = req.user?.id;
    const { mealplan_item_id = null, entry_type, mood, note = null, occurred_at = null } = req.body;

    // entry_type: "before" | "after"
    if (!userId) return res.status(401).json({ message: "Niste prijavljeni." });
    if (!entry_type || !["before", "after"].includes(entry_type)) {
      return res.status(400).json({ message: "entry_type mora biti 'before' ili 'after'." });
    }
    if (!mood || !mood.trim()) {
      return res.status(400).json({ message: "Mood ne može biti prazan." });
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO food_mood_journal
          (user_id, mealplan_item_id, entry_type, mood, note, occurred_at)
        VALUES
          ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
        RETURNING *
        `,
        [userId, mealplan_item_id, entry_type, mood.trim(), note, occurred_at]
      );

      return res.status(201).json({
        message: "Mood zapis spremljen.",
        entry: result.rows[0],
      });
    } catch (err) {
      console.error("createEntry error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },

  // GET /api/mood?days=7
  async listEntries(req, res) {
    const userId = req.user?.id;
    const days = Number(req.query.days ?? 7);

    if (!userId) return res.status(401).json({ message: "Niste prijavljeni." });
    if (!Number.isFinite(days) || days <= 0 || days > 365) {
      return res.status(400).json({ message: "days mora biti broj 1-365." });
    }

    try {
      const result = await pool.query(
        `
        SELECT *
        FROM food_mood_journal
        WHERE user_id = $1
          AND occurred_at >= NOW() - ($2 || ' days')::interval
        ORDER BY occurred_at DESC
        `,
        [userId, String(days)]
      );

      return res.status(200).json({ entries: result.rows });
    } catch (err) {
      console.error("listEntries error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },
};
