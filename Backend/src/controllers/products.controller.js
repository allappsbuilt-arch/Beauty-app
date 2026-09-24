const { supabase } = require('../db/database');
const catalog = require('../services/productCatalog');
const checks = require('../services/dailyChecks.service');
const { loadPreferences } = require('./preferences.controller');
const { readLabel } = require('../services/labelReader.service');

const SHELF_AREA = 'shelf';
const FEATURED_ROTATION = ['hyaluronic', 'niacinamide', 'vitaminc', 'retinol', 'ceramides'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function requireProduct(req, res) {
  const key = req.params.key || req.body?.productKey;
  if (!catalog.PRODUCTS[key]) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return key;
}

async function shelfKeys(userId) {
  const { data, error } = await supabase.from('shelf_items').select('product_key').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.product_key);
}

// ─── Catalog ────────────────────────────────────────────────────────────────

async function search(req, res) {
  return res.json({ products: catalog.searchProducts(req.query.q) });
}

// Ingredient Scanner: breakdown + compatibility against the user's allergy
// list and the products already on their shelf. Shared by catalog analysis
// and label scans; `ingredients` items are { key (or null), name, meta, status }.
async function buildAnalysis(userId, { product, productKey, ingredients }) {
  const [prefs, onShelf] = await Promise.all([loadPreferences(userId), shelfKeys(userId)]);
  const restricted = new Set(prefs.allergies.ingredients);

  const allergyAlerts = ingredients.filter((i) => i.key && restricted.has(i.key)).map((i) => i.name);
  const known = ingredients.map((i) => i.key).filter(Boolean);
  const conflicts = catalog.findConflicts(known, onShelf, productKey);
  const penalty = allergyAlerts.length * 20 + conflicts.length * 10
    + ingredients.filter((i) => i.status === 'AVOID').length * 8
    + ingredients.filter((i) => i.status === 'ALERT').length * 3;

  return {
    product,
    compatibility: Math.max(5, Math.min(100, 100 - penalty)),
    ingredients,
    allergyAlerts,
    conflicts,
    onShelf: productKey ? onShelf.includes(productKey) : false,
  };
}

async function analyze(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  return res.json(await buildAnalysis(req.userId, {
    product: catalog.productPublic(key),
    productKey: key,
    ingredients: catalog.PRODUCTS[key].ingredients.map(catalog.ingredientPublic),
  }));
}

// Ingredient Scanner photo: read the label, then run the same analysis.
// Known products resolve to their catalog entry (so they can go on the shelf).
async function scanLabel(req, res) {
  const label = await readLabel(req.body?.image);
  const productKey = catalog.matchProduct(label.productName, label.brand);
  const ingredients = label.ingredients.map((ing) => {
    const key = catalog.matchIngredient(ing.name);
    return key ? catalog.ingredientPublic(key) : { key: null, name: ing.name, meta: ing.meta, status: ing.status };
  });
  // The same ingredient can appear under two names — keep the first.
  const seen = new Set();
  const unique = ingredients.filter((i) => {
    const id = i.key || i.name.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const product = productKey
    ? catalog.productPublic(productKey)
    : { key: null, name: label.productName || 'Scanned product', brand: label.brand || '', uri: null };
  return res.json({ ...(await buildAnalysis(req.userId, { product, productKey, ingredients: unique })), scanned: true });
}

const DUPE_SORTS = {
  similarity: (a, b) => b.similarity - a.similarity,
  price: (a, b) => a.price - b.price,
  rating: (a, b) => b.rating - a.rating,
};

async function dupes(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  const sort = DUPE_SORTS[req.query.sort] ? req.query.sort : 'similarity';
  const original = catalog.PRODUCTS[key];
  const needle = String(req.query.q || '').trim().toLowerCase();

  const matches = Object.keys(catalog.PRODUCTS)
    .filter((k) => k !== key && catalog.PRODUCTS[k].price < original.price)
    .map((k) => ({ ...catalog.productPublic(k), similarity: catalog.similarity(key, k) }))
    .filter((m) => m.similarity >= 0.25)
    .filter((m) => !needle || `${m.name} ${m.brand}`.toLowerCase().includes(needle))
    .map((m) => ({ ...m, match: Math.round(m.similarity * 100), save: +(original.price - m.price).toFixed(2) }))
    .sort(DUPE_SORTS[sort]);

  return res.json({ original: catalog.productPublic(key), sort, matches });
}

async function ingredientGuide(req, res) {
  const week = Math.floor(Date.now() / WEEK_MS);
  const featuredKey = FEATURED_ROTATION[week % FEATURED_ROTATION.length];
  const featured = catalog.INGREDIENTS[featuredKey];

  const recommended = Object.keys(catalog.PRODUCTS)
    .filter((k) => catalog.PRODUCTS[k].ingredients.includes(featuredKey))
    .map(catalog.productPublic)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const past = [1, 2, 3].map((ago) => {
    const k = FEATURED_ROTATION[(((week - ago) % FEATURED_ROTATION.length) + FEATURED_ROTATION.length) % FEATURED_ROTATION.length];
    const ing = catalog.INGREDIENTS[k];
    return { key: k, name: ing.name, category: ing.category, weeksAgo: ago, benefits: ing.benefits };
  });

  return res.json({
    featured: { key: featuredKey, ...featured },
    recommended,
    past,
  });
}

// ─── Reviews ────────────────────────────────────────────────────────────────

const REVIEW_SORTS = { helpful: 'helpful', recent: 'recent' };

async function listReviews(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  const sort = REVIEW_SORTS[req.query.sort] || 'helpful';

  const { data: rows, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_key', key)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  const ids = (rows || []).map((r) => r.id);
  let votes = [];
  if (ids.length) {
    const { data, error: vErr } = await supabase.from('review_votes').select('review_id, user_id').in('review_id', ids);
    if (vErr) throw new Error(vErr.message);
    votes = data || [];
  }

  const reviews = (rows || []).map((r) => ({
    id: r.id,
    name: r.user_name,
    rating: r.rating,
    text: r.text,
    skinType: r.skin_type,
    createdAt: r.created_at,
    helpful: votes.filter((v) => v.review_id === r.id).length,
    markedHelpful: votes.some((v) => v.review_id === r.id && v.user_id === req.userId),
    mine: r.user_id === req.userId,
  }));
  if (sort === 'helpful') reviews.sort((a, b) => b.helpful - a.helpful);

  const count = reviews.length;
  const average = count ? +(reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1) : null;
  return res.json({ product: catalog.productPublic(key), sort, count, average, reviews });
}

const SKIN_TYPES = new Set(['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive']);

async function createReview(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  const { rating, text, skinType } = req.body || {};
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5' });
  }
  if (trimmed.length < 10 || trimmed.length > 1000) {
    return res.status(400).json({ error: 'Review must be between 10 and 1000 characters' });
  }
  if (skinType != null && !SKIN_TYPES.has(skinType)) {
    return res.status(400).json({ error: 'Invalid skin type' });
  }

  const { data: user } = await supabase.from('users').select('name').eq('id', req.userId).single();
  // Show "First L." rather than the full name on a public review.
  const parts = String(user?.name || 'User').trim().split(/\s+/);
  const displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];

  const { data, error } = await supabase
    .from('product_reviews')
    .upsert(
      {
        product_key: key, user_id: req.userId, user_name: displayName,
        rating, text: trimmed, skin_type: skinType ?? null, created_at: new Date().toISOString(),
      },
      { onConflict: 'product_key,user_id' }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return res.status(201).json({ id: data.id });
}

async function voteHelpful(req, res) {
  const reviewId = Number(req.params.reviewId);
  const { helpful } = req.body || {};
  if (!Number.isInteger(reviewId) || typeof helpful !== 'boolean') {
    return res.status(400).json({ error: 'A review id and boolean helpful are required' });
  }
  const { data: review } = await supabase.from('product_reviews').select('id, user_id').eq('id', reviewId).single();
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.user_id === req.userId) return res.status(400).json({ error: "You can't vote on your own review" });

  const q = helpful
    ? supabase.from('review_votes').upsert({ review_id: reviewId, user_id: req.userId }, { onConflict: 'review_id,user_id', ignoreDuplicates: true })
    : supabase.from('review_votes').delete().eq('review_id', reviewId).eq('user_id', req.userId);
  const { error } = await q;
  if (error) throw new Error(error.message);

  const { data: votes } = await supabase.from('review_votes').select('user_id').eq('review_id', reviewId);
  return res.json({ helpful: (votes || []).length, markedHelpful: helpful });
}

// ─── Shelf ──────────────────────────────────────────────────────────────────

async function getShelf(req, res) {
  const { data, error } = await supabase
    .from('shelf_items')
    .select('product_key, added_at')
    .eq('user_id', req.userId)
    .order('added_at', { ascending: false });
  if (error) throw new Error(error.message);

  const [prefs, usage] = await Promise.all([loadPreferences(req.userId), checks.getChecks(req.userId, SHELF_AREA)]);
  const restricted = new Set(prefs.allergies.ingredients);

  const items = (data || [])
    .filter((r) => catalog.PRODUCTS[r.product_key])
    .map((r) => {
      const use = checks.summarize(usage[r.product_key]);
      return {
        ...catalog.productPublic(r.product_key),
        addedAt: r.added_at,
        daysUsed: use.totalDays,
        streak: use.streak,
        usedToday: use.doneToday,
        allergyRisk: catalog.PRODUCTS[r.product_key].ingredients.some((i) => restricted.has(i)),
      };
    });
  return res.json({ items });
}

async function addToShelf(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  const { error } = await supabase.from('shelf_items').upsert(
    { user_id: req.userId, product_key: key, added_at: new Date().toISOString() },
    { onConflict: 'user_id,product_key', ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);
  return getShelf(req, res);
}

async function removeFromShelf(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  const { error } = await supabase.from('shelf_items').delete().eq('user_id', req.userId).eq('product_key', key);
  if (error) throw new Error(error.message);
  return getShelf(req, res);
}

async function logUse(req, res) {
  const key = requireProduct(req, res);
  if (!key) return;
  if (typeof req.body?.done !== 'boolean') return res.status(400).json({ error: 'done must be a boolean' });
  if (!(await shelfKeys(req.userId)).includes(key)) {
    return res.status(404).json({ error: 'Product is not on your shelf' });
  }
  await checks.setCheck(req.userId, SHELF_AREA, key, req.body.done);
  return getShelf(req, res);
}

module.exports = {
  search, analyze, scanLabel, dupes, ingredientGuide,
  listReviews, createReview, voteHelpful,
  getShelf, addToShelf, removeFromShelf, logUse,
};
