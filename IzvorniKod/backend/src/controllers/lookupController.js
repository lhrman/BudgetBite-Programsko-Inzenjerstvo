import { IngredientModel } from "../models/Ingredient.js";
import { EquipmentModel } from "../models/Equipment.js";
import { AllergenModel } from "../models/Allergen.js";

export const LookupController = {
  async getIngredients(req, res) {
    try {
      const data = await IngredientModel.getAll();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Greška pri dohvaćanju sastojaka." });
    }
  },

  async getEquipment(req, res) {
    try {
      const data = await EquipmentModel.getAll();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Greška pri dohvaćanju opreme." });
    }
  },

  async getAllergens(req, res) {
    try {
      const data = await AllergenModel.getAll();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Greška pri dohvaćanju alergena." });
    }
  },
};
