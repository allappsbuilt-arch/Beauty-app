const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const c = require('../controllers/social.controller');

const router = express.Router();

// Photos are fetched by <Image> tags, which can't send auth headers on web,
// so they're public — addressable only by their random id.
router.get('/media/:id', asyncHandler(c.media));

router.use(requireAuth);

router.get('/meta', (req, res) => res.json({ tags: c.TAGS, storyColors: c.STORY_COLORS }));

router.get('/feed', asyncHandler(c.feed));
router.post('/posts', asyncHandler(c.createPost));
router.delete('/posts/:id', asyncHandler(c.deletePost));
router.post('/posts/:id/like', asyncHandler(c.setLike));
router.post('/posts/:id/bookmark', asyncHandler(c.setBookmark));
router.post('/posts/:id/report', asyncHandler(c.reportPost));
router.get('/posts/:id/comments', asyncHandler(c.listComments));
router.post('/posts/:id/comments', asyncHandler(c.addComment));
router.delete('/comments/:id', asyncHandler(c.deleteComment));
router.get('/bookmarks', asyncHandler(c.bookmarks));

router.get('/stories', asyncHandler(c.listStories));
router.post('/stories', asyncHandler(c.createStory));
router.delete('/stories/:id', asyncHandler(c.deleteStory));

router.get('/users/:id', asyncHandler(c.profile));
router.get('/users/:id/posts', asyncHandler(c.userPosts));
router.post('/users/:id/follow', asyncHandler(c.setFollow));
router.get('/suggestions', asyncHandler(c.suggestions));

router.get('/live', asyncHandler(c.liveStatus));
router.post('/live/join', asyncHandler(c.joinLive));
router.post('/live/:id/complete', asyncHandler(c.completeLive));
router.post('/live/:id/leave', asyncHandler(c.leaveLive));

module.exports = router;
