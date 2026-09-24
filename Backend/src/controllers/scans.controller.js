const { query } = require('../db/database');
const points = require('../services/points.service');
const { generateScan } = require('../services/scanGenerator');

function toPublic(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    zones: row.zones_json,
    ancillary: row.ancillary_json,
  };
}

async function create(req, res) {
  const scan = generateScan();

  await query(
    'INSERT INTO scans (id, user_id, created_at, zones_json, ancillary_json) VALUES ($1, $2, $3, $4, $5)',
    [scan.id, req.userId, scan.createdAt, JSON.stringify(scan.zones), JSON.stringify(scan.ancillary)]
  );

  await points.award(req.userId, 'Skin Analysis', 50);

  return res.status(201).json(scan);
}

async function list(req, res) {
  const { rows } = await query(
    'SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.userId]
  );
  return res.json({ scans: rows.map(toPublic) });
}

async function getOne(req, res) {
  const { rows } = await query(
    'SELECT * FROM scans WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Scan not found' });
  return res.json(toPublic(rows[0]));
}

module.exports = { create, list, getOne };
