/**
 * @swagger
 * tags:
 *   name: Autentikacija
 *   description: Upravljanje prijavom i registracijom korisnika
 *
 * /api/auth/register:
 *   post:
 *     summary: Registracija novog korisnika
 *     tags: [Autentikacija]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: pero.peric@fer.hr
 *               name:
 *                 type: string
 *                 example: Pero Perić
 *     responses:
 *       "201":
 *         description: Korisnik uspješno kreiran
 *       "200":
 *         description: Korisnik već postoji
 *       "400":
 *         description: Nedostaju obavezna polja
 *       "500":
 *         description: Greška na serveru
 *
 * /api/auth/google:
 *   get:
 *     summary: Pokreni Google OAuth 2.0 prijavu
 *     tags: [Autentikacija]
 *     responses:
 *       302:
 *         description: Preusmjeravanje na Google login
 *
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth povratna ruta
 *     description: Google vraća korisnika na ovu rutu nakon prijave.
 *     tags: [Autentikacija]
 *     responses:
 *       200:
 *         description: Prijava uspješna, vraća JWT token i podatke o korisniku.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *
 * /api/auth/fail:
 *   get:
 *     summary: Neuspješna prijava
 *     tags: [Autentikacija]
 *     responses:
 *       401:
 *         description: Prijava nije uspjela
 */

import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import "../config/googleConfig.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email i ime su obavezni." });
  }

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(200).json({
        message: "Korisnik već postoji.",
        user: existingUser.rows[0],
      });
    }

    const result = await pool.query(
      "INSERT INTO users (email, name, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [email, name]
    );

    const newUser = result.rows[0];
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Korisnik uspješno dodan!",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Greška pri dodavanju korisnika:", err);
    res.status(500).json({ message: "Greška na serveru", error: err.message });
  }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/fail" }),
  (req, res) => {
    const token = jwt.sign(
      { email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Prijava uspješna!",
      token,
      user: req.user,
    });
  }
);

router.get("/fail", (req, res) => {
  res.status(401).json({ message: "Prijava neuspješna!" });
});

export default router;
