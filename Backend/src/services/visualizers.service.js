const { analyzeImage } = require('./vision.service');
const { editPhoto } = require('./imageEdit.service');
const { HttpError } = require('../utils/httpError');

// ── Aging Simulator ─────────────────────────────────────────────────────────
// Shows the same selfie `years` from now under two scenarios, so the user can
// see what consistent skincare (SPF, hydration, retinoids) changes.
const AGING_YEARS = [10, 20];
const AGING_SCENARIOS = {
  care: 'who has followed a consistent skincare routine — daily SPF 50, hydration, a retinoid and antioxidants — so their skin has aged gracefully: good elasticity, even tone, only fine expression lines',
  nocare: 'who has skipped sunscreen and skincare, so their skin shows typical sun damage: deeper wrinkles, uneven pigmentation, sun spots, loss of firmness and dullness',
};

async function simulateAging(image, years, scenario) {
  const y = Number(years);
  if (!AGING_YEARS.includes(y)) throw new HttpError(400, 'years must be 10 or 20');
  if (!AGING_SCENARIOS[scenario]) throw new HttpError(400, 'scenario must be "care" or "nocare"');
  const prompt = `Realistically age the person in this photo by ${y} years, showing them as someone ${AGING_SCENARIOS[scenario]}. `
    + 'Keep their identity, facial features, expression, pose, hairstyle, clothing, background, framing and lighting the same; '
    + 'change only natural age-related skin and hair changes. Photorealistic and respectful.';
  return { years: y, scenario, image: await editPhoto(image, prompt) };
}

// ── Symmetry Check ──────────────────────────────────────────────────────────
const FEATURES = ['eyes', 'brows', 'nose', 'lips', 'jawline', 'cheeks'];

const SYMMETRY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['faceDetected', 'problem', 'overall', 'summary', 'features', 'tips'],
  properties: {
    faceDetected: { type: 'boolean' },
    problem: { type: 'string', description: 'If no clear front-facing face, a short user-facing reason; otherwise empty.' },
    overall: { type: 'integer', description: 'Overall facial balance 0-100 (most real faces score 80-95).' },
    summary: { type: 'string', description: 'One encouraging sentence about their facial balance.' },
    features: {
      type: 'array',
      description: 'Each feature exactly once.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'score', 'note'],
        properties: {
          key: { type: 'string', enum: FEATURES },
          score: { type: 'integer', description: 'Left/right balance of this feature, 0-100.' },
          note: { type: 'string', description: 'One short, neutral observation (e.g. "left brow sits slightly higher").' },
        },
      },
    },
    tips: {
      type: 'array',
      description: '2-3 practical grooming or makeup tips to balance any asymmetry (brow shaping, contour, liner placement, photo angle).',
      items: { type: 'string' },
    },
  },
};

async function checkSymmetry(image) {
  const result = await analyzeImage({
    system: 'You are a kind, professional makeup artist assessing facial balance for grooming advice. '
      + 'Perfect symmetry is neither normal nor a beauty standard — say so if relevant. Never comment on attractiveness, weight or ethnicity.',
    prompt: 'Assess the left/right balance of this person\'s facial features from the photo, and suggest grooming or makeup techniques that create extra balance.',
    image,
    schemaName: 'facial_symmetry',
    schema: SYMMETRY_SCHEMA,
  });
  if (!result.faceDetected) {
    throw new HttpError(422, result.problem || 'No face found. Use a clear, front-facing photo.');
  }
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
  const seen = new Set();
  const features = result.features
    .filter((f) => FEATURES.includes(f.key) && !seen.has(f.key) && seen.add(f.key))
    .map((f) => ({ key: f.key, score: clamp(f.score), note: f.note }));
  return { overall: clamp(result.overall), summary: result.summary, features, tips: result.tips.slice(0, 3) };
}

module.exports = { simulateAging, checkSymmetry, AGING_YEARS };
