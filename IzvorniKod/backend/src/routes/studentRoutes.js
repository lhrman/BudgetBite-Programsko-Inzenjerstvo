import express from "express";
import { StudentController } from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { StudentChallengeController } from "../controllers/studentChallengeController.js";

const router = express.Router();

router.get("/static-data", verifyToken, StudentController.getStaticData);
router.post("/setup-profile", verifyToken, StudentController.setupProfile);

// F3
router.post("/mealplan/generate", verifyToken, StudentController.generateMealPlan);
router.get("/mealplan/current", verifyToken, StudentController.getCurrentMealPlan);

// (F18 ako imate tablicu food_mood_journal)
router.post("/food-log", verifyToken, StudentController.createFoodLog);
router.get("/food-log", verifyToken, StudentController.listFoodLog);
router.get("/stats/weekly", verifyToken, StudentController.getWeeklyStats);

// Rute za izazove


/**
 * @swagger
 * /api/student/challenge/current:
 *   get:
 *     summary: Dohvati trenutno stanje izazova za studenta
 *     description: >
 *       Vraća aktivni izazov, waiting stanje s countdownom,
 *       ili status all_completed ako su svi izazovi riješeni.
 *     tags:
 *       - Student / Gamification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Uspješan odgovor
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ActiveChallenge'
 *                 - $ref: '#/components/schemas/WaitingChallenge'
 *                 - $ref: '#/components/schemas/AllCompleted'
 *       400:
 *         description: Student nema definiran cilj
 *       500:
 *         description: Greška na serveru
 */
router.get("/challenge/current", verifyToken, StudentChallengeController.getCurrentChallenge);



/**
 * @swagger
 * /api/student/challenge/complete:
 *   post:
 *     summary: Označi izazov kao završen
 *     tags:
 *       - Student / Gamification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challengeId
 *             properties:
 *               challengeId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Izazov uspješno završen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompletedChallenge'
 *       400:
 *         description: Izazov je već završen
 *       500:
 *         description: Greška na serveru
 */
router.post(
  "/challenge/complete",
  verifyToken,
  StudentChallengeController.completeChallenge
);


/**
 * @swagger
 * /api/student/badges:
 *   get:
 *     summary: Dohvati sve osvojene badge-ove studenta
 *     tags:
 *       - Student / Gamification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista badge-ova
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badges:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Badge'
 *       500:
 *         description: Greška na serveru
 */
router.get(
  "/badges",
  verifyToken,
  StudentChallengeController.getBadges
);

router.get("/ping", (req, res) => res.json({ ok: true }));


export default router;
