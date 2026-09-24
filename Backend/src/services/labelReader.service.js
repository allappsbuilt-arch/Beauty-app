const { analyzeImage } = require('./vision.service');
const { HttpError } = require('../utils/httpError');

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['readable', 'problem', 'productName', 'brand', 'ingredients'],
  properties: {
    readable: { type: 'boolean', description: 'True if a cosmetic/skincare ingredient list is legible in the photo.' },
    problem: { type: 'string', description: 'If not readable, a short user-facing reason. Otherwise an empty string.' },
    productName: { type: 'string', description: 'Product name as printed, or empty if not visible.' },
    brand: { type: 'string', description: 'Brand as printed, or empty if not visible.' },
    ingredients: {
      type: 'array',
      description: 'Ingredients in label order (max 40).',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'meta', 'status'],
        properties: {
          name: { type: 'string', description: 'Ingredient name as printed (INCI).' },
          meta: { type: 'string', description: 'Its role in 2-4 words, e.g. "Humectant & Hydrator".' },
          status: {
            type: 'string',
            enum: ['SAFE', 'ALERT', 'AVOID'],
            description: 'SAFE = generally well tolerated; ALERT = common irritant/allergen or strong active; AVOID = widely recommended to avoid.',
          },
        },
      },
    },
  },
};

const SYSTEM = 'You read cosmetic product labels for a skincare app. Transcribe only what is printed; never invent ingredients. Classify each ingredient conservatively for general cosmetic use, not medical advice.';
const PROMPT = 'Read the product name, brand and full ingredient list from this label photo.';

async function readLabel(image) {
  const result = await analyzeImage({ system: SYSTEM, prompt: PROMPT, image, schemaName: 'product_label', schema: SCHEMA });
  if (!result.readable || result.ingredients.length === 0) {
    throw new HttpError(422, result.problem || 'Could not read an ingredient list. Try a sharper, closer photo of the label.');
  }
  return { ...result, ingredients: result.ingredients.slice(0, 40) };
}

module.exports = { readLabel };
