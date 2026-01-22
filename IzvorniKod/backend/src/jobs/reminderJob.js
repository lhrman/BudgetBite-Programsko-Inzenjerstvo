import cron from "node-cron";
import { pool } from "../config/db.js";
import { createNotificationFromTemplate } from "../utils/notificationsService.js";

const REMINDER_KEYS = [
  "REMINDER_WATER_1",
  "REMINDER_WATER_2",
  "REMINDER_BREAK_1",
  "REMINDER_SLEEP_1",
];

export function startReminderJob() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running reminder cron");

    const users = await pool.query(`
      SELECT a.user_id, a.name
      FROM appuser a
      JOIN student s ON s.user_id = a.user_id
      WHERE name = 'Prezim Imenovic'
    `);

    for (const u of users.rows) {
      const key =
        REMINDER_KEYS[Math.floor(Math.random() * REMINDER_KEYS.length)];

      await createNotificationFromTemplate({
        userId: u.user_id,
        userName: u.name,
        templateKey: key
      });
    }
  });
}
