import { pool } from "../config/db.js";

export async function createNotificationFromTemplate({
  userId,
  userName,
  templateKey,
  meta = {}
}) {
  const result = await pool.query(
    `
    INSERT INTO user_notifications (user_id, template_id, category, title, body, meta)
    SELECT
      $1,
      t.id,
      t.category,
      replace(t.title_template, '{{name}}', $2),
      replace(t.body_template,  '{{name}}', $2),
      $4::jsonb
    FROM notification_templates t
    WHERE t.key = $3
    RETURNING id;
    `,
    [userId, userName, templateKey, JSON.stringify(meta)]
  );

  return result.rows[0];
}

export async function createRandomReminder(userId, userName) {
  const tpl = await pool.query(
    `
    SELECT key
    FROM notification_templates
    WHERE category = 'reminder'
    ORDER BY RANDOM()
    LIMIT 1
    `
  );

  if (tpl.rows.length === 0) return null;

  return createNotificationFromTemplate({
    userId,
    userName,
    templateKey: tpl.rows[0].key
  });
}
