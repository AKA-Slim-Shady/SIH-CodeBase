import express from 'express';
import { updateStatus, getStatus } from '../controllers/statusController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Route for updating a post's status (admin only)
router.put('/:postid', protect, admin, updateStatus);

// Route for getting a post's status
router.get('/:postid', protect, getStatus); 

export default router;
