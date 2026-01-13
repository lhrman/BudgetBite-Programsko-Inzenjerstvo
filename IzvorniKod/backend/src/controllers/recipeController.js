import { RecipeModel } from "../models/recipe.js";

export const RecipeController = {
  async createRecipe(req, res) {
    try {
      // autorizacija
      if (req.user.role !== "creator") {
        return res
          .status(403)
          .json({ message: "Samo kreatori mogu objavljivati recepte." });
      }

      // podaci iz bodyja
      const {
        recipe_name,
        description,
        prep_time_min,
        price_estimate,
        calories,
        protein,
        carbs,
        fats,
        preparation_steps,
      } = req.body;

      if (!recipe_name || !prep_time_min) {
        return res
          .status(400)
          .json({ message: "Naziv recepta i vrijeme pripreme su obavezni." });
      }

      // spremanje
      const recipe = await RecipeModel.create({
        recipe_name,
        description,
        prep_time_min,
        price_estimate,
        calories,
        protein,
        carbs,
        fats,
        preparation_steps,
        user_id: req.user.id, // key iz JWT-a
      });

      res.status(201).json({
        message: "Recept uspješno objavljen.",
        recipe,
      });
    } catch (err) {
      console.error("Greška pri kreiranju recepta:", err);
      res.status(500).json({ message: "Greška na serveru." });
    }
  },

  async getAllRecipes(req, res) {
    try {
      const recipes = await RecipeModel.getAll();
      res.status(200).json(recipes);
    } catch (err) {
      res.status(500).json({ message: "Greška na serveru." });
    }
  },

  async getRecipeById(req, res) {
    try {
      const recipe = await RecipeModel.getById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recept nije pronađen." });
      }
      res.status(200).json(recipe);
    } catch (err) {
      res.status(500).json({ message: "Greška na serveru." });
    }
  },
};
