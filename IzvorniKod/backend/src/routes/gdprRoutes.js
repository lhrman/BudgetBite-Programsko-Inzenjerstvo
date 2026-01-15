import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { GdprController } from "../controllers/gdprController.js";

const router = express.Router();

router.get("/export", verifyToken, GdprController.exportMyData);
router.get("/ping", (req, res) => res.json({ ok: true }));

router.delete("/me", verifyToken, GdprController.deleteMyAccount);

export default router;
