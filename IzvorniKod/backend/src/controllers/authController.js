// src/controllers/authController.js
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";

// Pomoćna funkcija za generiranje tokena da se ne ponavljamo
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const AuthController = {
  // --- Logika za REGISTER ---
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

      const newUser = await UserModel.create({ email, name });
      const token = generateToken(newUser);

      res.status(201).json({ message: "Korisnik kreiran", user: newUser, token });
    } catch (err) {
      console.error("Greška pri registraciji:", err);
      res.status(500).json({ message: "Greška na serveru" });
    }
  },

  // --- Logika za LOGIN ---
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
      console.error("❌ Greška pri prijavi:", err);
      res.status(500).json({ message: "Greška na serveru", error: err.message });
    }
  },

  // --- Logika za GET PROFILE ---
  async getProfile(req, res) {
    try {
      // req.user.id dolazi iz verifyToken middleware-a
      const user = await UserModel.findById(req.user.id);
      if (!user)
        return res.status(404).json({ message: "Korisnik nije pronađen" });

      res.status(200).json({ message: "Profil uspješno dohvaćen", user });
    } catch (err) {
      res.status(500).json({ message: "Greška na serveru", error: err.message });
    }
  },

  // --- Logika za GOOGLE CALLBACK ---
  async googleCallback(req, res) {
    // Passport je dodao korisnika u req.user nakon 'done(null, user)'
    const token = generateToken(req.user);

    // Vraćamo isti odgovor kao i kod obične prijave
    // U budućnosti, ovdje možete preusmjeriti korisnika na frontend
    // npr. res.redirect(`http://localhost:3000/auth-success?token=${token}`)
    res.status(200).json({
      message: "Google prijava uspješna!",
      user: req.user,
      token: token,
    });
  },
};