import express from 'express';
import {
  createReport,
  getReports,
  updateReportStatus,
} from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, restrictTo('admin'), getReports);
router.patch('/:id', protect, restrictTo('admin'), updateReportStatus);

export default router;
