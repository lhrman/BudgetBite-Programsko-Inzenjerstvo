import { pool } from "../config/db.js";

/* ------------------ helper: time remaining ------------------ */
function calculateTimeRemaining(assignedAt) {
  const assigned = new Date(assignedAt);
  const sevenDaysLater = new Date(assigned.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const diff = sevenDaysLater - now;

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  };
}

export const StudentChallengeController = {

  /* =========================================================
     GET CURRENT CHALLENGE
  ========================================================= */
  async getCurrentChallenge(req, res) {
    console.log("🔍 getCurrentChallenge userId =", req.user.id);
    const userId = req.user.id;

    try {
      // zadnji izazov unutar 7 dana
      const lastRes = await pool.query(
        `
        SELECT sc.*, c.description, c.rule_summary, c.badge_image_url
        FROM student_challenge sc
        JOIN challenge c ON c.challenge_id = sc.challenge_id
        WHERE sc.user_id = $1
          AND sc.assigned_at > NOW() - INTERVAL '7 days'
        ORDER BY sc.assigned_at DESC
        LIMIT 1
        `,
        [userId]
      );

      // Ako postoji izazov u zadnjih 7 dana
      if (lastRes.rows.length > 0) {
        const ch = lastRes.rows[0];

        // AKTIVAN
        if (!ch.completed_at) {
          return res.status(200).json({
            status: "active",
            challenge: {
              challenge_id: ch.challenge_id,
              description: ch.description,
              rule_summary: ch.rule_summary,
              badge_image_url: ch.badge_image_url,
              assigned_at: ch.assigned_at
            }
          });
        }

        // ZAVRŠEN, ALI JOŠ ČEKA
        const remaining = calculateTimeRemaining(ch.assigned_at);
        if (remaining) {
          return res.status(200).json({
            status: "waiting",
            completed_challenge: {
              challenge_id: ch.challenge_id,
              description: ch.description,
              badge_image_url: ch.badge_image_url,
              completed_at: ch.completed_at
            },
            time_remaining: remaining
          });
        }
      }

      // NEMA AKTIVNOG → GENERIRAJ NOVI
      // studentov cilj
      const goalRes = await pool.query(
        `SELECT cilj_id FROM cilj_student WHERE user_id = $1`,
        [userId]
      );

      if (goalRes.rows.length === 0) {
        return res.status(400).json({
          message: "Student nema definiran cilj."
        });
      }

      const ciljId = goalRes.rows[0].cilj_id;

      // random izazov koji još NIJE dobio
      const newRes = await pool.query(
        `
        SELECT *
        FROM challenge
        WHERE goal_id = $1
          AND challenge_id NOT IN (
            SELECT challenge_id
            FROM student_challenge
            WHERE user_id = $2
          )
        ORDER BY RANDOM()
        LIMIT 1
        `,
        [ciljId, userId]
      );

      // SVI IZAZOVI ZAVRŠENI
      if (newRes.rows.length === 0) {
        return res.status(200).json({
          status: "all_completed"
        });
      }

      const newCh = newRes.rows[0];

      await pool.query(
        `
        INSERT INTO student_challenge (user_id, challenge_id, assigned_at)
        VALUES ($1, $2, NOW())
        `,
        [userId, newCh.challenge_id]
      );

      return res.status(200).json({
        status: "active",
        challenge: {
          challenge_id: newCh.challenge_id,
          description: newCh.description,
          rule_summary: newCh.rule_summary,
          badge_image_url: newCh.badge_image_url,
          assigned_at: new Date()
        }
      });

    } catch (err) {
      console.error("getCurrentChallenge error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },

  /* =========================================================
     COMPLETE CHALLENGE
  ========================================================= */
  async completeChallenge(req, res) {
    const userId = req.user.id;
    const { challengeId } = req.body;

    try {
      const upd = await pool.query(
        `
        UPDATE student_challenge
        SET completed_at = NOW()
        WHERE user_id = $1
          AND challenge_id = $2
          AND completed_at IS NULL
        RETURNING completed_at
        `,
        [userId, challengeId]
      );

      if (upd.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Izazov je već završen"
        });
      }

      const badgeRes = await pool.query(
        `
        SELECT badge_image_url
        FROM challenge
        WHERE challenge_id = $1
        `,
        [challengeId]
      );

      return res.status(200).json({
        success: true,
        message: "Čestitamo! Osvojili ste badge!",
        badge: {
          challenge_id: challengeId,
          badge_image_url: badgeRes.rows[0]?.badge_image_url ?? null,
          completed_at: upd.rows[0].completed_at
        }
      });

    } catch (err) {
      console.error("completeChallenge error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },

  /* =========================================================
     GET BADGES
  ========================================================= */
  async getBadges(req, res) {
    const userId = req.user.id;

    try {
      const rows = await pool.query(
        `
        SELECT
          sc.challenge_id,
          sc.completed_at,
          c.description,
          c.badge_image_url
        FROM student_challenge sc
        JOIN challenge c ON c.challenge_id = sc.challenge_id
        WHERE sc.user_id = $1
          AND sc.completed_at IS NOT NULL
        ORDER BY sc.completed_at DESC
        `,
        [userId]
      );

      return res.status(200).json({
        badges: rows.rows
      });

    } catch (err) {
      console.error("getBadges error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  }
};
