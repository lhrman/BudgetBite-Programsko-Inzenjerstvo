import { pool } from "../config/db.js";
import dayjs from "dayjs";

export const ExternalExpenseController = {
  async create(req, res) {
    const userId = req.user.id;
    const { amount, spent_at } = req.body;

    if (amount === undefined || amount === null || Number(amount) <= 0 || !spent_at) {
      return res.status(400).json({ success: false, error: "Neispravan iznos ili datum." });
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO external_expenses (user_id, amount, spent_at, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING external_expense_id, user_id, amount, spent_at, created_at
        `,
        [userId, amount, spent_at]
      );

      return res.status(201).json({ success: true, expense: result.rows[0] });
    } catch (err) {
      console.error("ExternalExpense create error:", err);
      return res.status(500).json({ success: false, error: "Greška na serveru." });
    }
  },

  async list(req, res) {
    const userId = req.user.id;
    const { date, week_start } = req.query;

    try {
      // DAILY
      if (date) {
        const rows = await pool.query(
          `
          SELECT external_expense_id, amount, spent_at
          FROM external_expenses
          WHERE user_id = $1
            AND DATE(spent_at) = $2
          ORDER BY spent_at ASC
          `,
          [userId, date]
        );
        return res.status(200).json(rows.rows);
      }

      // WEEKLY
      if (week_start) {
        const start = dayjs(week_start).startOf("day");
        const end = start.add(6, "day").endOf("day");

        const rows = await pool.query(
          `
          SELECT external_expense_id, amount, spent_at
          FROM external_expenses
          WHERE user_id = $1
            AND spent_at >= $2
            AND spent_at <= $3
          ORDER BY spent_at ASC
          `,
          [userId, start.toISOString(), end.toISOString()]
        );
        return res.status(200).json(rows.rows);
      }

      return res.status(400).json({ success: false, error: "Nedostaje date ili week_start." });
    } catch (err) {
      console.error("ExternalExpense list error:", err);
      return res.status(500).json({ success: false, error: "Greška na serveru." });
    }
  },

  // opcionalno
  async remove(req, res) {
    const userId = req.user.id;
    const id = Number(req.params.id);

    if (!id) return res.status(400).json({ success: false, error: "Neispravan id." });

    try {
      const result = await pool.query(
        `
        DELETE FROM external_expenses
        WHERE external_expense_id = $1 AND user_id = $2
        RETURNING external_expense_id
        `,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Trošak nije pronađen (ili nije vaš)." });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("ExternalExpense delete error:", err);
      return res.status(500).json({ success: false, error: "Greška na serveru." });
    }
  },
};
