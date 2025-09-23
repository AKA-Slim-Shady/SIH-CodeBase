// backend/src/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import { connectDB } from './config/database.js';
import sequelize from './config/database.js';

// --- MODEL IMPORTS ---
import User from './models/userModel.js';
import Post from './models/postModel.js';
import Like from './models/likeModel.js';
import Status from './models/statusModel.js';
import Notification from './models/notificationModel.js';

// --- ROUTE IMPORTS ---
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
// Corrected import statement to match your filename
import notificationRoutes from './routes/notificationRoutes.js'; 

// --- DEFINE MODEL ASSOCIATIONS ---
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Post, { through: Like, as: 'LikedPosts', foreignKey: 'userId' });
Post.belongsToMany(User, { through: Like, as: 'Likes', foreignKey: 'postId' });

// Define associations for the new Status model
Post.hasOne(Status, { foreignKey: 'postId' });
Status.belongsTo(Post, { foreignKey: 'postId' });

// Define associations for the new Notification model
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });


const app = express();

// Connect to Database
connectDB();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/status', statusRoutes);
// Corrected route to match the corrected import statement
app.use('/api/notifications', notificationRoutes); 


// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to sync database:', err);
});