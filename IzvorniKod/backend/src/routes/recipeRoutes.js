import express from "express";
import { RecipeController } from "../controllers/recipeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// creator only

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: "Objava novog recepta (samo kreator)"
 *     description: >
 *       Omogućuje korisniku s ulogom **creator** da objavi novi recept.
 *       Korisnik mora biti prijavljen (JWT token).
 *       ID kreatora se automatski uzima iz tokena.
 *     tags: [Recepti]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipe_name
 *               - prep_time_min
 *             properties:
 *               recipe_name:
 *                 type: string
 *                 example: "Tjestenina s povrćem"
 *               description:
 *                 type: string
 *                 example: "Brzo i zdravo jelo za svaki dan"
 *               prep_time_min:
 *                 type: integer
 *                 example: 25
 *               price_estimate:
 *                 type: number
 *                 format: float
 *                 example: 4.50
 *               calories:
 *                 type: integer
 *                 example: 520
 *               protein:
 *                 type: integer
 *                 example: 18
 *               carbs:
 *                 type: integer
 *                 example: 65
 *               fats:
 *                 type: integer
 *                 example: 12
 *               preparation_steps:
 *                 type: string
 *                 example: "Skuhaj tjesteninu, dodaj povrće, začini i posluži."
 *     responses:
 *       "201":
 *         description: "Recept uspješno objavljen"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recept uspješno objavljen."
 *                 recipe:
 *                   type: object
 *       "400":
 *         description: "Nedostaju obavezni podaci"
 *       "401":
 *         description: "Nedostaje ili je neispravan JWT token"
 *       "403":
 *         description: "Samo kreatori mogu objavljivati recepte"
 *       "500":
 *         description: "Greška na serveru"
 */

router.post("/", verifyToken, RecipeController.createRecipe);

// public
router.get("/", RecipeController.getAllRecipes);
router.get("/:id", RecipeController.getRecipeById);

export default router;
