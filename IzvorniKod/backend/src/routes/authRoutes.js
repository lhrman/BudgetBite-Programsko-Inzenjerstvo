const express = require('express');
const router = express.Router();
// const authController = require('../controllers/authController');

// OVO JE NOVI DIO (SWAGGER KOMENTAR)
/**
 * @swagger
 * tags:
 * name: Autentikacija
 * description: Upravljanje prijavom i registracijom korisnika
 *
 * /auth/register:
 * post:
 * summary: Registracija novog korisnika
 * tags: [Autentikacija]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * example: pero.peric@fer.hr
 * name:
 * type: string
 * example: Pero Perić
 * provider:
 * type: string
 * example: google
 * providerId:
 * type: string
 * example: "102983748291038"
 * responses:
 * "201":
 * description: Korisnik uspješno kreiran ili pronađen (vraća korisnika i token)
 * "400":
 * description: Neispravni podaci (npr. fali email)
 * "500":
 * description: Greška na serveru
 */
router.post('/register', /* authController.register */ (req, res) => {
    // Ovo je samo za test, zamijenit ćeš s pravim kontrolerom
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ message: 'Email je obavezan' });
    }
    res.status(201).send({ message: `Korisnik s emailom ${email} obrađen`, ...req.body });
});

// Staviš slične komentare i za /login, /user/profile, itd.

module.exports = router;