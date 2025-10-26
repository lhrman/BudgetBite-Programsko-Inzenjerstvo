import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import '../config/googleConfig.js'; // Import Google OAuth konfiguracije

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autentikacija
 *   description: Upravljanje prijavom i registracijom korisnika
 */

/**
 * @swagger
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
 *               provider:
 *                 type: string
 *                 example: google
 *               providerId:
 *                 type: string
 *                 example: "102983748291038"
 *     responses:
 *       "201":
 *         description: Korisnik uspješno kreiran ili pronađen (vraća korisnika i token)
 *       "400":
 *         description: Neispravni podaci (npr. fali email)
 *       "500":
 *         description: Greška na serveru
 */
router.post('/register', (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).send({ message: 'Email je obavezan' });

  // Privremeno testiranje — kasnije poveži s bazom
  const token = jwt.sign({ email, name }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).send({
    message: `Korisnik ${email} registriran`,
    token,
    user: { email, name },
  });
});

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Pokreni Google OAuth 2.0 prijavu
 *     tags: [Autentikacija]
 *     responses:
 *       302:
 *         description: Preusmjeravanje na Google login
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
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
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/fail' }),
  (req, res) => {
    const token = jwt.sign(
      { email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Prijava uspješna!',
      token,
      user: req.user,
    });
  }
);

/**
 * @swagger
 * /api/auth/fail:
 *   get:
 *     summary: Neuspješna prijava
 *     tags: [Autentikacija]
 *     responses:
 *       401:
 *         description: Prijava nije uspjela
 */
router.get('/fail', (req, res) => {
  res.status(401).json({ message: 'Prijava neuspješna!' });
});

export default router;
