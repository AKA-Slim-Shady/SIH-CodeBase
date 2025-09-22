import express from "express";
import {
  getUserNotificationsController,
  deleteNotificationController,
} from "./notifications.controller.js";
import { authMiddleware } from "../middleware/Authverify.js";

const router = express.Router();

// GET /api/notifications
router.get("/notifications",authMiddleware, getUserNotificationsController);

// DELETE /api/notifications/:notificationid
router.delete("/notifications/:notificationid",authMiddleware, deleteNotificationController);

export default router;
