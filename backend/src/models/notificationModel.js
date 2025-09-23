// backend/src/models/notificationModel.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true
});

export default Notification;