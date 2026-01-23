import { pool } from "../config/db.js";

export const NotificationController = {

  async list(req, res) {
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    try {
      const { rows } = await pool.query(
        `
        SELECT
          un.id,
          un.title,
          un.body,
          un.category,
          COALESCE(nt.severity, 'info') AS severity,
          un.meta,
          un.created_at,
          un.read_at
        FROM user_notifications un
        LEFT JOIN notification_templates nt ON nt.id = un.template_id
        WHERE un.user_id = $1
        ORDER BY un.created_at DESC
        LIMIT $2
        `,
        [userId, limit]
      );

      const notifications = rows.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        category: n.category,
        severity: n.severity,
        meta: n.meta ?? {},
        createdAt: n.created_at,
        readAt: n.read_at
      }));

      // frontend prihvaća array ili objekt
      return res.status(200).json({ notifications });

    } catch (err) {
      console.error("notifications.list error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },


  async markRead(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      const { rows, rowCount } = await pool.query(
        `
        UPDATE user_notifications
        SET read_at = COALESCE(read_at, NOW())
        WHERE id = $1
          AND user_id = $2
        RETURNING id, read_at
        `,
        [id, userId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ message: "Notifikacija nije pronađena." });
      }

      return res.status(200).json({
        id: rows[0].id,
        readAt: rows[0].read_at
      });

    } catch (err) {
      console.error("notifications.markRead error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },


  async markAllRead(req, res) {
    const userId = req.user.id;

    try {
      await pool.query(
        `
        UPDATE user_notifications
        SET read_at = NOW()
        WHERE user_id = $1
          AND read_at IS NULL
        `,
        [userId]
      );

      return res.status(200).json({ ok: true });

    } catch (err) {
      console.error("notifications.markAllRead error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  }
};
