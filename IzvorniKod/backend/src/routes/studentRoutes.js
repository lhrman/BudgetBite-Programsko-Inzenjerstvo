// src/routes/studentRoutes.js
import express from "express";
import { StudentController } from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// OVO TI TREBA DA NAPUNIŠ IZBORNIK:
router.get("/static-data", verifyToken, StudentController.getStaticData);

// OVO TI TREBA DA SPREMIŠ:
router.post("/setup-profile", verifyToken, StudentController.setupProfile);

export default router;