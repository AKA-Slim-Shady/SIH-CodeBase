import express from 'express';
import {
    createComment,
    updateComment,
    deleteComment,
    getComments,
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// A single route for getting and creating comments on a specific post
router.route('/:postid')
    .get(getComments)
    .post(protect, createComment);

// Routes for updating and deleting a specific comment
router.route('/:postid/:commentid')
    .patch(protect, updateComment)
    .delete(protect, deleteComment);

export default router;
