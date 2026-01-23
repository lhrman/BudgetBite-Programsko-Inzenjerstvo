import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { ExternalExpenseController } from "../controllers/externalExpenseController.js";

const router = express.Router();

router.get("/external-expenses", verifyToken, ExternalExpenseController.list);
router.post("/external-expenses", verifyToken, ExternalExpenseController.create);

// opcionalno
router.delete("/external-expenses/:id", verifyToken, ExternalExpenseController.remove);

export default router;
