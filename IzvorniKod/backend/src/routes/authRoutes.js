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

// src/routes/authRoutes.js
import express from "express";
import passport from "passport";
import { AuthController } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Klasična Email Registracija i Prijava ---
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// --- Google OAuth Rute ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/login-failed",
    session: false,
  }),
  AuthController.googleCallback
);

// --- Ruta za profil ---
router.get("/profile", verifyToken, AuthController.getProfile);

// Dodajemo 'fail' rutu
router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Google prijava neuspjesna." });
});

export default router;