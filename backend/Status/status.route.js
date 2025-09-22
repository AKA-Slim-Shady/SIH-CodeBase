import express from "express";
import {
  updateStatusController,
  getStatusController,
} from "./status.controller.js";
import { authMiddleware } from "../middleware/Authverify.js";


const router = express.Router();

// PUT /api/status/:postid
router.put("/status/:postid",authMiddleware, updateStatusController);

// GET /api/status/:postid
router.get("/status/:postid", getStatusController);

export default router;
