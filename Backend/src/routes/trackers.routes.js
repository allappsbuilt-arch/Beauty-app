const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { get, setCheck } = require('../controllers/trackers.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/:area', asyncHandler(get));
router.post('/:area/checks', asyncHandler(setCheck));

module.exports = router;
