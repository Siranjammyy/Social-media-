import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleSuspendUser,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/suspend', toggleSuspendUser);

export default router;
