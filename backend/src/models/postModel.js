// backend/src/models/postModel.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Post = sequelize.define('Post', {
    img: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    location: {
        type: DataTypes.JSON,  // ✅ changed from STRING to JSON
        allowNull: true,       // optional field
    },
}, {
    timestamps: true
});

export default Post;
