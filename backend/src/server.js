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

// --- ROUTE IMPORTS ---
import webhookRoutes from './routes/webhookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';

// --- DEFINE MODEL ASSOCIATIONS ---
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Post, { through: Like, as: 'LikedPosts', foreignKey: 'userId' });
Post.belongsToMany(User, { through: Like, as: 'Likes', foreignKey: 'postId' });


const app = express();

// Connect to Database
connectDB();

// --- Middlewares ---
app.use(cors());

// IMPORTANT: The raw body parser for the webhook MUST come before express.json()
app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- API ROUTES ---
app.use('/api/webhooks', webhookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);


// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to sync database:', err);
});