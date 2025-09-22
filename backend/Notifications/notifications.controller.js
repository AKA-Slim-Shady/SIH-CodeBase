import {
  getUserNotifications,
  deleteNotification,
} from "./notifications.sqlquery.js";

export const getUserNotificationsController = getUserNotifications;
export const deleteNotificationController = deleteNotification;
