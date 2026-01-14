import express from "express";
import { LookupController } from "../controllers/lookupController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Lookup
 *     description: "Referentni podaci (sastojci, oprema, alergeni)"
 */

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     summary: "Dohvati sve sastojke"
 *     tags: [Lookup]
 *     responses:
 *       200:
 *         description: "Lista sastojaka"
 */
router.get("/ingredients", LookupController.getIngredients);

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: "Dohvati svu opremu"
 *     tags: [Lookup]
 *     responses:
 *       200:
 *         description: "Lista opreme"
 */
router.get("/equipment", LookupController.getEquipment);

/**
 * @swagger
 * /api/allergens:
 *   get:
 *     summary: "Dohvati sve alergene"
 *     tags: [Lookup]
 *     responses:
 *       200:
 *         description: "Lista alergena"
 */
router.get("/allergens", LookupController.getAllergens);

export default router;
