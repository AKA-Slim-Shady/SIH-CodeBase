// backend/src/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

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
import notificationRoutes from './routes/notificationRoutes.js'; 

// --- DEFINE MODEL ASSOCIATIONS ---
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Post, { through: Like, as: 'LikedPosts', foreignKey: 'userId' });
Post.belongsToMany(User, { through: Like, as: 'Likes', foreignKey: 'postId' });

Post.hasOne(Status, { foreignKey: 'postId' });
Status.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
export const io = new Server(server, {
  cors: { origin: '*' }, // allow all origins, adjust in production
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- Connect to Database ---
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
app.use('/api/notifications', notificationRoutes); 

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});
