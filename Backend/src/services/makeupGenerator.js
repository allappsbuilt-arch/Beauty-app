const crypto = require('crypto');

const OCCASIONS = {
  wedding: 'Wedding',
  office: 'Office',
  party: 'Party',
  casual: 'Casual',
  photoshoot: 'Photoshoot',
  concert: 'Concert',
  gala: 'Gala',
  interview: 'Interview',
  brunch: 'Brunch',
  gym: 'Gym',
  travel: 'Travel',
  holiday: 'Holiday',
  nightout: 'Night Out',
  graduation: 'Graduation',
  other: 'Other',
};

// `occasions` drives the ranking; `keywords` lets the user's free-text notes
// ("bold lip", "natural", "glitter"...) nudge a look up the list.
const LOOK_CATALOG = [
  {
    key: 'golden', label: 'Golden Hour',
    uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=60',
    description: 'warm bronze lids and a luminous, sun-kissed glow',
    occasions: ['wedding', 'brunch', 'holiday', 'graduation', 'photoshoot', 'travel'],
    keywords: ['warm', 'bronze', 'gold', 'glow', 'shimmer', 'sun'],
  },
  {
    key: 'classic', label: 'Classic Bold',
    uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=60',
    description: 'a sharp winged liner paired with a statement red lip',
    occasions: ['gala', 'party', 'nightout', 'photoshoot', 'wedding'],
    keywords: ['bold', 'red', 'lip', 'wing', 'liner', 'dramatic', 'statement'],
  },
  {
    key: 'midnight', label: 'Midnight Bloom',
    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=60',
    description: 'a deep smoky eye with a berry-stained lip',
    occasions: ['nightout', 'concert', 'party', 'gala'],
    keywords: ['smoky', 'smokey', 'dark', 'berry', 'plum', 'night', 'velvet'],
  },
  {
    key: 'dew', label: 'Natural Dew',
    uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=60',
    description: 'skin-first, fresh and dewy with barely-there colour',
    occasions: ['office', 'casual', 'interview', 'brunch', 'gym', 'travel'],
    keywords: ['natural', 'minimal', 'fresh', 'dewy', 'no-makeup', 'light', 'nude', 'simple'],
  },
  {
    key: 'pearl', label: 'Euphoric Pearl',
    uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=60',
    description: 'pearlescent highlights and soft pastel shimmer',
    occasions: ['wedding', 'graduation', 'photoshoot', 'holiday', 'party'],
    keywords: ['pearl', 'pastel', 'soft', 'pink', 'highlight', 'shimmer', 'romantic'],
  },
  {
    key: 'cyber', label: 'Cyber Rose',
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=60',
    description: 'graphic rose-tinted liner with a glossy, futuristic finish',
    occasions: ['concert', 'party', 'nightout', 'photoshoot'],
    keywords: ['graphic', 'glitter', 'gloss', 'edgy', 'neon', 'fun', 'rose', 'creative'],
  },
  {
    key: 'polished', label: 'Polished Nude',
    uri: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=300&q=60',
    description: 'matte neutral lids, defined brows and a my-lips-but-better nude',
    occasions: ['office', 'interview', 'graduation', 'casual'],
    keywords: ['matte', 'neutral', 'nude', 'professional', 'clean', 'subtle', 'brow'],
  },
  {
    key: 'sport', label: 'Sweat-Proof Fresh',
    uri: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=300&q=60',
    description: 'tinted SPF, waterproof mascara and a hydrating lip tint',
    occasions: ['gym', 'travel', 'casual'],
    keywords: ['waterproof', 'sweat', 'long-lasting', 'spf', 'tint', 'sport', 'lightweight'],
  },
];

const RESULT_COUNT = 6;

function scoreLook(look, occasion, notes) {
  let score = look.occasions.includes(occasion) ? 10 - look.occasions.indexOf(occasion) : 0;
  for (const word of look.keywords) {
    if (notes.includes(word)) score += 4;
  }
  return score;
}

function generateSession({ occasion, notes }) {
  const lowerNotes = (notes || '').toLowerCase();
  const ranked = LOOK_CATALOG
    .map((look) => ({ look, score: scoreLook(look, occasion, lowerNotes) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULT_COUNT);

  const looks = ranked.map(({ look, score }) => ({
    key: look.key,
    label: look.label,
    uri: look.uri,
    description: look.description,
    match: Math.min(99, 70 + score * 2),
  }));

  return {
    id: crypto.randomUUID(),
    occasion,
    occasionLabel: OCCASIONS[occasion],
    notes: notes || '',
    looks,
    recommendedKey: looks[0].key,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { OCCASIONS, generateSession };
