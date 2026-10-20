import express from 'express';
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { likePost, unlikePost } from '../controllers/likeController.js';
import { toggleBookmark } from '../controllers/bookmarkController.js';
import { getComments, createComment } from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { createLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', protect, createLimiter, createPost);
router.get('/:id', optionalAuth, getPostById);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Likes
router.put('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

// Bookmarks
router.put('/:id/bookmark', protect, toggleBookmark);

// Comments for a post
router.get('/:postId/comments', optionalAuth, getComments);
router.post('/:postId/comments', protect, createLimiter, createComment);

export default router;
