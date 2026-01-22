import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { pool } from "../config/db.js";

const router = express.Router();
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const creatorId = req.user.id;

    const { rows } = await pool.query(
      `
      SELECT
        COUNT(*)::int AS "recipeCount",
        COUNT(*) FILTER (WHERE r.average_rating IS NOT NULL AND r.average_rating <> 0)::int AS "ratedRecipeCount",
        COALESCE(
          ROUND(
            AVG(r.average_rating) FILTER (WHERE r.average_rating IS NOT NULL AND r.average_rating <> 0)
          , 1),
          0
        )::float AS "avgRating"
      FROM recipe r
      WHERE r.user_id = $1;
      `,
      [creatorId]
    );

    return res.json(rows[0]); // <-- RETURN je bitan
  } catch (err) {
    console.error("Creator stats error:", err);
    if (res.headersSent) return; // dodatna zaštita
    return res.status(500).json({ message: "Greška pri dohvaćanju statistike kreatora." });
  }
});
export default router;