const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getHistory, sendMessage, clearHistory } = require('../controllers/coach.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/history', asyncHandler(getHistory));
router.post('/message', asyncHandler(sendMessage));
router.delete('/history', asyncHandler(clearHistory));

module.exports = router;
