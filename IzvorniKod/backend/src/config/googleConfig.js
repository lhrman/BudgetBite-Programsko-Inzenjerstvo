import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { UserModel } from "../models/User.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await UserModel.findByEmail(email);

        if (!user) {
          user = await UserModel.create({
            name,
            email,
            authProvider: "google",
            providerUserId: profile.id,
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Greška u Google loginu:", err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.user_id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
