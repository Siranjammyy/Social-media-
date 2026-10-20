import express from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { createLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', createLimiter, sendMessage);

export default router;
