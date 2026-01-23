import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { ReflectionController } from "../controllers/reflectionController.js";

const router = express.Router();

// svi reflection endpointi traže JWT
router.get("/available-weeks", verifyToken, ReflectionController.availableWeeks);
router.get("/details", verifyToken, ReflectionController.details);

export default router;
