// backend/src/routes/userRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

router.route('/')
    .get(getAllUsers);

router.route('/:userid')
    .get(getUserById)
    .patch(protect, updateUser)
    .delete(protect, deleteUser);

export default router;