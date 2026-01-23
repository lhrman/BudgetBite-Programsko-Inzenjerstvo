import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { NotificationController } from "../controllers/notificationController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifikacije za korisnike
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Dohvati notifikacije trenutnog korisnika
 *     description: >
 *       Vraća zadnjih N notifikacija za trenutno ulogiranog korisnika,
 *       sortirano po datumu kreiranja (najnovije prvo).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Maksimalan broj notifikacija (default 50, max 100)
 *     responses:
 *       200:
 *         description: Lista notifikacija
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                         example: "💧 Vrijeme je za čašu vode"
 *                       body:
 *                         type: string
 *                         example: "Mali podsjetnik za hidrataciju."
 *                       category:
 *                         type: string
 *                         example: reminder
 *                       severity:
 *                         type: string
 *                         example: info
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       401:
 *         description: Neautoriziran (nema ili je neispravan token)
 */
router.get("/", verifyToken, NotificationController.list);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Označi jednu notifikaciju kao pročitanu
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID notifikacije
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notifikacija označena kao pročitana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 readAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Notifikacija nije pronađena
 *       401:
 *         description: Neautoriziran
 */
router.patch("/:id/read", verifyToken, NotificationController.markRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Označi sve notifikacije kao pročitane
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sve notifikacije označene kao pročitane
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Neautoriziran
 */
router.patch("/read-all", verifyToken, NotificationController.markAllRead);

export default router;
