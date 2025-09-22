import express from "express";
import {
  createDepartmentController,
  getDepartmentsController,
  getDepartmentByIdController,
  updateDepartmentController,
  deleteDepartmentController,
} from "./departments.controller.js";

import { adminMiddleware } from "../middleware/Authverify.js";

const router = express.Router();

// POST /api/departments
router.post("/departments",adminMiddleware, createDepartmentController);

// GET /api/departments
router.get("/departments", getDepartmentsController);

// GET /api/departments/:deptid
router.get("/departments/:deptid", getDepartmentByIdController);

// PUT /api/departments/:deptid
router.put("/departments/:deptid",adminMiddleware, updateDepartmentController);

// DELETE /api/departments/:deptid
router.delete("/departments/:deptid",adminMiddleware, deleteDepartmentController);

export default router;
