// backend/src/models/notificationModel.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    // Your existing message field is perfect.
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // NEW: To track if the user has seen the notification.
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // NEW: A link to navigate to, e.g., the feedback form.
    link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true
});

export default Notification;