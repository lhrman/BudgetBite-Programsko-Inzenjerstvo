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
export function toCreateRecipePayload(form) {
  return {
    recipe_name: form.title,
    description: form.description,
    prep_time_min: Number(form.prepTime) || 0,
    price_estimate: Number(form.price) || 0,
    
    // Nutritional Values
    calories: Number(form.calories) || 0,
    protein: Number(form.protein) || 0,
    carbs: Number(form.carbs) || 0,
    fats: Number(form.fat) || 0,

    // Structured connections
    ingredients: form.ingredients
      .filter(i => i.id) // Only send ingredients with an ID selected
      .map(i => ({
        ingredient_id: i.id,
        quantity: Number(i.quantity) || 0,
      })),
    
    equipmentIds: form.selectedEquipmentIds || [],
    allergenIds: form.selectedAllergenIds || [],
    
    // Preparation steps joined by newline or sent as array (backend dependent)
    preparation_steps: form.steps.filter(s => s.trim()).join("\n"),

    media: [
      ...(form.imageUrl ? [{ media_type: "image", media_url: form.imageUrl }] : []),
      ...(form.videoUrl ? [{ media_type: "video", media_url: form.videoUrl }] : []),
    ],
  };
}
