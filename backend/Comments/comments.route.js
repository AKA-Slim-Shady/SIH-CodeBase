import express from "express";
import {
  createCommentController,
  updateCommentController,
  deleteCommentController,
  getCommentsController,
} from "./comments.controller.js";

import { authMiddleware } from "../middleware/Authverify.js";

const router = express.Router();

// POST /api/comments/:postid
router.post("/comments/:postid",authMiddleware, createCommentController);

// PUT /api/comments/:postid/:commentid
router.put("/comments/:postid/:commentid",authMiddleware, updateCommentController);

// DELETE /api/comments/:postid/:commentid
router.delete("/comments/:postid/:commentid",authMiddleware, deleteCommentController);

// GET /api/comments/:postid
router.get("/comments/:postid", getCommentsController);

export default router;
