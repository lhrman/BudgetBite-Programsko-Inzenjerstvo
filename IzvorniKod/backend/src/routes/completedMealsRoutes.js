import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { CompletedMealsController } from "../controllers/completedMealsController.js";

const router = express.Router();

// POST /api/completed-meals  { "recipe_id": 123 }
router.post("/completed-meals", verifyToken, CompletedMealsController.create);

// GET /api/completed-meals?week_start=YYYY-MM-DD
router.get("/completed-meals", verifyToken, CompletedMealsController.list);

export default router;
