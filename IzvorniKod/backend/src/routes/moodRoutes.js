import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { MoodController } from "../controllers/moodController.js";

const router = express.Router();

router.post("/", verifyToken, MoodController.createEntry);
router.get("/", verifyToken, MoodController.listEntries);

export default router;
