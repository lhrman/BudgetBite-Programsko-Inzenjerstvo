import express from "express";
import { LookupController } from "../controllers/lookupController.js";

const router = express.Router();

router.get("/ingredients", LookupController.getIngredients);
router.get("/equipment", LookupController.getEquipment);
router.get("/allergens", LookupController.getAllergens);

export default router;
