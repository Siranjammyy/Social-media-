import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.array('files', 5), uploadMedia);

export default router;
