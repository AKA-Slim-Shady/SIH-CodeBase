// backend/src/routes/postRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getPostDept,
} from '../controllers/postController.js';
// import { upload } from '../middlewares/uploadMiddleware.js'; // ❌ remove this

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Routes for liking and unliking a post -> /api/posts/like/:postid
router.route('/like/:postid')
    .post(likePost)
    .delete(unlikePost);

// Routes for a specific post's department
router.route('/dept/:postid')
    .get(getPostDept);

// Routes for creating and getting all posts -> /api/posts
router.route('/')
  .get(getAllPosts)
  .post(createPost); // ❌ remove upload middleware

// Routes for a specific post -> /api/posts/:postid
router.route('/:postid')
    .get(getPostById)
    .patch(updatePost)
    .delete(deletePost);

export default router;
