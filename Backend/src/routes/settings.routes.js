const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getNotifications, updateNotifications } = require('../controllers/settings.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/notifications', asyncHandler(getNotifications));
router.put('/notifications', asyncHandler(updateNotifications));

module.exports = router;
