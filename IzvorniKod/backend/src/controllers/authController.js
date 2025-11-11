import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";

// Pomoćna funkcija za generiranje JWT tokena
const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const AuthController = {
  // --- REGISTRACIJA ---
  async register(req, res) {
    const { email, name } = req.body;

    if (!email || !name)
      return res.status(400).json({ message: "Email i ime su obavezni." });

    try {
      const existing = await UserModel.findByEmail(email);
      if (existing)
        return res
          .status(200)
          .json({ message: "Korisnik već postoji.", user: existing });

      const newUser = await UserModel.create({
        name,
        email,
        authProvider: "manual",
        providerUserId: email,
      });

      const token = generateToken(newUser);

      res.status(201).json({
        message: "Korisnik uspješno kreiran",
        user: newUser,
        token,
      });
    } catch (err) {
      console.error("❌ Greška pri registraciji:", err.message);
      res.status(500).json({
        message: "Greška na serveru",
        error: err.message,
      });
    }
  },

  // --- PRIJAVA ---
  async login(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email je obavezan." });

    try {
      const user = await UserModel.findByEmail(email);
      if (!user)
        return res.status(404).json({ message: "Korisnik ne postoji." });

      const token = generateToken(user);
      res.status(200).json({
        message: "Prijava uspješna!",
        user,
        token,
      });
    } catch (err) {
      console.error("❌ Greška pri prijavi:", err.message);
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
      console.error("❌ Greška pri dohvaćanju profila:", err.message);
      res.status(500).json({
        message: "Greška na serveru",
        error: err.message,
      });
    }
  },

  // --- GOOGLE CALLBACK ---
  async googleCallback(req, res) {
    const token = generateToken(req.user);
    res.status(200).json({
      message: "Google prijava uspješna!",
      user: req.user,
      token: token,
    });
  },
};
