// backend/src/controllers/calendarController.js
import { google } from "googleapis";
import crypto from "crypto";
import dayjs from "dayjs";
import { pool } from "../config/db.js";

// default vremena (možete i iz fronta slati)
const SLOT_TIME = {
  breakfast: "09:00",
  lunch: "13:00",
  dinner: "19:00",
};

function makeHash(payload) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function getOauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI // npr. http://localhost:3004/api/calendar/google/callback
  );
}

async function getStoredTokens(userId) {
  const r = await pool.query(
    `SELECT * FROM google_oauth_tokens WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return r.rows[0] || null;
}

async function upsertTokens({
  user_id,
  refresh_token,
  access_token,
  access_token_expires_at,
  scope,
  google_email,
  calendar_id = "primary",
}) {
  await pool.query(
    `
    INSERT INTO google_oauth_tokens
      (user_id, refresh_token, access_token, access_token_expires_at, scope, google_email, calendar_id, created_at, updated_at)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7, now(), now())
    ON CONFLICT (user_id)
    DO UPDATE SET
      refresh_token = COALESCE(EXCLUDED.refresh_token, google_oauth_tokens.refresh_token),
      access_token = EXCLUDED.access_token,
      access_token_expires_at = EXCLUDED.access_token_expires_at,
      scope = EXCLUDED.scope,
      google_email = EXCLUDED.google_email,
      calendar_id = COALESCE(EXCLUDED.calendar_id, google_oauth_tokens.calendar_id),
      updated_at = now()
    `,
    [
      user_id,
      refresh_token,
      access_token,
      access_token_expires_at,
      scope,
      google_email,
      calendar_id,
    ]
  );
}

export const CalendarController = {
  // 1) Redirect user to Google consent screen (Calendar scope)
  async connect(req, res) {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Niste prijavljeni." });

    const oauth2Client = getOauthClient();

    const scopes = [
      "https://www.googleapis.com/auth/calendar.events",
      "openid",
      "email",
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // bitno da dobijete refresh_token (barem prvi put)
      scope: scopes,
      include_granted_scopes: true,
      state: String(userId), // MVP; bolje: potpisani state
    });

    return res.status(200).json({ url });
  },

  // 2) Callback: exchange code -> tokens -> save refresh_token
  async callback(req, res) {
    const { code, state } = req.query;
    const userId = Number(state);

    if (!code || !userId) {
      return res.status(400).json({ message: "Nedostaje code/state." });
    }

    try {
      const oauth2Client = getOauthClient();
      const { tokens } = await oauth2Client.getToken(String(code));
      oauth2Client.setCredentials(tokens);

      // email (optional, ali korisno)
      let googleEmail = null;
      try {
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const me = await oauth2.userinfo.get();
        googleEmail = me?.data?.email || null;
      } catch {}

      const expiresAt =
        tokens.expiry_date ? new Date(tokens.expiry_date) : null;

      await upsertTokens({
        user_id: userId,
        refresh_token: tokens.refresh_token || null, // nekad dođe null ako je user već dao consent
        access_token: tokens.access_token || null,
        access_token_expires_at: expiresAt,
        scope: tokens.scope || null,
        google_email: googleEmail,
        calendar_id: "primary",
      });

      // u praksi redirect na frontend “success”
      return res.redirect("https://budgetbite-r5ij.onrender.com/settings?calendar=connected");
    } catch (err) {
      console.error("calendar callback error:", err);
      return res.redirect("https://budgetbite-r5ij.onrender.com/settings?calendar=error");
    }
  },

  async status(req, res) {
    const t = await getStoredTokens(req.user.id);
    return res.status(200).json({
      connected: !!(t && t.refresh_token),
      google_email: t?.google_email || null,
      calendar_id: t?.calendar_id || "primary",
      updated_at: t?.updated_at || null,
    });
  },

  // 3) Sync events for a week (create/update based on calendar_sync_map + sync_hash)
  async syncWeek(req, res) {
    const userId = req.user.id;
    const { week_start } = req.body || {};

    // Student only (preporuka)
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Samo studenti sinkroniziraju plan." });
    }

    const tokensRow = await getStoredTokens(userId);
    if (!tokensRow?.refresh_token) {
      return res.status(400).json({ message: "Google Calendar nije povezan." });
    }

    // dohvat plana: ako week_start nije poslan, uzmi zadnji plan
    const planRes = week_start
      ? await pool.query(
          `SELECT week_start, week_end FROM mealplan WHERE user_id=$1 AND week_start=$2 LIMIT 1`,
          [userId, week_start]
        )
      : await pool.query(
          `SELECT week_start, week_end FROM mealplan WHERE user_id=$1 ORDER BY week_start DESC LIMIT 1`,
          [userId]
        );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ message: "Nema meal plana za sinkronizaciju." });
    }

    const ws = dayjs(planRes.rows[0].week_start).format("YYYY-MM-DD");

    const itemsRes = await pool.query(
      `
      SELECT i.day_of_week, i.meal_slot, i.recipe_id,
             r.recipe_name, r.prep_time_min, r.price_estimate
      FROM mealplan_items i
      JOIN recipe r ON r.recipe_id = i.recipe_id
      WHERE i.user_id=$1 AND i.week_start=$2
      ORDER BY i.day_of_week ASC
      `,
      [userId, ws]
    );

    const oauth2Client = getOauthClient();
    oauth2Client.setCredentials({ refresh_token: tokensRow.refresh_token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarId = tokensRow.calendar_id || "primary";

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const results = [];

      for (const it of itemsRes.rows) {
        const day = Number(it.day_of_week); // 1..7
        const slot = it.meal_slot;
        const time = SLOT_TIME[slot] || "12:00";

        const start = dayjs(ws).add(day - 1, "day").format("YYYY-MM-DD") + "T" + time + ":00";
        const durationMin = Math.max(30, Math.min(120, Number(it.prep_time_min || 45)));
        const end = dayjs(start).add(durationMin, "minute").toISOString();

        const title = `🍽️ ${slot} — ${it.recipe_name}`;
        const desc = `Recept: ${it.recipe_name}\nProcjena cijene: ${it.price_estimate ?? "?"}€\nRecipe ID: ${it.recipe_id}`;

        const syncHash = makeHash(
          `${ws}|${day}|${slot}|${it.recipe_id}|${title}|${start}|${durationMin}`
        );

        const mapRes = await client.query(
          `
          SELECT google_event_id, sync_hash
          FROM calendar_sync_map
          WHERE user_id=$1 AND week_start=$2 AND day_of_week=$3 AND meal_slot=$4
          LIMIT 1
          `,
          [userId, ws, day, slot]
        );

        const existing = mapRes.rows[0] || null;

        // ako hash isti -> skip
        if (existing?.google_event_id && existing.sync_hash === syncHash) {
          results.push({ day, slot, action: "skip", eventId: existing.google_event_id });
          continue;
        }

        const eventBody = {
          summary: title,
          description: desc,
          start: { dateTime: dayjs(start).toISOString() },
          end: { dateTime: end },
        };

        let eventId = existing?.google_event_id || null;

        if (!eventId) {
          const created = await calendar.events.insert({
            calendarId,
            requestBody: eventBody,
          });
          eventId = created.data.id;

          await client.query(
            `
            INSERT INTO calendar_sync_map
              (user_id, week_start, day_of_week, meal_slot, google_calendar_id, google_event_id, sync_hash, last_synced_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7, now())
            ON CONFLICT (user_id, week_start, day_of_week, meal_slot)
            DO UPDATE SET
              google_calendar_id = EXCLUDED.google_calendar_id,
              google_event_id = EXCLUDED.google_event_id,
              sync_hash = EXCLUDED.sync_hash,
              last_synced_at = now()
            `,
            [userId, ws, day, slot, calendarId, eventId, syncHash]
          );

          results.push({ day, slot, action: "create", eventId });
        } else {
          await calendar.events.update({
            calendarId,
            eventId,
            requestBody: eventBody,
          });

          await client.query(
            `
            UPDATE calendar_sync_map
            SET google_calendar_id=$1, sync_hash=$2, last_synced_at=now()
            WHERE user_id=$3 AND week_start=$4 AND day_of_week=$5 AND meal_slot=$6
            `,
            [calendarId, syncHash, userId, ws, day, slot]
          );

          results.push({ day, slot, action: "update", eventId });
        }
      }

      await client.query("COMMIT");
      return res.status(200).json({ message: "Sinkronizacija gotova.", week_start: ws, results });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("syncWeek error:", err);
      return res.status(500).json({ message: "Greška na serveru.", error: err.message });
    } finally {
      client.release();
    }
  },

  // optional: brisanje eventova za tjedan
  async unsyncWeek(req, res) {
    const userId = req.user.id;
    const { week_start } = req.body || {};
    if (!week_start) return res.status(400).json({ message: "week_start je obavezan." });

    const tokensRow = await getStoredTokens(userId);
    if (!tokensRow?.refresh_token) {
      return res.status(400).json({ message: "Google Calendar nije povezan." });
    }

    const oauth2Client = getOauthClient();
    oauth2Client.setCredentials({ refresh_token: tokensRow.refresh_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarId = tokensRow.calendar_id || "primary";

    const maps = await pool.query(
      `SELECT google_event_id FROM calendar_sync_map WHERE user_id=$1 AND week_start=$2`,
      [userId, week_start]
    );

    for (const m of maps.rows) {
      if (!m.google_event_id) continue;
      try {
        await calendar.events.delete({ calendarId, eventId: m.google_event_id });
      } catch {}
    }

    await pool.query(
      `DELETE FROM calendar_sync_map WHERE user_id=$1 AND week_start=$2`,
      [userId, week_start]
    );

    return res.status(200).json({ message: "Unsync napravljen." });
  },
};
