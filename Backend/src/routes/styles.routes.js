const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { recommendStyles } = require('../services/styleAdvisor.service');

const router = express.Router();
router.use(requireAuth);

// Photo in, ranked style recommendations out. The photo is not stored.
router.post('/recommend', asyncHandler(async (req, res) => {
  const { kind, image, request } = req.body || {};
  res.json(await recommendStyles(kind, image, request));
}));

module.exports = router;
