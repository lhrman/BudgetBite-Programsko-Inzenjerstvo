import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.put("/profile", verifyToken, UserController.updateProfile);

export default router;
