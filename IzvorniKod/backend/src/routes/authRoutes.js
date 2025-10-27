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