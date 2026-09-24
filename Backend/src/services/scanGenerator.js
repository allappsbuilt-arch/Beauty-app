const crypto = require('crypto');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function statusForScore(score) {
  if (score >= 88) return pick(['OPTIMAL', 'EXCELLENT']);
  if (score >= 75) return pick(['FAIR', 'LOW']);
  if (score >= 60) return 'MODERATE';
  return 'HIGH';
}

const SKIN_METRIC_LABELS = ['Hydration Level', 'Pore Clarity', 'Elasticity'];
const EYE_METRIC_LABELS = ['Dark Circles', 'Puffiness'];

const SKIN_QUOTES = [
  '"Your barrier function is remarkably strong this week. Focus on double-cleansing tonight to maintain that pore clarity score."',
  '"Hydration is trending up nicely. Keep layering a humectant serum under moisturizer to lock it in."',
  '"Texture has smoothed out since your last scan. A gentle exfoliation once a week should keep this pace."',
];
const EYE_QUOTES = [
  '"Visible fatigue patterns detected in the periorbital region. Ensure 7+ hours of sleep and use a caffeine-based serum."',
  '"Puffiness is well controlled today. A cold-roller in the morning will keep it that way."',
];

function generateZones() {
  const skinScore = randInt(70, 96);
  const eyeScore = randInt(60, 92);

  return [
    {
      key: 'skin',
      title: 'Skin',
      icon: 'leaf-outline',
      score: skinScore,
      photoBg: '#B8906C',
      photoAccent: 'rgba(200,150,100,0.30)',
      metrics: SKIN_METRIC_LABELS.map((label) => ({ label, status: statusForScore(randInt(60, 98)) })),
      trend: (() => {
        const delta = randInt(-2, 8);
        return {
          label: '4-WEEK TREND',
          value: `${delta >= 0 ? '+' : ''}${delta}.${randInt(0, 9)}%`,
          bars: [randInt(30, 60), randInt(40, 70), randInt(55, 85), randInt(70, 98)].map((v) => v / 100),
        };
      })(),
      quote: pick(SKIN_QUOTES),
    },
    {
      key: 'eyes',
      title: 'Eyes',
      icon: 'eye-outline',
      score: eyeScore,
      photoBg: '#7A5040',
      photoAccent: 'rgba(140,90,60,0.25)',
      metrics: EYE_METRIC_LABELS.map((label) => ({ label, status: statusForScore(randInt(55, 95)) })),
      trend: null,
      quote: pick(EYE_QUOTES),
    },
  ];
}

function generateAncillary() {
  return [
    {
      key: 'lips',
      label: 'Lips',
      score: randInt(78, 97),
      icon: 'happy-outline',
      photoBg: '#C08080',
      metricLabel: 'Hydration',
      metricVal: pick(['Optimal', 'Good', 'Fair']),
    },
    {
      key: 'hair',
      label: 'Hair',
      score: randInt(70, 92),
      icon: 'cut-outline',
      photoBg: '#806040',
      metricLabel: 'Density',
      metricVal: pick(['Good', 'Moderate', 'Excellent']),
    },
    {
      key: 'brows',
      label: 'Brows',
      score: randInt(65, 90),
      icon: 'brush-outline',
      photoBg: '#7A6050',
      metricLabel: 'Fullness',
      metricVal: pick(['Moderate', 'Full', 'Sparse']),
    },
  ];
}

function generateScan() {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    zones: generateZones(),
    ancillary: generateAncillary(),
  };
}

module.exports = { generateScan };
