// backend/src/routes/departmentRoutes.js

import express from 'express';
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Public routes for getting department information
router.route('/')
    .get(getDepartments);

router.route('/:deptid')
    .get(getDepartmentById);

// Admin-only routes
router.use(protect, admin); // Protect and require admin for all routes below this line

router.route('/')
    .post(createDepartment);

router.route('/:deptid')
    .patch(updateDepartment)
    .delete(deleteDepartment);

export default router;
