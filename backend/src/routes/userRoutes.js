// backend/src/routes/userRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
} from '../controllers/userController.js';

const router = express.Router();

// All routes defined here are protected and require a valid user session
router.use(protect);

router.get('/', getAllUsers); // Route: GET /api/users
router.get('/:userid', getUserById); // Route: GET /api/users/some-clerk-id
router.patch('/:userid', updateUser); // Route: PATCH /api/users/some-clerk-id

export default router;