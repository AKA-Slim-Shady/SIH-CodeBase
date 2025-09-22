// backend/src/models/likeModel.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Like = sequelize.define('Like', {
    // This model will primarily consist of the foreign keys
    // which are added automatically by the associations below.
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
}, {
    timestamps: false // We don't need createdAt/updatedAt for a simple join table
});

export default Like;