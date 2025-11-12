import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Administrator
 *   description: Rute za administraciju korisnika
 */

/**
 * @swagger
 * /api/admin/change-role:
 *   put:
 *     summary: Promijeni korisničku ulogu (student ↔ creator)
 *     tags: [Administrator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 12
 *               newRole:
 *                 type: string
 *                 enum: [student, creator]
 *     responses:
 *       200:
 *         description: Uloga uspješno promijenjena
 *       404:
 *         description: Korisnik nije pronađen
 *       400:
 *         description: Neispravna uloga
 */
router.put("/change-role", verifyAdmin, AdminController.changeUserRole);

export default router;
