// backend/src/routes/postRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,     // <-- IMPORT likePost
    unlikePost,   // <-- IMPORT unlikePost
} from '../controllers/postController.js';

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Routes for creating and getting all posts -> /api/posts
router.route('/')
    .get(getAllPosts)
    .post(createPost);

// Routes for a specific post -> /api/posts/:postid
router.route('/:postid')
    .get(getPostById)
    .patch(updatePost)
    .delete(deletePost);

// Routes for liking and unliking a post -> /api/posts/like/:postid
router.route('/like/:postid')
    .post(likePost)
    .delete(unlikePost);

export default router;