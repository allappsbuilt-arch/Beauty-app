const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { today, completeStep, finish, summary, day } = require('../controllers/routines.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/today', asyncHandler(today));
router.post('/steps/complete', asyncHandler(completeStep));
router.post('/finish', asyncHandler(finish));
router.get('/summary', asyncHandler(summary));
router.get('/day', asyncHandler(day));

module.exports = router;
