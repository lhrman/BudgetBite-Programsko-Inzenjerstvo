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
    // Baza nema status — default
    status: "Published",
  };
}

// UI form -> payload za backend (Recipe + RECIPE_MEDIA + veze)
export function toCreateRecipePayload(form) {
  const parseIngredients = (text) =>
    text
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        // podržava "200 g špageta" | "2 kom jaja" | "špinat"
        const m = line.match(/^(\d+(?:[.,]\d+)?)\s*([^\s\d%]*)\s+(.+)$/);
        if (m) {
          const qty = parseFloat(m[1].replace(",", "."));
          const unit = m[2] || null;
          const name = m[3];
          return { name, quantity: isNaN(qty) ? null : qty, unit };
        }
        return { name: line, quantity: null, unit: null };
      });

  const parseEquipment = (text) =>
    text
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

  return {
    recipe_name: form.title,
    description: form.description + (form.instructions ? `\n\nUpute:\n${form.instructions}` : ""),
    prep_time_min: form.prepTime ? Number(form.prepTime) : null,
    price_estimate: form.price ? Number(form.price) : null,
    media: [
      ...(form.imageUrl ? [{ media_type: "image", media_url: form.imageUrl }] : []),
      ...(form.videoUrl ? [{ media_type: "video", media_url: form.videoUrl }] : []),
    ],
    ingredients: parseIngredients(form.ingredients),
    equipment: parseEquipment(form.equipment),
  };
}

