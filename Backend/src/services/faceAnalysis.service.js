const crypto = require('crypto');
const { analyzeImage } = require('./vision.service');
const { HttpError } = require('../utils/httpError');

// Condition scale shared by skin/eye metrics: OPTIMAL/EXCELLENT = best,
// FAIR/LOW = slightly below ideal, MODERATE = noticeable, HIGH = significant.
const CONDITION = ['OPTIMAL', 'EXCELLENT', 'FAIR', 'LOW', 'MODERATE', 'HIGH'];

const score = { type: 'integer', description: 'Health score from 0 (poor) to 100 (excellent).' };
const obj = (properties) => ({
  type: 'object',
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});

const SCHEMA = obj({
  faceDetected: { type: 'boolean', description: 'True only if one real human face is clearly visible.' },
  problem: { type: 'string', description: 'If the photo cannot be analysed, a short user-facing reason (e.g. "Face is too dark"). Otherwise an empty string.' },
  skin: obj({
    score,
    hydration: { type: 'string', enum: CONDITION },
    poreClarity: { type: 'string', enum: CONDITION },
    elasticity: { type: 'string', enum: CONDITION },
    insight: { type: 'string', description: 'One or two sentences of specific, encouraging skincare advice based on what you see.' },
  }),
  eyes: obj({
    score,
    darkCircles: { type: 'string', enum: CONDITION, description: 'OPTIMAL = none visible, HIGH = very pronounced.' },
    puffiness: { type: 'string', enum: CONDITION, description: 'OPTIMAL = none visible, HIGH = very pronounced.' },
    lashLength: { type: 'integer', description: 'Visible lash length score 0-100.' },
    lashDensity: { type: 'integer', description: 'Visible lash density score 0-100.' },
    insight: { type: 'string', description: 'One or two sentences of specific eye-area advice.' },
  }),
  lips: obj({ score, hydration: { type: 'string', enum: ['Optimal', 'Good', 'Fair', 'Dry'] } }),
  brows: obj({ score, fullness: { type: 'string', enum: ['Full', 'Moderate', 'Sparse'] } }),
  hair: obj({
    score,
    density: { type: 'string', enum: ['Excellent', 'Good', 'Moderate', 'Sparse', 'Not visible'] },
    dryness: { type: 'string', enum: ['OPTIMAL', 'MILD', 'HIGH'] },
    oiliness: { type: 'string', enum: ['BALANCED', 'OILY', 'DRY'] },
    flakiness: { type: 'string', enum: ['NONE', 'MILD', 'VISIBLE'] },
  }),
});

const SYSTEM = [
  'You are a cosmetic skin and beauty analyst for a skincare-tracking app.',
  'Assess only visible, cosmetic characteristics from the photo. Never diagnose medical conditions.',
  'Be consistent: the same face in similar lighting should get similar scores.',
  'If there is no clear human face, set faceDetected to false and explain in "problem"; fill other fields with neutral values.',
].join(' ');

const PROMPT = 'Analyse this selfie. Score each area 0-100 and fill every field. Keep insights practical and kind, 1-2 sentences.';

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

// Maps the AI result onto the scan shape the app already renders.
// The skin trend is filled in from scan history by skinTrend.service.
function toScan(ai) {
  const skinScore = clamp(ai.skin.score);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    zones: [
      {
        key: 'skin', title: 'Skin', icon: 'leaf-outline', score: skinScore,
        photoBg: '#B8906C', photoAccent: 'rgba(200,150,100,0.30)',
        metrics: [
          { label: 'Hydration Level', status: ai.skin.hydration },
          { label: 'Pore Clarity', status: ai.skin.poreClarity },
          { label: 'Elasticity', status: ai.skin.elasticity },
        ],
        trend: null,
        quote: `"${ai.skin.insight}"`,
      },
      {
        key: 'eyes', title: 'Eyes', icon: 'eye-outline', score: clamp(ai.eyes.score),
        photoBg: '#7A5040', photoAccent: 'rgba(140,90,60,0.25)',
        metrics: [
          { label: 'Dark Circles', status: ai.eyes.darkCircles },
          { label: 'Puffiness', status: ai.eyes.puffiness },
        ],
        trend: null,
        quote: `"${ai.eyes.insight}"`,
        extras: { lashLength: clamp(ai.eyes.lashLength), lashDensity: clamp(ai.eyes.lashDensity) },
      },
    ],
    ancillary: [
      { key: 'lips', label: 'Lips', score: clamp(ai.lips.score), icon: 'happy-outline', photoBg: '#C08080', metricLabel: 'Hydration', metricVal: ai.lips.hydration },
      {
        key: 'hair', label: 'Hair', score: clamp(ai.hair.score), icon: 'cut-outline', photoBg: '#806040',
        metricLabel: 'Density', metricVal: ai.hair.density,
        extras: { dryness: ai.hair.dryness, oiliness: ai.hair.oiliness, flakiness: ai.hair.flakiness },
      },
      { key: 'brows', label: 'Brows', score: clamp(ai.brows.score), icon: 'brush-outline', photoBg: '#7A6050', metricLabel: 'Fullness', metricVal: ai.brows.fullness },
    ],
  };
}

async function analyzeFace(image) {
  const ai = await analyzeImage({ system: SYSTEM, prompt: PROMPT, image, schemaName: 'face_analysis', schema: SCHEMA });
  if (!ai.faceDetected) {
    throw new HttpError(422, ai.problem || 'No face found. Make sure your whole face is visible and well lit.');
  }
  return toScan(ai);
}

module.exports = { analyzeFace, SCHEMA };
