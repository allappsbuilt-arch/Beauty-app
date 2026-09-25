const { supabase } = require('../db/database');
const { OCCASIONS, LOOK_CATALOG, generateSession, tryOnPrompt } = require('../services/makeupGenerator');
const { editPhoto } = require('../services/imageEdit.service');

const MAX_NOTES_LENGTH = 150;

function toPublic(row) {
  return {
    id: row.id,
    occasion: row.occasion,
    occasionLabel: OCCASIONS[row.occasion] || row.occasion,
    notes: row.notes,
    looks: row.looks_json,
    recommendedKey: row.recommended_key,
    createdAt: row.created_at,
  };
}

async function findSession(userId, id) {
  const { data, error } = await supabase
    .from('makeup_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data;
}

async function create(req, res) {
  const { occasion, notes } = req.body || {};
  if (!occasion || !OCCASIONS[occasion]) {
    return res.status(400).json({ error: 'A valid occasion is required' });
  }
  const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';
  if (trimmedNotes.length > MAX_NOTES_LENGTH) {
    return res.status(400).json({ error: `Notes must be ${MAX_NOTES_LENGTH} characters or less` });
  }

  const session = generateSession({ occasion, notes: trimmedNotes });

  const { error } = await supabase.from('makeup_sessions').insert({
    id: session.id,
    user_id: req.userId,
    occasion: session.occasion,
    notes: session.notes,
    looks_json: session.looks,
    recommended_key: session.recommendedKey,
    created_at: session.createdAt,
  });
  if (error) throw new Error(error.message);

  return res.status(201).json(session);
}

async function list(req, res) {
  const { data, error } = await supabase
    .from('makeup_sessions')
    .select('*')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return res.json({ sessions: (data || []).map(toPublic) });
}

async function getOne(req, res) {
  const row = await findSession(req.userId, req.params.id);
  if (!row) return res.status(404).json({ error: 'Makeup session not found' });
  return res.json(toPublic(row));
}

async function removeLook(req, res) {
  const row = await findSession(req.userId, req.params.id);
  if (!row) return res.status(404).json({ error: 'Makeup session not found' });

  const looks = (row.looks_json || []).filter((l) => l.key !== req.params.lookKey);
  if (looks.length === (row.looks_json || []).length) {
    return res.status(404).json({ error: 'Look not found' });
  }
  const recommendedKey = looks.some((l) => l.key === row.recommended_key)
    ? row.recommended_key
    : looks[0]?.key ?? null;

  const { error } = await supabase
    .from('makeup_sessions')
    .update({ looks_json: looks, recommended_key: recommendedKey })
    .eq('id', row.id)
    .eq('user_id', req.userId);
  if (error) throw new Error(error.message);

  return res.json(toPublic({ ...row, looks_json: looks, recommended_key: recommendedKey }));
}

// Every look the app can generate, for the Virtual Try-On picker.
async function looks(req, res) {
  return res.json({
    looks: LOOK_CATALOG.map(({ key, label, uri, description }) => ({ key, label, uri, description })),
  });
}

// Selfie + look in, the selfie wearing that look out. The photo isn't stored.
async function tryOn(req, res) {
  const { image, lookKey, intensity } = req.body || {};
  const look = LOOK_CATALOG.find((l) => l.key === lookKey);
  if (!look) return res.status(400).json({ error: 'Choose a look to try on' });
  if (intensity && !['natural', 'bold'].includes(intensity)) {
    return res.status(400).json({ error: 'intensity must be "natural" or "bold"' });
  }
  const result = await editPhoto(image, tryOnPrompt(look, intensity));
  return res.json({ lookKey: look.key, label: look.label, image: result });
}

module.exports = { create, list, getOne, removeLook, looks, tryOn };
