const express = require('express');
const { signup, login, me, updateMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.patch('/me', requireAuth, asyncHandler(updateMe));

module.exports = router;
