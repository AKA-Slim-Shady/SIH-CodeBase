import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
dotenv.config();

import { connectDB } from './config/database.js';
import sequelize from './config/database.js';

// ---- VITAL: Ensure all model imports are present at the top ----
import User from './models/userModel.js';
import Post from './models/postModel.js';
import Like from './models/likeModel.js';
import Comment from './models/commentModel.js';
import Notification from './models/notificationModel.js';
import Department from './models/departmentModel.js';
import ComplaintStatus from './models/complaintStatusModel.js';

// routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

const app = express();
const server = http.createServer(app);

// socket.io
export const io = new Server(server, { cors: { origin: '*' } });

// Real-time logic for joining user-specific rooms
io.on('connection', socket => {
  console.log(`[Socket.io] New client connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`[Socket.io] Socket ${socket.id} joined private room for user: ${userId}`);
    }
  });

  socket.on('disconnect', () => console.log(`[Socket.io] Client disconnected: ${socket.id}`));
});

// ---- ASSOCIATIONS (single place) ----
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Post, { through: Like, as: 'LikedPosts', foreignKey: 'userId' });
Post.belongsToMany(User, { through: Like, as: 'Likes', foreignKey: 'postId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Post.hasOne(ComplaintStatus, { foreignKey: 'postId' });
ComplaintStatus.belongsTo(Post, { foreignKey: 'postId' });
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Department.hasMany(Post, { foreignKey: 'departmentId' });
Post.belongsTo(Department, { foreignKey: 'departmentId' });

// ---- DB connect & middlewares ----
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/departments', departmentRoutes);

// ---- FUNCTION TO LOG DEPARTMENTS ----
async function logDepartments() {
  try {
    const departments = await Department.findAll();
    console.log('Departments in DB:');
    console.log(departments.map(d => d.name));
  } catch (err) {
    console.error('Error fetching departments:', err);
  }
}

// ---- sync & start server ----
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }).then(async () => {
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));

  // log departments after server starts
  await logDepartments();
}).catch(err => {
  console.error('Unable to sync database:', err);
});
