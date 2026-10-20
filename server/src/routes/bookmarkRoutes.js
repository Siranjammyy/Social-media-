import express from 'express';
import { getBookmarks } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getBookmarks);

export default router;
