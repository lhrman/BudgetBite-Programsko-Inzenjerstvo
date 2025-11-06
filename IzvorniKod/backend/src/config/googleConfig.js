// src/config/googleconfig.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { UserModel } from "../models/User.js"; // <-- KORISTI MODEL

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // 1. Provjeri postoji li korisnik
        let user = await UserModel.findByEmail(email); // <-- KORISTI MODEL

        // 2. Ako ne postoji, kreiraj ga
        if (!user) {
          user = await UserModel.create({ email, name }); // <-- KORISTI MODEL
        }

        // 3. Prolijedi korisnika dalje
        return done(null, user);
      } catch (err) {
        console.error("Greška u Google loginu:", err);
        done(err, null);
      }
    }
  )
);

// Sprema samo ID korisnika u sesiju (ako koristite sesije)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Dohvaća cijelog korisnika iz baze pomoću ID-a iz sesije
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id); // <-- KORISTI MODEL
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});