// backend/src/routes/statusRoutes.js (This file name replaces your teammate's file)

import express from 'express';
import { updateStatus, getStatus } from '../controllers/statusController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/:postid', protect, updateStatus);
router.get('/:postid', protect, getStatus); // Note: getStatus should be protected to prevent unauthorized access

export default router;