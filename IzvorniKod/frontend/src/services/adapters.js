// src/services/adapters.js

// Backend DTO -> UI model
export function mapRecipe(dto) {
  return {
    id: dto.recipe_id,
    title: dto.recipe_name,
    description: dto.description ?? "",
    prepTime: dto.prep_time_min ?? null,
    price: typeof dto.price_estimate === "string" ? Number(dto.price_estimate) : dto.price_estimate,
    rating: typeof dto.average_rating === "string" ? Number(dto.average_rating) : dto.average_rating,
    image: (dto.media || []).find(m => m.media_type === "image")?.media_url || null,
    video: (dto.media || []).find(m => m.media_type === "video")?.media_url || null,
    nutrition: {
      calories: dto.calories ?? 0,
      protein: dto.protein ?? 0,
      carbs: dto.carbs ?? 0,
      fats: dto.fats ?? 0,
    },
    ingredients: (dto.ingredients || []).map(i => ({
      id: i.ingredient_id,
      name: i.name,
      quantity: i.quantity ?? null,
      unit: i.unit ?? i.default_unit ?? null,
    })),
    equipment: (dto.equipment || []).map(e => ({
      id: e.equipment_id,
      name: e.equipment_name,
    })),
    allergens: (dto.allergens || []).map(a => ({
      id: a.allergen_id,
      name: a.name,
    })),
    steps: Array.isArray(dto.preparation_steps) ? dto.preparation_steps : (dto.preparation_steps ? dto.preparation_steps.split("\n") : []),
    status: "Published",
  };
}

// UI form -> payload za backend (Recipe + Connections)
export const toCreateRecipePayload = ({
    title,
    description,
    prepTime,
    price,
    calories,
    protein,
    carbs,
    fat,
    ingredients,
    steps,
    selectedEquipmentIds,
    selectedAllergenIds,
    selectedRestrictionIds
  }) => ({
    recipe: {
      recipe_name: title,
      description,
      prep_time_min: Number(prepTime),
      price_estimate: Number(price),
      calories: calories ? Number(calories) : null,
      protein: protein ? Number(protein) : null,
      carbs: carbs ? Number(carbs) : null,
      fats: fat ? Number(fat) : null,
      preparation_steps: steps.join("\n")
    },
    ingredients: ingredients.map(i => ({
      ingredient_id: i.id,
      quantity: Number(i.quantity),
      unit: i.unit
    })),
    equipment: selectedEquipmentIds,
    allergens: selectedAllergenIds,
    restrictions: selectedRestrictionIds
  });

