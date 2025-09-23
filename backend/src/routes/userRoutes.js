import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Get all users (protected route)
router.route('/')
    .get(protect, getAllUsers);

// Routes for a specific user
router.route('/:userid')
    .get(protect, getUserById)
    .patch(protect, updateUser) // User can only update their own profile (checked in controller)
    .delete(protect, admin, deleteUser); // Only an admin can delete a user

export default router;
