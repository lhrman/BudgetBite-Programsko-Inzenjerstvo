import { RecipeModel } from "../models/recipe.js";
import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

export const RecipeController = {
  async createRecipe(req, res) {
    const client = await pool.connect();

    try {
      // autorizacija
      if (req.user.role !== "creator") {
        return res
          .status(403)
          .json({ message: "Samo kreatori mogu objavljivati recepte." });
      }

      const isMultipart =
        req.headers["content-type"]?.includes("multipart/form-data");

      let recipe;
      let ingredients = [];
      let equipment = [];
      let allergens = [];
      let restrictions = [];

      if (isMultipart) {
        // FormData (frontend)
        recipe = {
          recipe_name: req.body.title,
          description: req.body.description,
          prep_time_min: req.body.prepTime,
          price_estimate: req.body.price,
          calories: req.body.calories,
          protein: req.body.protein,
          carbs: req.body.carbs,
          fats: req.body.fat,
          preparation_steps: req.body.steps
            ? JSON.parse(req.body.steps).join("\n")
            : null,
        };

        ingredients = req.body.ingredients
          ? JSON.parse(req.body.ingredients).map(i => ({
              ingredient_id: i.id,
              quantity: i.quantity,
              unit: i.unit,
            }))
          : [];

        equipment = req.body.equipment ? JSON.parse(req.body.equipment) : [];
        allergens = req.body.allergens ? JSON.parse(req.body.allergens) : [];
        restrictions = req.body.restrictions ? JSON.parse(req.body.restrictions) : [];

      } else {
        // JSON (Swagger / bez slike)
        recipe = req.body.recipe;
        ingredients = req.body.ingredients || [];
        equipment = req.body.equipment || [];
        allergens = req.body.allergens || [];
        restrictions = req.body.restrictions || [];
      }

      if (!recipe || !recipe.recipe_name || !recipe.prep_time_min) {
        return res.status(400).json({
          message: "Naziv recepta i vrijeme pripreme su obavezni.",
        });
      }

      await client.query("BEGIN");

      const recipeResult = await client.query(
        `
        INSERT INTO recipe
        (recipe_name, description, prep_time_min, price_estimate,
        calories, protein, carbs, fats, preparation_steps, user_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *;
        `,
        [
          recipe.recipe_name,
          recipe.description,
          recipe.prep_time_min,
          recipe.price_estimate,
          recipe.calories,
          recipe.protein,
          recipe.carbs,
          recipe.fats,
          recipe.preparation_steps,
          req.user.id,
        ]
      );

      const createdRecipe = recipeResult.rows[0];
      const recipe_id = createdRecipe.recipe_id;

      for (const ing of ingredients) {
        await client.query(
          `
          INSERT INTO recipe_ingredients
          (recipe_id, ingredient_id, quantity, unit)
          VALUES ($1, $2, $3, $4)
          `,
          [recipe_id, ing.ingredient_id, ing.quantity, ing.unit]
        );
      }

      for (const equipment_id of equipment) {
        await client.query(
          `
          INSERT INTO recipe_equipment
          (recipe_id, equipment_id)
          VALUES ($1, $2)
          `,
          [recipe_id, equipment_id]
        );
      }

      for (const allergen_id of allergens) {
        await client.query(
          `
          INSERT INTO recipe_allergen
          (recipe_id, allergen_id)
          VALUES ($1, $2)
          `,
          [recipe_id, allergen_id]
        );
      }

      for (const restriction_id of restrictions) {
        await client.query(
          `
          INSERT INTO recipe_restriction
          (recipe_id, restriction_id)
          VALUES ($1, $2)
          `,
          [recipe_id, restriction_id]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Recept uspješno objavljen.",
        recipe: createdRecipe,
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Greška pri kreiranju recepta:", err);
      res.status(500).json({ message: "Greška na serveru." });
    } finally {
      client.release();
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

  async getFullRecipe(req, res) {
    console.log(">>> GET /recipes/:id/full HIT", req.params.id);

    try {
      const recipe = await RecipeModel.getFullById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recept nije pronađen." });
      }
      res.status(200).json(recipe);
    } catch (err) {
      res.status(500).json({ message: "Greška na serveru." });
    }
  },

  async getRecipeStaticData(req, res) {
    try {
      const ingredients = await pool.query(
        "SELECT ingredient_id, name, default_unit FROM ingredient ORDER BY name"
      );

      const allergens = await pool.query(
        "SELECT allergen_id, name FROM allergen ORDER BY name"
      );

      const equipment = await pool.query(
        "SELECT equipment_id, equipment_name FROM equipment ORDER BY equipment_name"
      );

       const restrictions = await pool.query(
        "SELECT restriction_id, name FROM dietary_restriction ORDER BY name"
      );

      res.status(200).json({
        ingredients: ingredients.rows,
        allergens: allergens.rows,
        equipment: equipment.rows,
        restrictions: restrictions.rows
    });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Greška pri dohvaćanju podataka." });
    }
  },

  async getMyRecipes(req, res) {
    console.log("🔥 GET /recipes/my HIT");
    console.log("👤 req.user:", req.user);
    try {
      if (req.user.role !== "creator") {
        return res.status(403).json({ message: "Zabranjen pristup." });
      }

      const result = await pool.query(
        `
            SELECT
            r.recipe_id,
            r.recipe_name,
            r.prep_time_min,
            r.price_estimate,
            r.created_at,
            rm.media_url AS image_url
          FROM recipe r
          LEFT JOIN recipe_media rm
            ON rm.recipe_id = r.recipe_id
          AND rm.media_type = 'picture'
          WHERE r.user_id = $1
          ORDER BY r.created_at DESC;


        `,
        [req.user.id]
      );

      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Greška pri dohvaćanju recepata:", err);
      res.status(500).json({ message: "Greška na serveru." });
    }
  },

  async rateRecipe(req, res) {
  const userId = req.user?.id;
  const recipeId = Number(req.params.id);
  const { rating } = req.body;

  if (!userId) return res.status(401).json({ message: "Niste prijavljeni." });
  if (!Number.isFinite(recipeId)) {
    return res.status(400).json({ message: "Neispravan recipe id." });
  }

  const score = Number(rating);
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: "Rating mora biti broj 1-5." });
  }

  try {
    await pool.query(
      `
      INSERT INTO rating (user_id, recipe_id, score, rated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, recipe_id)
      DO UPDATE SET score = EXCLUDED.score, rated_at = NOW()
      `,
      [userId, recipeId, score]
    );

    return res.status(201).json({ message: "Ocjena spremljena." });
  } catch (err) {
    console.error("rateRecipe error:", err);
    return res.status(500).json({ message: "Greška na serveru.", error: err.message });
  }
},


  async deleteRecipe(req, res) {
    const recipeId = Number(req.params.id);
    const userId = req.user.id;

    if (!recipeId) {
      return res.status(400).json({ message: "Neispravan ID recepta." });
    }

    try {
      // Provjeri postoji li recept i je li od ovog kreatora
      const recipeRes = await pool.query(
        `
        SELECT recipe_id
        FROM recipe
        WHERE recipe_id = $1 AND user_id = $2
        `,
        [recipeId, userId]
      );

      if (recipeRes.rowCount === 0) {
        return res.status(404).json({
          message: "Recept ne postoji ili nemate pravo brisanja."
        });
      }

      // Obriši recept
      // (sve povezane tablice se brišu automatski zbog CASCADE)
      await pool.query(
        `DELETE FROM recipe WHERE recipe_id = $1`,
        [recipeId]
      );

      return res.status(200).json({
        message: "Recept uspješno obrisan."
      });
    } catch (err) {
      console.error("deleteRecipe error:", err);
      return res.status(500).json({
        message: "Greška pri brisanju recepta."
      });
    }
  },

  async uploadRecipePicture(req, res) {
    const recipeId = Number(req.params.id);

    if (!Number.isFinite(recipeId)) {
      return res.status(400).json({ message: "Neispravan recipe id." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Slika nije poslana." });
    }

    try {
      const recipeCheck = await pool.query(
        `SELECT user_id FROM recipe WHERE recipe_id = $1`,
        [recipeId]
      );

      if (recipeCheck.rowCount === 0) {
        return res.status(404).json({ message: "Recept ne postoji." });
      }

      if (recipeCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: "Nemate pravo uređivati ovaj recept." });
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "recipe",
          public_id: `recipe_${recipeId}`,
          overwrite: true,
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              message: "Greška pri uploadu slike."
            });
          }

         try {
            await pool.query("BEGIN");

            await pool.query(
              `
              DELETE FROM recipe_media
              WHERE recipe_id = $1 AND media_type = 'picture'
              `,
              [recipeId]
            );

            await pool.query(
              `
              INSERT INTO recipe_media (recipe_id, media_type, media_url)
              VALUES ($1, 'picture', $2)
              `,
              [recipeId, result.secure_url]
            );

            await pool.query("COMMIT");

            return res.status(200).json({
              message: "Slika uspješno uploadana.",
              image_url: result.secure_url,
            });

          } catch (dbErr) {
            await pool.query("ROLLBACK");
            console.error("DB error after upload:", dbErr);

            return res.status(500).json({
              message: "Slika uploadana, ali greška pri spremanju u bazu."
            });
          }

        }
      );

      uploadStream.end(req.file.buffer);

    } catch (err) {
      console.error("uploadRecipePicture fatal error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  }


};


