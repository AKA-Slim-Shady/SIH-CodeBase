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
    getMyPosts, // 👈 NEW: Import the new controller function
} from '../controllers/postController.js';

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// --- 👇 NEW: Route to get posts for the logged-in user ---
// This should come before the '/:postid' route to avoid conflicts.
router.route('/myposts')
    .get(getMyPosts);
// --- 👆 END: New Route ---

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
  .post(createPost);

// Routes for a specific post -> /api/posts/:postid
router.route('/:postid')
    .get(getPostById)
    .patch(updatePost)
    .delete(deletePost);

export default router;
