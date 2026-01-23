// src/services/adapters.js

// Backend DTO -> UI model
// ===== LIST ADAPTER (kartice, grid) =====


// ===== FULL ADAPTER (RecipeView) =====
export function mapRecipeFull(dto) {
  return {
    id: dto.recipe_id,
    title: dto.recipe_name,
    description: dto.description ?? "",
    prepTime: dto.prep_time_min ?? null,
    price: dto.price_estimate != null ? Number(dto.price_estimate) : null,

    nutrition: {
      calories: dto.calories ?? "—",
      protein: dto.protein ?? "—",
      carbs: dto.carbs ?? "—",
      fats: dto.fats ?? "—",
    },

    image:
      (dto.media || []).find(m => m.media_type === "picture")?.media_url ?? null,

    video:
      (dto.media || []).find(m => m.media_type === "video")?.media_url ?? null,

    ingredients: (dto.ingredients || []).map(i => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit ?? i.default_unit ?? "",
    })),

    equipment: (dto.equipment || []).map(e => ({
      id: e.equipment_id,
      name: e.equipment_name,
    })),

    allergens: (dto.allergens || []).map(a => ({
      id: a.allergen_id,
      name: a.name,
    })),

    restrictions:
      (dto.restrictions || dto.dietary_restrictions || []).map(r => ({
        id: r.restriction_id,
        name: r.name,
      })),

    steps:
      typeof dto.preparation_steps === "string"
        ? dto.preparation_steps.split("\n")
        : [],
  };
}


export function mapRecipeList(dto) {
  const calories =
    dto.calories !== null && dto.calories !== undefined
      ? Number(dto.calories)
      : null;

  return {
    id: dto.recipe_id,
    title: dto.recipe_name,
    prepTime: dto.prep_time_min ?? null,

    price:
      typeof dto.price_estimate === "string"
        ? Number(dto.price_estimate)
        : dto.price_estimate,

    rating:
      typeof dto.average_rating === "string"
        ? Number(dto.average_rating)
        : dto.average_rating,

    image: dto.image_url ? dto.image_url : null,

    
    calories,                
    nutrition: { calories },  

    status: "Objavljeno",
  };
}

export function mapCreatorRecipe(dto) {
  return {
    id: dto.recipe_id,
    title: dto.recipe_name,

    prepTime:
      dto.prep_time_min !== null && dto.prep_time_min !== undefined
        ? Number(dto.prep_time_min)
        : null,

    price:
      dto.price_estimate !== null && dto.price_estimate !== undefined
        ? `${Number(dto.price_estimate).toFixed(2)} €`
        : "—",

    rating:
      dto.average_rating !== null && dto.average_rating !== undefined
        ? Number(dto.average_rating).toFixed(1)
        : "—",

    image: dto.image_url ?? null,

    status: "Objavljeno"
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

