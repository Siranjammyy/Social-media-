import express from 'express';
import {
  getForYouFeed,
  getFollowingFeed,
  getLatestFeed,
} from '../controllers/feedController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getForYouFeed);
router.get('/following', protect, getFollowingFeed);
router.get('/latest', optionalAuth, getLatestFeed);

export default router;
