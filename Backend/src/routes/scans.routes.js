const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { create, list, getOne } = require('../controllers/scans.controller');

const router = express.Router();
router.use(requireAuth);

router.post('/', asyncHandler(create));
router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(getOne));

module.exports = router;
