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
  // Keep as JSON or STRING depending on what you want. Your DB currently stores "lat,lng" strings.
  // If you plan to migrate to JSON, do it with migrations. For now keep STRING to match DB content,
  // or use JSON if your DB has JSON values. I'll keep STRING to match your DB rows:
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true
});

export default Post;
