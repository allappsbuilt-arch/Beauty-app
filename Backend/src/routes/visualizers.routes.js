const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { simulateAging, checkSymmetry } = require('../services/visualizers.service');

const router = express.Router();
router.use(requireAuth);

// Photos are processed and returned, never stored.
router.post('/aging', asyncHandler(async (req, res) => {
  const { image, years, scenario } = req.body || {};
  res.json(await simulateAging(image, years, scenario));
}));

router.post('/symmetry', asyncHandler(async (req, res) => {
  res.json(await checkSymmetry(req.body?.image));
}));

module.exports = router;
