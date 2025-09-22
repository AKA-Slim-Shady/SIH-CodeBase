// backend/src/controllers/postController.js

import { Op } from 'sequelize';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

// ... createPost, getAllPosts, getPostById, updatePost, deletePost functions are unchanged ...

export const createPost = async (req, res) => {
    const { img, desc, location } = req.body;
    if (!img || !desc) {
        return res.status(400).json({ message: 'Image and description are required.' });
    }
    try {
        const userId = req.user.id;
        const newPost = await Post.create({ img, desc, location, userId: userId });
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const getAllPosts = async (req, res) => {
    const { loc } = req.query;
    const whereClause = {};
    if (loc) { whereClause.location = { [Op.iLike]: `%${loc}%` }; }
    try {
        const posts = await Post.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: { model: User, attributes: ['name', 'userpic'] }
        });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postid, {
            include: { model: User, attributes: ['name', 'userpic'] }
        });
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};

export const updatePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const post = await Post.findByPk(req.params.postid);
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        if (post.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own posts.' });
        }
        await post.update(req.body);
        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const post = await Post.findByPk(req.params.postid);
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        if (post.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own posts.' });
        }
        await post.destroy();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};


// --- NEW FUNCTIONS FOR LIKING/UNLIKING ---

export const likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        const post = await Post.findByPk(req.params.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.addLike(user);
        res.status(200).json({ message: 'Post liked successfully' });

    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

export const unlikePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        const post = await Post.findByPk(req.params.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.removeLike(user);
        res.status(200).json({ message: 'Post unliked successfully' });

    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
};

// --- NEW FUNCTION FOR GETTING POST DEPARTMENT ---
// You will need to create a Department model and establish an association between Post and Department for this to work.
export const getPostDept = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postid, {
            include: { model: Department } // Assuming Department is your model name
        });
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        res.status(200).json(post.Department); // Send back the associated department
    } catch (error) {
        console.error('Error fetching post department:', error);
        res.status(500).json({ error: 'Failed to fetch post department' });
    }
};