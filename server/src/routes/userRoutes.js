import express from 'express';
import {
  getUserProfile,
  updateProfile,
  completeOnboarding,
  getSuggestedUsers,
  blockUser,
  unblockUser,
  toggleMuteUser,
  deleteAccount,
} from '../controllers/userController.js';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/followController.js';
import { getUserPosts } from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Current user operations
router.patch('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);
router.post('/onboarding', protect, completeOnboarding);
router.get('/suggestions', protect, getSuggestedUsers);

// User-specific actions by ID
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.post('/:id/block', protect, blockUser);
router.post('/:id/unblock', protect, unblockUser);
router.post('/:id/mute', protect, toggleMuteUser);

// Public/semi-public user info by username
router.get('/:username', optionalAuth, getUserProfile);
router.get('/:username/posts', optionalAuth, getUserPosts);
router.get('/:username/followers', optionalAuth, getFollowers);
router.get('/:username/following', optionalAuth, getFollowing);

export default router;
