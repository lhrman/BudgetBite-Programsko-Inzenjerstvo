import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // <-- DODALI SMO BCRYPT
import { UserModel } from "../models/User.js";
import { pool } from "../config/db.js";

// Pomoćna funkcija za generiranje JWT tokena (ista kao prije)
const generateToken = (user) => {
  let role = "user";
  if (user.is_admin) role = "admin";
  else if (user.is_creator) role = "creator";
  else if (user.is_student) role = "student";

  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const AuthController = {
  // --- REGISTRACIJA (SADA S LOZINKOM) ---
  async register(req, res) {
    // Sada primamo 'password', ali NE 'role' (prema kodu kolege)
    const { email, name, password } = req.body;

    if (!email || !name || !password)
      return res
        .status(400)
        .json({ message: "Email, ime i lozinka su obavezni." });

    try {
      const existing = await UserModel.findByEmail(email);
      if (existing)
        return res
          .status(200)
          .json({ message: "Korisnik već postoji.", user: existing });

      // Hashiranje lozinke
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await UserModel.create({
        name,
        email,
        authProvider: "manual",
        providerUserId: email,
        passwordHash: passwordHash, // <-- Šaljemo hash u model
      });

      const token = generateToken(newUser);

      res.status(201).json({
        message: "Korisnik uspješno kreiran",
        user: newUser,
        token,
      });
    } catch (err) {
      console.error(" Greška pri registraciji:", err.message);
      res.status(500).json({
        message: "Greška na serveru",
        error: err.message,
      });
    }
  },

  // --- PRIJAVA (SADA S LOZINKOM) ---
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email i lozinka su obavezni." });

    try {
      // Dohvati korisnika (sada vraća i 'password_hash')
      const user = await UserModel.findByEmail(email);

      // Provjera postoji li korisnik I ima li uopće lozinku (Google useri nemaju)
      if (!user || !user.password_hash)
        return res
          .status(404)
          .json({ message: "Korisnik nije pronađen ili nema lozinku." });

      // Usporedi poslanu lozinku s hashom u bazi
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch)
        return res.status(401).json({ message: "Neispravna lozinka." });

      // Generiraj JWT token (sada s ispravnom ulogom)
      const token = generateToken(user);

      return res.status(200).json({
        message: "Prijava uspješna!",
        user,
        token,
      });
    } catch (err) {
      console.error(" Greška pri prijavi:", err);
      res.status(500).json({
        message: "Greška na serveru",
        error: err.message,
      });
    }
  },

  // --- PROFIL ---
  async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user)
        return res.status(404).json({ message: "Korisnik nije pronađen." });

      res.status(200).json({
        message: "Profil uspješno dohvaćen",
        user,
      });
    } catch (err) {
      console.error("Greška pri dohvaćanju profila:", err.message);
      res.status(500).json({
        message: "Greška na serveru",
        error: err.message,
      });
    }
  },

  async googleCallback(req, res) {
    console.log(">>> googleCallback START, req.user:", !!req.user);
    const token = generateToken(req.user);
    console.log(">>> generated token length:", token ? token.length : "no token");
    
    res.redirect(`https://budgetbite-r5ij.onrender.com/google-callback?token=${token}`);
  },

  // --- Postavljanje korisničke uloge (ostaje isto, popravljeno od prije) ---
  async setRole(req, res) {
    const { new_role } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Neispravan token, nedostaje user ID." });
    }

    try {
      if (new_role === "student") {
        await pool.query(
          "INSERT INTO student (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
          [userId]
        );
      } else if (new_role === "creator") {
        await pool.query(
          "INSERT INTO creator (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
          [userId]
        );
      } else {
        return res
          .status(400)
          .json({
            message: "Neispravna uloga. Dozvoljeno: 'student' ili 'creator'.",
          });
      }

      await pool.query(
        "UPDATE appuser SET role_chosen_at = NOW() WHERE user_id = $1",
        [userId]
      );

      const updatedUser = await UserModel.findById(userId);
      const newToken = generateToken(updatedUser);

      res.status(200).json({
        // VVV OVDJE JE POPRAVAK 2 VVV (dodani backticks ` `)
        message: `Uloga uspješno postavljena na ${new_role}`,
        // ^^^ KRAJ POPRAVKA 2 ^^^
        user: updatedUser,
         token: newToken,
      });
    } catch (err) {
      console.error("Greška pri postavljanju uloge:", err);
      res.status(500).json({ message: "Greška na serveru", error: err.message });
    }
  },
};