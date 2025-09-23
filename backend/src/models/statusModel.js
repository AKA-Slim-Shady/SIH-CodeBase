// backend/src/models/statusModel.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Status = sequelize.define('Status', {
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending',
    },
}, {
    timestamps: false, // We will manually handle the updated_at timestamp
    updatedAt: 'updated_at'
});

export default Status;