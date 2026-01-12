import express from "express";
import passport from "passport";
import { AuthController } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Autentikacija
 *     description: "Upravljanje prijavom i registracijom korisnika"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: "Registracija novog korisnika (s lozinkom)"
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
 *                 example: "pero.peric@fer.hr"
 *               name:
 *                 type: string
 *                 example: "Pero Perić"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "jakaLozinka123"
 *     responses:
 *       "201":
 *         description: "Korisnik uspješno kreiran"
 *       "200":
 *         description: "Korisnik već postoji"
 *       "400":
 *         description: "Nedostaju obavezna polja"
 *       "500":
 *         description: "Greška na serveru"
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "Prijava postojećeg korisnika (s lozinkom)"
 *     tags: [Autentikacija]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "pero.peric@fer.hr"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "jakaLozinka123"
 *     responses:
 *       "200":
 *         description: "Prijava uspješna, vraća JWT token i podatke o korisniku."
 *       "401":
 *         description: "Neispravna lozinka."
 *       "404":
 *         description: "Korisnik nije pronađen ili nema lozinku."
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: "Pokreni Google OAuth 2.0 prijavu"
 *     tags: [Autentikacija]
 *     responses:
 *       "302":
 *         description: "Preusmjeravanje na Google login"
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: "Google OAuth povratna ruta"
 *     description: "Google vraća korisnika na ovu rutu nakon prijave."
 *     tags: [Autentikacija]
 *     responses:
 *       "200":
 *         description: "Prijava uspješna, vraća JWT token i podatke o korisniku."
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/login-failed",
    session: false,
  }),
  AuthController.googleCallback
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: "Dohvati profil prijavljenog korisnika"
 *     tags: [Autentikacija]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: "Profil uspješno dohvaćen"
 *       "401":
 *         description: "Nedostaje token"
 *       "404":
 *         description: "Korisnik nije pronađen"
 */
router.get("/profile", verifyToken, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/set-role:
 *   patch:
 *     summary: "Postavi korisničku ulogu (student ili creator)"
 *     description: "Korisnik odabire svoju ulogu nakon registracije ili prijave."
 *     tags: [Autentikacija]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_role:
 *                 type: string
 *                 enum: [student, creator]
 *                 example: "student"
 *     responses:
 *       "200":
 *         description: "Uloga uspješno postavljena (vraća novi token)"
 *       "400":
 *         description: "Neispravna uloga"
 *       "401":
 *         description: "Nedostaje token"
 *       "500":
 *         description: "Greška na serveru"
 */
router.patch("/set-role", verifyToken, AuthController.setRole);

/**
 * @swagger
 * /api/auth/login-failed:
 *   get:
 *     summary: "Neuspješna prijava (fallback ruta)"
 *     tags: [Autentikacija]
 *     responses:
 *       "401":
 *         description: "Google prijava neuspješna"
 */
router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Google prijava neuspješna." });
});


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: "Zatraži reset lozinke putem emaila"
 *     description: >
 *       Ako korisnik s navedenim emailom postoji i koristi ručnu prijavu,
 *       backend generira token za reset lozinke i šalje email s linkom.
 *       Iz sigurnosnih razloga odgovor je isti i ako korisnik ne postoji.
 *     tags: [Autentikacija]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "brat@email.com"
 *     responses:
 *       "200":
 *         description: "Ako korisnik postoji, poslan je link za reset lozinke"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ako korisnik s tim emailom postoji, poslan je link za reset lozinke."
 *       "400":
 *         description: "Email nije poslan u zahtjevu"
 *       "500":
 *         description: "Greška na serveru"
 */

router.post("/forgot-password", AuthController.forgotPassword);


/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: "Reset lozinke pomoću tokena"
 *     description: >
 *       Korisnik šalje token dobiven emailom i novu lozinku.
 *       Ako je token važeći i nije istekao, lozinka se mijenja,
 *       a token se trajno briše.
 *     tags: [Autentikacija]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: "a3f9c2e4d1b84c9e8a7f..."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NovaLozinka123!"
 *     responses:
 *       "200":
 *         description: "Lozinka je uspješno promijenjena"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lozinka je uspješno promijenjena."
 *       "400":
 *         description: "Token je nevažeći ili je istekao"
 *       "500":
 *         description: "Greška na serveru"
 */

router.post("/reset-password", AuthController.resetPassword);

export default router;