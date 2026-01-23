import cron from "node-cron";
import { pool } from "../config/db.js";
import { createNotificationFromTemplate } from "../utils/notificationsService.js";

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const REMINDER_KEYS = [
  "REMINDER_WATER_1",
  "REMINDER_WATER_2",
  "REMINDER_BREAK_1",
  "REMINDER_BREAK_2",
  "REMINDER_JOURNAL_1",
  "REMINDER_JOURNAL_2",
  "REMINDER_GROCERY_1",
  "REMINDER_GROCERY_2"

];

const SUGGESTION_KEYS = [
  "SUGGESTION_MEAL_1",
  "SUGGESTION_MEAL_2",
  "SUGGESTION_MEAL_3",
  "SUGGESTION_MEAL_4",
  "SUGGESTION_MEAL_5",
  "SUGGESTION_MEAL_6",
  "SUGGESTION_MEAL_7",
  "SUGGESTION_MEAL_8",
  "SUGGESTION_MEAL_9",
  "SUGGESTION_MEAL_10"
];

const CHALLENGE_KEYS = [
  "CHALLENGE_WATER_1",
  "CHALLENGE_STEPS_1",
  "CHALLENGE_COOK_1",
  "CHALLENGE_FRUIT_1",
  "CHALLENGE_VEG_1",
  "CHALLENGE_SUGAR_1",
  "CHALLENGE_SLEEP_1",
  "CHALLENGE_MINDFUL_1",
  "CHALLENGE_PROTEIN_1",
  "CHALLENGE_PLAN_1",
];

const KEY_GROUPS = {
  reminder: REMINDER_KEYS,
  suggestion: SUGGESTION_KEYS,
  challenge: CHALLENGE_KEYS,
};


export function startReminderJob() {
  cron.schedule("0 */7 * * *", async () => {
    
    const users = await pool.query(`
      SELECT a.user_id, a.name
      FROM appuser a
      JOIN student s ON s.user_id = a.user_id
    `);

    for (const u of users.rows) {

      // random kategorija (reminder / suggestion / challenge)
      const categoryKey = randomFromArray(Object.keys(KEY_GROUPS));

      // random key iz te kategorije
      const templateKey = randomFromArray(KEY_GROUPS[categoryKey]);

      //console.log(
      //  ` Sending ${categoryKey} → ${templateKey} to ${u.name}`
      //);

      // slanje notifikacije
      await createNotificationFromTemplate({
        userId: u.user_id,
        userName: u.name,
        templateKey
      });
    }
  });
}

