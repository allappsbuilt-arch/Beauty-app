const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const c = require('../controllers/points.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', asyncHandler(c.summary));
router.get('/history', asyncHandler(c.history));
router.get('/earn', asyncHandler(c.earnStatus));
router.get('/water', asyncHandler(c.water));
router.post('/water', asyncHandler(c.changeWater));
router.get('/referral', asyncHandler(c.referral));

module.exports = router;
