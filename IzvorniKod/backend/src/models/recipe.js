import { pool } from "../config/db.js";
console.log("RecipeModel loaded");


export const RecipeModel = {
  

  async create({
    recipe_name,
    description,
    prep_time_min,
    price_estimate,
    calories,
    protein,
    carbs,
    fats,
    preparation_steps,
    user_id,
  }) {
    const result = await pool.query(
      `
      INSERT INTO recipe
      (recipe_name, description, prep_time_min, price_estimate,
       calories, protein, carbs, fats, preparation_steps, user_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
      `,
      [
        recipe_name,
        description,
        prep_time_min,
        price_estimate,
        calories,
        protein,
        carbs,
        fats,
        preparation_steps,
        user_id,
      ]
    );

    return result.rows[0];
  },

 async getAll() {
  const result = await pool.query(
    `
    SELECT
      r.*,
      u.name AS creator_name,
      rm.media_url AS image_url,
      COALESCE(ROUND(AVG(rt.score)::numeric, 1), 0.0) AS average_rating
    FROM recipe r
    JOIN appuser u ON u.user_id = r.user_id
    LEFT JOIN recipe_media rm
      ON rm.recipe_id = r.recipe_id
     AND rm.media_type = 'picture'
    LEFT JOIN rating rt
      ON rt.recipe_id = r.recipe_id
    GROUP BY r.recipe_id, u.name, rm.media_url
    ORDER BY r.created_at DESC
    `
  );

  return result.rows;
},


  async getById(recipe_id) {
    const result = await pool.query(
      `
      SELECT
        r.*,
        u.name AS creator_name,
        rm.media_url AS image_url
      FROM recipe r
      JOIN appuser u ON u.user_id = r.user_id
      LEFT JOIN recipe_media rm
        ON rm.recipe_id = r.recipe_id
      AND rm.media_type = 'picture'
      WHERE r.recipe_id = $1
      `,
      [recipe_id]
    );

    return result.rows[0];
  },


  async getFullById(recipe_id) {

    //console.log("zapoceo get full")
    
    const recipeResult = await pool.query(
      `SELECT * FROM recipe WHERE recipe_id = $1`,
      [recipe_id]
    );

    if (!recipeResult.rows[0]) return null;

    const ingredients = await pool.query(
      `SELECT i.ingredient_id, i.name, ri.quantity, ri.unit
      FROM recipe_ingredients ri
      JOIN ingredient i ON i.ingredient_id = ri.ingredient_id
      WHERE ri.recipe_id = $1`,
      [recipe_id]
    );

    const equipment = await pool.query(
      `SELECT e.equipment_id, e.equipment_name
      FROM recipe_equipment re
      JOIN equipment e ON e.equipment_id = re.equipment_id
      WHERE re.recipe_id = $1`,
      [recipe_id]
    );

    const allergens = await pool.query(
      `SELECT a.allergen_id, a.name
      FROM recipe_allergen ra
      JOIN allergen a ON a.allergen_id = ra.allergen_id
      WHERE ra.recipe_id = $1`,
      [recipe_id]
    );

    const restrictions = await pool.query(
      `SELECT dr.restriction_id, dr.name
      FROM recipe_restriction rr
      JOIN dietary_restriction dr ON dr.restriction_id = rr.restriction_id
      WHERE rr.recipe_id = $1`,
      [recipe_id]
    );

    const media = await pool.query(
      `
      SELECT media_type, media_url
      FROM recipe_media
      WHERE recipe_id = $1
      `,
      [recipe_id]
    );

    return {
      ...recipeResult.rows[0],
      ingredients: ingredients.rows,
      equipment: equipment.rows,
      allergens: allergens.rows,
      restrictions: restrictions.rows,
      media: media.rows
    };
  }



};
