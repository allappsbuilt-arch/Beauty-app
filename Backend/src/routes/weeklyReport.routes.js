const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getWeeklyReport } = require('../controllers/weeklyReport.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(getWeeklyReport));

module.exports = router;
