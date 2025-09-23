import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComplaintStatus = sequelize.define('ComplaintStatus', {
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending',
    },
    // The foreign key postId is added automatically via association
}, {
    timestamps: false,
});

export default ComplaintStatus;
