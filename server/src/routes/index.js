import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import feedRoutes from './feedRoutes.js';
import commentRoutes from './commentRoutes.js';
import bookmarkRoutes from './bookmarkRoutes.js';
import searchRoutes from './searchRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import messageRoutes from './messageRoutes.js';
import reportRoutes from './reportRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './adminRoutes.js';
import healthRoutes from './healthRoutes.js';
import newsRoutes from './newsRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/news', newsRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/feed', feedRoutes);
router.use('/comments', commentRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/conversations', messageRoutes);
router.use('/reports', reportRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
