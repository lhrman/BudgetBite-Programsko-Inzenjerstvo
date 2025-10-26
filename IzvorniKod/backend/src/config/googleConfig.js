import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Provjeri postoji li korisnik
        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

        if (result.rows.length === 0) {
          // Ako ne postoji, dodaj ga
          const insert = await pool.query(
            "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
            [email, name]
          );
          return done(null, insert.rows[0]);
        } else {
          return done(null, result.rows[0]);
        }
      } catch (err) {
        console.error("Greška u Google loginu:", err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
