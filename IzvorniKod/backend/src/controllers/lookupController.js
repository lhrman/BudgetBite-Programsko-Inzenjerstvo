import { IngredientModel } from "../models/Ingredient.js";
import { EquipmentModel } from "../models/Equipment.js";
import { AllergenModel } from "../models/Allergen.js";

export const LookupController = {
  async getIngredients(req, res) {
    try {
      const { search } = req.query;

      let data;

      if (search && search.trim().length > 0) {
        data = await IngredientModel.search(search);
      } else {
        data = await IngredientModel.getAll();
      }

      res.status(200).json(data);
    } catch (err) {
      console.error("getIngredients error:", err);
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

  async createIngredient(req, res) {
    try {
      const { name, category } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Naziv sastojka je obavezan." });
      }

      const ingredient = await IngredientModel.create({
        name: name.trim(),
        category: category || null,
      });

      return res.status(201).json(ingredient);
    } catch (err) {
      console.error("createIngredient error:", err);

      
      if (err.code === "23505") {
        return res.status(409).json({
          message: "Sastojak s tim imenom već postoji.",
        });
      }

      return res.status(500).json({
        message: "Greška pri dodavanju sastojka.",
      });
    }
  }

};
