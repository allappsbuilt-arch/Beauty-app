const { analyzeImage } = require('./vision.service');
const { HttpError } = require('../utils/httpError');

// Keys match the style tiles in the app's AI Hairstylist / Brow Analysis screens.
const STYLES = {
  hair: {
    bob: { label: 'Modern Bob', desc: 'chin-length blunt or softly textured bob' },
    long: { label: 'Long Layers', desc: 'long hair with face-framing layers' },
    pink: { label: 'Pastel Pink', desc: 'pastel pink colour on a mid-length cut' },
    curly: { label: 'Defined Curls', desc: 'voluminous defined curls' },
    pixie: { label: 'Pixie Cut', desc: 'short cropped pixie' },
    wavy: { label: 'Soft Waves', desc: 'loose shoulder-length waves' },
  },
  brow: {
    natural: { label: 'Natural Arch', desc: 'follows the natural brow bone with a soft arch' },
    feathered: { label: 'Feathered', desc: 'brushed-up, fluffy, hair-like strokes' },
    bold: { label: 'Bold & Defined', desc: 'full, sharply defined and filled-in' },
    straight: { label: 'Straight Soft', desc: 'low, straight "Korean" brow' },
    high: { label: 'High Arch', desc: 'dramatic lifted arch' },
    soft: { label: 'Soft Textured', desc: 'light, diffused, natural texture' },
  },
};

const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong', 'Triangle'];

function schemaFor(kind) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['faceDetected', 'problem', 'faceShape', 'summary', 'ranking'],
    properties: {
      faceDetected: { type: 'boolean' },
      problem: { type: 'string', description: 'If no clear face, a short user-facing reason; otherwise empty.' },
      faceShape: { type: 'string', enum: FACE_SHAPES },
      summary: { type: 'string', description: 'One sentence on which features the recommendations are based on.' },
      ranking: {
        type: 'array',
        description: 'Every style exactly once, best match first.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['key', 'match', 'reason'],
          properties: {
            key: { type: 'string', enum: Object.keys(STYLES[kind]) },
            match: { type: 'integer', description: 'How well it suits this face, 0-100.' },
            reason: { type: 'string', description: 'One short sentence explaining why.' },
          },
        },
      },
    },
  };
}

async function recommendStyles(kind, image, request = '') {
  const styles = STYLES[kind];
  if (!styles) throw new HttpError(400, 'kind must be "hair" or "brow"');
  const note = String(request || '').trim().slice(0, 200);

  const list = Object.entries(styles).map(([key, s]) => `- ${key}: ${s.label} (${s.desc})`).join('\n');
  const result = await analyzeImage({
    system: 'You are a friendly professional stylist. Judge only visible features (face shape, proportions, current hair/brows). Be encouraging and never comment on attractiveness or body weight.',
    prompt: `Rank these ${kind === 'hair' ? 'hairstyles' : 'eyebrow styles'} for the person in this photo:\n${list}`
      + (note ? `\nThe user also asked for: "${note}". Factor that in.` : ''),
    image,
    schemaName: `${kind}_style_ranking`,
    schema: schemaFor(kind),
    detail: 'low',
  });
  if (!result.faceDetected) {
    throw new HttpError(422, result.problem || 'No face found. Use a clear, front-facing photo.');
  }

  // Guarantee one entry per style even if the model skipped or repeated one.
  const seen = new Set();
  const ranking = result.ranking
    .filter((r) => styles[r.key] && !seen.has(r.key) && seen.add(r.key))
    .map((r) => ({ key: r.key, label: styles[r.key].label, match: Math.max(0, Math.min(100, r.match)), reason: r.reason }));
  for (const key of Object.keys(styles)) {
    if (!seen.has(key)) ranking.push({ key, label: styles[key].label, match: 0, reason: '' });
  }

  return { kind, faceShape: result.faceShape, summary: result.summary, ranking };
}

module.exports = { recommendStyles, STYLES };
