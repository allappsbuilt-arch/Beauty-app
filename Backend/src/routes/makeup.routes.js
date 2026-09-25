const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { create, list, getOne, removeLook, looks, tryOn } = require('../controllers/makeup.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/looks', asyncHandler(looks));
router.post('/try-on', asyncHandler(tryOn));
router.post('/sessions', asyncHandler(create));
router.get('/sessions', asyncHandler(list));
router.get('/sessions/:id', asyncHandler(getOne));
router.delete('/sessions/:id/looks/:lookKey', asyncHandler(removeLook));

module.exports = router;
