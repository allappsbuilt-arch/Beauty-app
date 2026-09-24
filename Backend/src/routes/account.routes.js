const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { exportData, deleteAccount } = require('../controllers/account.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/export', asyncHandler(exportData));
router.delete('/', asyncHandler(deleteAccount));

module.exports = router;
