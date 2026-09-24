const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { upsert, getToday } = require('../controllers/checkins.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/today', asyncHandler(getToday));
router.post('/', asyncHandler(upsert));

module.exports = router;
