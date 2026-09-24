const { supabase } = require('../db/database');
const points = require('../services/points.service');
const { analyzeFace } = require('../services/faceAnalysis.service');

function toPublic(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    zones: row.zones_json,
    ancillary: row.ancillary_json,
  };
}

async function create(req, res) {
  // Previous skin scores feed the scan's trend bars.
  const { data: previous, error: prevError } = await supabase
    .from('scans')
    .select('zones_json')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(3);
  if (prevError) throw new Error(prevError.message);
  const skinHistory = (previous || [])
    .map((r) => (r.zones_json || []).find((z) => z.key === 'skin')?.score)
    .filter((n) => typeof n === 'number');

  const scan = await analyzeFace(req.body?.image, skinHistory);

  const { error } = await supabase.from('scans').insert({
    id: scan.id,
    user_id: req.userId,
    created_at: scan.createdAt,
    zones_json: scan.zones,
    ancillary_json: scan.ancillary,
  });
  if (error) throw new Error(error.message);

  await points.award(req.userId, 'Skin Analysis', 50);

  return res.status(201).json(scan);
}

async function list(req, res) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return res.json({ scans: (data || []).map(toPublic) });
}

async function getOne(req, res) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Scan not found' });
  return res.json(toPublic(data));
}

module.exports = { create, list, getOne };
