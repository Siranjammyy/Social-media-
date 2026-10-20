import express from 'express';
import {
  getRealTimeNews,
  getBreakingNews,
  getNewsById,
  getWhatsHappening,
} from '../controllers/newsController.js';

const router = express.Router();

router.get('/', getRealTimeNews);
router.get('/breaking', getBreakingNews);
router.get('/whats-happening', getWhatsHappening);
router.get('/:id', getNewsById);

export default router;
