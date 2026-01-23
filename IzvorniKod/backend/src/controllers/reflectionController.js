import { pool } from "../config/db.js";

const MEALS_PER_WEEK = 21;

function requireStudent(req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Niste prijavljeni." });
    return false;
  }
  if (req.user.role !== "student") {
    res.status(403).json({ message: "Zabranjen pristup – samo student." });
    return false;
  }
  return true;
}

export const ReflectionController = {
  // GET /api/reflection/available-weeks
  async availableWeeks(req, res) {
    if (!requireStudent(req, res)) return;
    const userId = req.user.id;

    try {
      // ✅ vraćamo stringove direktno iz SQL-a (bez JS Date/toISOString)
      const rows = await pool.query(
        `
        SELECT DISTINCT to_char(date_trunc('week', week_start)::date, 'YYYY-MM-DD') AS week_start
        FROM mealplan
        WHERE user_id = $1
        ORDER BY week_start DESC
        LIMIT 20
        `,
        [userId]
      );

      const weeks = rows.rows.map((r) => r.week_start);
      return res.status(200).json({ weeks });
    } catch (err) {
      console.error("availableWeeks error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },

  // GET /api/reflection/details?weekStart=YYYY-MM-DD
  async details(req, res) {
    if (!requireStudent(req, res)) return;

    const userId = req.user.id;
    const weekStartRaw = String(req.query.weekStart || "").trim();

    if (!weekStartRaw) {
      return res.status(400).json({ message: "Parametar weekStart je obavezan." });
    }

    try {
      // 1) mealplan (tolerantno: uspoređujemo po tjednu, ne po exact datumu)
      const mpRes = await pool.query(
        `
        SELECT
          to_char(week_start, 'YYYY-MM-DD') AS week_start,
          to_char(week_end, 'YYYY-MM-DD') AS week_end,
          COALESCE(total_cost, 0) AS mealplan_cost
        FROM mealplan
        WHERE user_id = $1
          AND date_trunc('week', week_start)::date = date_trunc('week', $2::date)::date
        ORDER BY week_start DESC
        LIMIT 1
        `,
        [userId, weekStartRaw]
      );

      if (mpRes.rows.length === 0) {
        return res.status(404).json({ message: "Nema mealplana za taj tjedan." });
      }

      const mp = mpRes.rows[0];
      const ws = mp.week_start; // već string YYYY-MM-DD
      const we = mp.week_end;

      // 2) homeCooked
      const homeCookedRes = await pool.query(
        `
        SELECT COUNT(*)::int AS home_cooked
        FROM food_mood_journal
        WHERE user_id = $1
          AND consumed_at >= $2::date
          AND consumed_at < ($3::date + INTERVAL '1 day')
        `,
        [userId, ws, we]
      );
      const homeCooked = Number(homeCookedRes.rows[0]?.home_cooked ?? 0);

      // 3) avgMood
      const avgMoodRes = await pool.query(
        `
        SELECT COALESCE(AVG((mood_before + mood_after) / 2.0), 0) AS avg_mood
        FROM food_mood_journal
        WHERE user_id = $1
          AND consumed_at >= $2::date
          AND consumed_at < ($3::date + INTERVAL '1 day')
          AND mood_before IS NOT NULL
          AND mood_after IS NOT NULL
        `,
        [userId, ws, we]
      );
      const avgMood = Number(avgMoodRes.rows[0]?.avg_mood ?? 0);

      // 4) moodBreakdown
      const breakdownRes = await pool.query(
        `
        WITH entries AS (
          SELECT ((mood_before + mood_after) / 2.0) AS m
          FROM food_mood_journal
          WHERE user_id = $1
            AND consumed_at >= $2::date
            AND consumed_at < ($3::date + INTERVAL '1 day')
            AND mood_before IS NOT NULL
            AND mood_after IS NOT NULL
        )
        SELECT
          COALESCE(SUM(CASE WHEN m >= 4.5 THEN 1 ELSE 0 END), 0)::int AS excellent,
          COALESCE(SUM(CASE WHEN m >= 3.5 AND m < 4.5 THEN 1 ELSE 0 END), 0)::int AS good,
          COALESCE(SUM(CASE WHEN m >= 2.5 AND m < 3.5 THEN 1 ELSE 0 END), 0)::int AS okay,
          COALESCE(SUM(CASE WHEN m < 2.5 THEN 1 ELSE 0 END), 0)::int AS bad
        FROM entries;
        `,
        [userId, ws, we]
      );

      const bd = breakdownRes.rows[0] || {};
      const moodBreakdown = {
        excellent: Number(bd.excellent ?? 0),
        good: Number(bd.good ?? 0),
        okay: Number(bd.okay ?? 0),
        bad: Number(bd.bad ?? 0),
      };

      // 5) external expenses
      const externalRes = await pool.query(
        `
        SELECT COALESCE(SUM(amount), 0) AS external_cost
        FROM external_expenses
        WHERE user_id = $1
          AND spent_at >= $2::date
          AND spent_at < ($3::date + INTERVAL '1 day')
        `,
        [userId, ws, we]
      );

      const externalCost = Number(externalRes.rows[0]?.external_cost ?? 0);
      const totalSpent = Number(mp.mealplan_cost || 0) + externalCost;

      // 6) lastFourWeeks (zadnja 3 do odabranog + current null)
      const last3Res = await pool.query(
        `
        SELECT
          to_char(week_start, 'YYYY-MM-DD') AS week_start,
          to_char(week_end, 'YYYY-MM-DD') AS week_end
        FROM mealplan
        WHERE user_id = $1
          AND week_start <= $2::date
        ORDER BY week_start DESC
        LIMIT 3
        `,
        [userId, ws]
      );

      const currentWsRes = await pool.query(
        `SELECT to_char(date_trunc('week', CURRENT_DATE)::date, 'YYYY-MM-DD') AS current_week_start`
      );
      const currentWeekStartStr = currentWsRes.rows[0]?.current_week_start;

      const computed = [];
      for (const row of [...last3Res.rows].reverse()) {
        const wStart = row.week_start;
        const wEnd = row.week_end;

        const hcRes = await pool.query(
          `
          SELECT COUNT(*)::int AS home_cooked
          FROM food_mood_journal
          WHERE user_id = $1
            AND consumed_at >= $2::date
            AND consumed_at < ($3::date + INTERVAL '1 day')
          `,
          [userId, wStart, wEnd]
        );

        const cnt = Number(hcRes.rows[0]?.home_cooked ?? 0);
        const completionRate = (cnt / MEALS_PER_WEEK) * 100;

        computed.push({
          weekStart: wStart,
          completionRate: Number.isFinite(completionRate) ? Number(completionRate.toFixed(2)) : 0,
        });
      }

      // current tjedan -> null
      if (currentWeekStartStr) {
        if (currentWeekStartStr > ws) {
          computed.push({ weekStart: currentWeekStartStr, completionRate: null });
        } else if (currentWeekStartStr === ws) {
          const idx = computed.findIndex((x) => x.weekStart === ws);
          if (idx >= 0) computed[idx].completionRate = null;
          else computed.push({ weekStart: ws, completionRate: null });
        }
      }

      return res.status(200).json({
        weekStart: ws,
        weekEnd: we,
        totalSpent,
        homeCooked,
        avgMood,
        moodBreakdown,
        lastFourWeeks: computed,
      });
    } catch (err) {
      console.error("reflection details error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    }
  },
};
