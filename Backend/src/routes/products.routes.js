const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const c = require('../controllers/products.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/search', asyncHandler(c.search));
router.post('/scan-label', asyncHandler(c.scanLabel));
router.get('/ingredient-guide', asyncHandler(c.ingredientGuide));
router.get('/shelf', asyncHandler(c.getShelf));
router.post('/shelf', asyncHandler(c.addToShelf));
router.delete('/shelf/:key', asyncHandler(c.removeFromShelf));
router.post('/shelf/:key/use', asyncHandler(c.logUse));
router.post('/reviews/:reviewId/helpful', asyncHandler(c.voteHelpful));
router.get('/:key/analyze', asyncHandler(c.analyze));
router.get('/:key/dupes', asyncHandler(c.dupes));
router.get('/:key/reviews', asyncHandler(c.listReviews));
router.post('/:key/reviews', asyncHandler(c.createReview));

module.exports = router;
