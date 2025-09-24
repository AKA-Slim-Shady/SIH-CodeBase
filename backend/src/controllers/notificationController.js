import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- 👇 NEW: Function to mark a notification as read ---
export const markNotificationAsRead = async (req, res) => {
    const { notificationid } = req.params;
    try {
        const notification = await Notification.findByPk(notificationid);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Security check: Ensure the user can only mark their own notifications.
        if (notification.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only modify your own notifications.' });
        }

        // Update the isRead status and save the change.
        notification.isRead = true;
        await notification.save();
        
        res.status(200).json(notification); // Send back the updated notification
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// --- 👆 END: New Function ---


// Delete a notification
export const deleteNotification = async (req, res) => {
    const { notificationid } = req.params;
    try {
        const notification = await Notification.findByPk(notificationid);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        if (notification.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own notifications.' });
        }

        await notification.destroy();
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

