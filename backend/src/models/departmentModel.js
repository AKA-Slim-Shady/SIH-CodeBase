// backend/src/models/departmentModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Department = sequelize.define('Department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,   // must be selected
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,   // must be selected
    }
}, {
    timestamps: true,
});

export default Department;
