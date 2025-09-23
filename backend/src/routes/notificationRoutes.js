// backend/src/routes/notificationsRoutes.js

import express from 'express';
import { getUserNotifications, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.delete('/:notificationid', protect, deleteNotification);

export default router;