const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { summary, history } = require('../controllers/points.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', asyncHandler(summary));
router.get('/history', asyncHandler(history));

module.exports = router;
