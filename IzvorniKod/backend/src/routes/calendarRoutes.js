// backend/src/routes/calendarRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { CalendarController } from "../controllers/calendarController.js";

const router = express.Router();

router.get("/google/connect", verifyToken, CalendarController.connect);
router.get("/google/callback", CalendarController.callback); // state nosi userId u MVP-u
router.get("/status", verifyToken, CalendarController.status);

router.post("/sync", verifyToken, CalendarController.syncWeek);
router.post("/unsync", verifyToken, CalendarController.unsyncWeek);

export default router;
