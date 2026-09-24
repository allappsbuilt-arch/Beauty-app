// Static product + ingredient reference data. User-owned data (shelf,
// reviews, usage) lives in the database and references these keys.

const INGREDIENTS = {
  hyaluronic: {
    name: 'Hyaluronic Acid', meta: 'Humectant & Hydrator', status: 'SAFE', category: 'HYDRATION',
    summary: 'A sugar molecule naturally found in skin that can hold up to 1000x its weight in water, drawing moisture into the skin for a plump, dewy finish.',
    benefits: 'Deep hydration, reduces fine lines, accelerates wound healing.',
    skinTypes: 'All Skin Types, especially Dry and Dehydrated skin.',
    myth: { claim: 'Hyaluronic Acid is a harsh acid that exfoliates your skin.', truth: 'Despite the name, it is not an exfoliating acid — it is a gentle humectant that hydrates without irritation.' },
  },
  niacinamide: {
    name: 'Niacinamide', meta: 'Brightening & Barrier Repair', status: 'SAFE', category: 'BARRIER',
    summary: 'A form of Vitamin B3 that strengthens the skin barrier, regulates oil and visibly minimises pores.',
    benefits: 'Minimises pores, evens tone, calms redness, regulates sebum.',
    skinTypes: 'All Skin Types, especially Oily and Combination skin.',
    myth: { claim: 'You cannot use Niacinamide with Vitamin C.', truth: 'Modern formulas are stable together — the old warning came from outdated studies using pure, unstable forms.' },
  },
  vitaminc: {
    name: 'Vitamin C', meta: 'Antioxidant & Brightener', status: 'SAFE', category: 'BRIGHTENING',
    summary: 'A potent antioxidant that protects against environmental damage and fades dark spots over time.',
    benefits: 'Brightens, fades hyperpigmentation, boosts collagen, protects against pollution.',
    skinTypes: 'Most Skin Types; start low if you are sensitive.',
    myth: { claim: 'Vitamin C makes your skin more sensitive to the sun.', truth: 'It actually boosts your SPF’s protection — it is exfoliating acids and retinoids that increase sun sensitivity.' },
  },
  retinol: {
    name: 'Retinol', meta: 'Cell Renewal', status: 'ALERT', category: 'ANTI-AGING',
    summary: 'A Vitamin A derivative that speeds up cell turnover to smooth texture, fine lines and breakouts.',
    benefits: 'Smooths texture, reduces fine lines, clears pores.',
    skinTypes: 'Normal, Oily and Mature skin. Introduce slowly; avoid during pregnancy.',
    myth: { claim: 'Retinol thins your skin.', truth: 'It thins the outer dead layer temporarily but thickens the deeper dermis over time.' },
  },
  ceramides: {
    name: 'Ceramides', meta: 'Barrier Lipids', status: 'SAFE', category: 'BARRIER',
    summary: 'Lipids that make up half of your skin barrier, sealing in moisture and keeping irritants out.',
    benefits: 'Repairs barrier, reduces dryness and sensitivity.',
    skinTypes: 'All Skin Types, especially Dry, Sensitive and Eczema-prone skin.',
    myth: { claim: 'Ceramides are only for dry skin.', truth: 'Every skin type needs a healthy barrier — oily skin benefits too.' },
  },
  glycerin: { name: 'Glycerin', meta: 'Humectant & Hydrator', status: 'SAFE', category: 'HYDRATION' },
  squalane: { name: 'Squalane', meta: 'Lightweight Emollient', status: 'SAFE', category: 'HYDRATION' },
  peptides: { name: 'Peptides', meta: 'Firming & Repair', status: 'SAFE', category: 'ANTI-AGING' },
  aha: { name: 'Glycolic Acid (AHA)', meta: 'Surface Exfoliant', status: 'ALERT', category: 'EXFOLIATION' },
  bha: { name: 'Salicylic Acid (BHA)', meta: 'Pore Exfoliant', status: 'ALERT', category: 'EXFOLIATION' },
  castor: { name: 'Castor Oil', meta: 'Nourishing Oil', status: 'SAFE', category: 'GROWTH' },
  shea: { name: 'Shea Butter', meta: 'Occlusive Emollient', status: 'SAFE', category: 'HYDRATION' },
  linalool: { name: 'Linalool', meta: 'Fragrance Component', status: 'ALERT', category: 'FRAGRANCE' },
  fragrance: { name: 'Fragrance (Parfum)', meta: 'Scent Blend', status: 'ALERT', category: 'FRAGRANCE' },
  parabens: { name: 'Parabens', meta: 'Preservative', status: 'AVOID', category: 'PRESERVATIVE' },
  alcohol: { name: 'Alcohol Denat.', meta: 'Solvent — can dry skin', status: 'AVOID', category: 'SOLVENT' },
};

// Ingredients that shouldn't be layered in the same routine.
const CONFLICTS = [
  ['retinol', 'aha', 'Retinol and AHAs together can over-exfoliate and irritate. Alternate nights.'],
  ['retinol', 'bha', 'Retinol and BHAs together can cause dryness and peeling. Alternate nights.'],
  ['retinol', 'vitaminc', 'Use Vitamin C in the morning and Retinol at night to avoid irritation.'],
  ['aha', 'vitaminc', 'Low-pH acids can destabilise Vitamin C. Use them at different times of day.'],
];

const IMG = {
  serum1: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=60',
  serum2: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&q=60',
  serum3: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&q=60',
  cream: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&q=60',
};

const PRODUCTS = {
  luxe: { name: 'Luxe Revitalizing Serum', brand: 'Maison Luxe', price: 145, size: '30ml', rating: 4.9, category: 'AM', uri: IMG.serum2, ingredients: ['hyaluronic', 'niacinamide', 'peptides', 'squalane', 'fragrance'] },
  glow: { name: 'Daily Glow Essence', brand: 'Radiance Brand', price: 23, size: '30ml', rating: 5, category: 'AM', uri: IMG.serum1, ingredients: ['hyaluronic', 'niacinamide', 'peptides', 'glycerin'] },
  botanic: { name: 'Pure Botanic Oil', brand: 'Herbalist Co', price: 15, size: '30ml', rating: 4, category: 'PM', uri: IMG.serum2, ingredients: ['squalane', 'peptides', 'hyaluronic'] },
  hydraplump: { name: 'Hydra-Plump Serum', brand: 'SkinCeuticals', price: 98, size: '30ml', rating: 4.8, category: 'AM', uri: IMG.serum1, ingredients: ['hyaluronic', 'glycerin', 'peptides'] },
  waterdrench: { name: 'Water Drench Cream', brand: 'Peter Thomas Roth', price: 54, size: '50ml', rating: 4.9, category: 'PM', uri: IMG.serum2, ingredients: ['hyaluronic', 'ceramides', 'glycerin'] },
  hyalpure: { name: 'Hyal-Pure Mist', brand: 'Isntree', price: 19, size: '100ml', rating: 4.7, category: 'AM', uri: IMG.serum3, ingredients: ['hyaluronic', 'glycerin'] },
  radiance: { name: 'Radiance Glow Serum', brand: 'MyFace Labs', price: 38, size: '30ml', rating: 4.6, category: 'AM', uri: IMG.serum1, ingredients: ['niacinamide', 'linalool', 'parabens', 'glycerin', 'vitaminc'] },
  renewal: { name: 'Radiance Renewal Elixir', brand: 'MyFace Labs', price: 52, size: '30ml', rating: 4.8, category: 'PM', uri: IMG.serum3, ingredients: ['retinol', 'squalane', 'ceramides', 'peptides'] },
  ce: { name: 'C E Ferulic', brand: 'SkinCeuticals', price: 182, size: '30ml', rating: 4.7, category: 'AM', uri: IMG.serum1, ingredients: ['vitaminc', 'glycerin', 'alcohol'] },
  nia: { name: 'Niacinamide 10%', brand: 'The Ordinary', price: 6, size: '30ml', rating: 4.5, category: 'PM', uri: IMG.serum2, ingredients: ['niacinamide', 'glycerin'] },
  bhydra: { name: 'B-Hydra Serum', brand: 'Drunk Elephant', price: 49, size: '50ml', rating: 4.6, category: 'AM', uri: IMG.serum3, ingredients: ['hyaluronic', 'glycerin', 'ceramides'] },
  lamer: { name: 'Crème de la Mer', brand: 'La Mer', price: 380, size: '60ml', rating: 4.4, category: 'PM', uri: IMG.cream, ingredients: ['glycerin', 'squalane', 'fragrance'] },
  nightretinol: { name: 'Retinol Night Cream', brand: 'CeraVe', price: 22, size: '50ml', rating: 4.5, category: 'PM', uri: IMG.cream, ingredients: ['retinol', 'ceramides', 'niacinamide'] },
  glycolic: { name: 'Glycolic Toner 7%', brand: 'The Ordinary', price: 13, size: '240ml', rating: 4.4, category: 'PM', uri: IMG.serum3, ingredients: ['aha', 'glycerin'] },
  revitabrow: { name: 'RevitaBrow Advanced', brand: 'RevitaLash', price: 110, size: '3ml', rating: 4.3, category: 'Brow', uri: IMG.serum2, ingredients: ['peptides', 'glycerin'] },
  castoroil: { name: 'Castor Oil Serum', brand: 'Brow Lab', price: 14, size: '10ml', rating: 4.2, category: 'Brow', uri: IMG.serum3, ingredients: ['castor'] },
  lashserum: { name: 'Lash Boost Serum', brand: 'Grande', price: 65, size: '2ml', rating: 4.3, category: 'Lash', uri: IMG.serum1, ingredients: ['peptides', 'castor'] },
  eyecream: { name: 'Caffeine Eye Cream', brand: 'The Inkey List', price: 12, size: '15ml', rating: 4.4, category: 'Eye', uri: IMG.cream, ingredients: ['peptides', 'hyaluronic', 'glycerin'] },
  laneige: { name: 'Laneige Sleeping Mask', brand: 'Laneige', price: 24, size: '20g', rating: 4.8, category: 'PM', uri: IMG.serum1, ingredients: ['shea', 'squalane', 'fragrance'] },
  burts: { name: "Burt's Bees Scrub", brand: "Burt's Bees", price: 9, size: '7g', rating: 4.3, category: 'PM', uri: IMG.serum2, ingredients: ['shea', 'glycerin'] },
};

// Best-effort match of a free-text ingredient name (e.g. read off a label)
// to a known ingredient key.
const ALIASES = {
  hyaluronic: ['hyaluronic', 'sodium hyaluronate'],
  niacinamide: ['niacinamide', 'nicotinamide'],
  vitaminc: ['ascorbic', 'vitamin c', 'ascorbyl'],
  retinol: ['retinol', 'retinal', 'retinyl'],
  ceramides: ['ceramide'],
  glycerin: ['glycerin', 'glycerol'],
  squalane: ['squalane'],
  peptides: ['peptide'],
  aha: ['glycolic', 'lactic acid', 'mandelic'],
  bha: ['salicylic'],
  castor: ['castor', 'ricinus'],
  shea: ['shea', 'butyrospermum'],
  linalool: ['linalool'],
  fragrance: ['fragrance', 'parfum', 'perfume'],
  parabens: ['paraben'],
  alcohol: ['alcohol denat', 'denatured alcohol', 'sd alcohol'],
};
function matchIngredient(name) {
  const n = String(name).toLowerCase();
  return Object.keys(ALIASES).find((k) => ALIASES[k].some((a) => n.includes(a))) || null;
}

function matchProduct(name, brand) {
  const n = `${brand || ''} ${name || ''}`.toLowerCase();
  return Object.keys(PRODUCTS).find((k) => n.includes(PRODUCTS[k].name.toLowerCase())) || null;
}

function ingredientPublic(key) {
  const ing = INGREDIENTS[key];
  return ing ? { key, name: ing.name, meta: ing.meta, status: ing.status, category: ing.category } : null;
}

function productPublic(key) {
  const p = PRODUCTS[key];
  return p ? { key, name: p.name, brand: p.brand, price: p.price, size: p.size, rating: p.rating, category: p.category, uri: p.uri } : null;
}

function searchProducts(q) {
  const needle = String(q || '').trim().toLowerCase();
  return Object.keys(PRODUCTS)
    .filter((k) => !needle || `${PRODUCTS[k].name} ${PRODUCTS[k].brand}`.toLowerCase().includes(needle))
    .map(productPublic);
}

// Ingredient-overlap similarity (Jaccard) between two products.
function similarity(a, b) {
  const A = new Set(PRODUCTS[a].ingredients);
  const B = new Set(PRODUCTS[b].ingredients);
  const shared = [...A].filter((x) => B.has(x)).length;
  return shared / new Set([...A, ...B]).size;
}

// `ingredientKeys` = the product being checked; `otherKeys` = products it
// would be used alongside (e.g. the user's shelf).
function findConflicts(ingredientKeys, otherKeys, selfKey = null) {
  const mine = new Set(ingredientKeys);
  const out = [];
  for (const other of otherKeys) {
    if (other === selfKey || !PRODUCTS[other]) continue;
    const theirs = new Set(PRODUCTS[other].ingredients);
    for (const [x, y, reason] of CONFLICTS) {
      if ((mine.has(x) && theirs.has(y)) || (mine.has(y) && theirs.has(x))) {
        out.push({ productKey: other, productName: PRODUCTS[other].name, reason });
        break;
      }
    }
  }
  return out;
}

module.exports = {
  INGREDIENTS, PRODUCTS, ingredientPublic, productPublic, searchProducts, similarity, findConflicts,
  matchIngredient, matchProduct,
};
