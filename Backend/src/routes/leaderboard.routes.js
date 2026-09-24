const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getLeaderboard } = require('../controllers/leaderboard.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(getLeaderboard));

module.exports = router;
