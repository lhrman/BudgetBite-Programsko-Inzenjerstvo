import express from "express";
import { StudentController } from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/static-data", verifyToken, StudentController.getStaticData);
router.post("/setup-profile", verifyToken, StudentController.setupProfile);

// F3
router.post("/mealplan/generate", verifyToken, StudentController.generateMealPlan);
router.get("/mealplan/current", verifyToken, StudentController.getCurrentMealPlan);

// (F18 ako imate tablicu food_mood_journal)
router.post("/food-log", verifyToken, StudentController.createFoodLog);
router.get("/food-log", verifyToken, StudentController.listFoodLog);
router.get("/stats/weekly", verifyToken, StudentController.getWeeklyStats);

export default router;
