const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { get, update } = require('../controllers/preferences.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(get));
router.patch('/', asyncHandler(update));

module.exports = router;
