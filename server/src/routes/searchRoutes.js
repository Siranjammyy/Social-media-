import express from 'express';
import {
  searchUsers,
  searchPosts,
  getTrendingHashtags,
} from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', optionalAuth, searchUsers);
router.get('/posts', optionalAuth, searchPosts);
router.get('/trending', getTrendingHashtags);

export default router;
