import express from "express";
import { RecipeController } from "../controllers/recipeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// creator only

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: "Kreator objavljuje novi recept"
 *     description: >
 *       Omogućuje kreatoru dodavanje recepta zajedno sa sastojcima,
 *       potrebnom opremom i alergenima.
 *     tags:
 *       - Recepti
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipe
 *             properties:
 *               recipe:
 *                 type: object
 *                 required:
 *                   - recipe_name
 *                   - prep_time_min
 *                 properties:
 *                   recipe_name:
 *                     type: string
 *                     example: "Tjestenina s povrćem"
 *                   description:
 *                     type: string
 *                     example: "Brzo i zdravo jelo za svaki dan"
 *                   prep_time_min:
 *                     type: integer
 *                     example: 25
 *                   price_estimate:
 *                     type: number
 *                     format: float
 *                     example: 4.50
 *                   calories:
 *                     type: integer
 *                     example: 520
 *                   protein:
 *                     type: number
 *                     example: 18
 *                   carbs:
 *                     type: number
 *                     example: 65
 *                   fats:
 *                     type: number
 *                     example: 12
 *                   preparation_steps:
 *                     type: string
 *                     example: "Skuhaj tjesteninu, dodaj povrće i začine."
 *
 *               ingredients:
 *                 type: array
 *                 description: "Popis sastojaka s količinama"
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredient_id
 *                     - quantity
 *                     - unit
 *                   properties:
 *                     ingredient_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: number
 *                       example: 200
 *                     unit:
 *                       type: string
 *                       example: "g"
 *
 *               equipment:
 *                 type: array
 *                 description: "ID-evi potrebne kuhinjske opreme"
 *                 items:
 *                   type: integer
 *                   example: 3
 *
 *               allergens:
 *                 type: array
 *                 description: "ID-evi alergena prisutnih u receptu"
 *                 items:
 *                   type: integer
 *                   example: 2
 *
 *     responses:
 *       201:
 *         description: "Recept uspješno objavljen"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recept uspješno objavljen."
 *                 recipe_id:
 *                   type: integer
 *                   example: 12
 *
 *       400:
 *         description: "Neispravan zahtjev"
 *       401:
 *         description: "Nedostaje ili je neispravan token"
 *       403:
 *         description: "Samo kreatori mogu objavljivati recepte"
 *       500:
 *         description: "Greška na serveru"
 */


/**
 * @swagger
 * /api/recipes/static-data:
 *   get:
 *     summary: "Dohvat podataka za formu dodavanja recepta"
 *     tags: [Recepti]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Sastojci, alergeni i oprema"
 */
router.get(
  "/static-data",
  verifyToken,
  RecipeController.getRecipeStaticData
);


router.get("/:id/full", RecipeController.getFullRecipe);
router.post(
  "/",
  verifyToken,
  upload.none(),  
  RecipeController.createRecipe
);

router.get("/my", verifyToken, RecipeController.getMyRecipes);
router.delete("/:id", verifyToken, RecipeController.deleteRecipe);

// public
router.get("/", RecipeController.getAllRecipes);
router.get("/:id", RecipeController.getRecipeById);
router.post("/:id/rating", verifyToken, RecipeController.rateRecipe);


/**
 * @swagger
 * /api/recipes/{id}/picture:
 *   post:
 *     summary: Upload slike recepta
 *     description: >
 *       Uploada sliku recepta na Cloudinary i sprema URL u bazu.
 *       Samo kreator koji je vlasnik recepta može uploadati sliku.
 *     tags:
 *       - Recepti
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID recepta
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Slika recepta (jpg, png, webp)
 *     responses:
 *       200:
 *         description: Slika uspješno uploadana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Slika recepta uspješno uploadana.
 *                 image_url:
 *                   type: string
 *                   example: https://res.cloudinary.com/xxx/image/upload/recipe/recipe_12.jpg
 *       400:
 *         description: Neispravan zahtjev (nema slike ili ID)
 *       401:
 *         description: Nedostaje ili je neispravan token
 *       403:
 *         description: Nemate pravo uređivati ovaj recept
 *       404:
 *         description: Recept ne postoji
 *       500:
 *         description: Greška na serveru
 */

router.post("/:id/picture", verifyToken, upload.single("image"), 
  RecipeController.uploadRecipePicture );


export default router;
