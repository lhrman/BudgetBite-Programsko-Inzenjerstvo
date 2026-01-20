import { pool } from "../config/db.js";

export const MoodController = {
  // POST /api/mood
  // očekuje: consumed_at, recipe_id, mood_before, mood_after, notes (opcionalno)
  async createEntry(req, res) {
    const userId = req.user?.id;
    const {
      consumed_at,
      recipe_id,
      mood_before = null,
      mood_after = null,
      notes = null,
    } = req.body;

    if (!userId) return res.status(401).json({ message: "Niste prijavljeni." });
    if (!consumed_at || !recipe_id) {
      return res.status(400).json({ message: "consumed_at i recipe_id su obavezni." });
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO food_mood_journal
          (consumed_at, recipe_id, user_id, mood_before, mood_after, notes)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (consumed_at, recipe_id, user_id)
        DO UPDATE SET
          mood_before = COALESCE(EXCLUDED.mood_before, food_mood_journal.mood_before),
          mood_after  = COALESCE(EXCLUDED.mood_after,  food_mood_journal.mood_after),
          notes       = COALESCE(EXCLUDED.notes,       food_mood_journal.notes)
        RETURNING *
        `,
        [consumed_at, recipe_id, userId, mood_before, mood_after, notes]
      );

      return res.status(201).json({
        message: "Mood zapis spremljen.",
        entry: result.rows[0],
      });
    } catch (err) {
      console.error("createEntry error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },

  // GET /api/mood?days=7  (koristimo consumed_at)
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
          AND consumed_at >= NOW() - ($2 || ' days')::interval
        ORDER BY consumed_at DESC
        `,
        [userId, String(days)]
      );

      return res.status(200).json({ entries: result.rows });
    } catch (err) {
      console.error("listEntries error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },
};
