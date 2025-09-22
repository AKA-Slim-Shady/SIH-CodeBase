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
        const clerkId = req.auth.userId;
        const user = await User.findOne({ where: { clerkId: clerkId } });
        if (!user) { return res.status(404).json({ message: 'User not found.' }); }
        const newPost = await Post.create({ img, desc, location, userId: user.id });
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
        const clerkId = req.auth.userId;
        const user = await User.findOne({ where: { clerkId } });
        const post = await Post.findByPk(req.params.postid);
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        if (post.userId !== user.id) {
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
        const clerkId = req.auth.userId;
        const user = await User.findOne({ where: { clerkId } });
        const post = await Post.findByPk(req.params.postid);
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        if (post.userId !== user.id) {
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

// POST /api/posts/like/:postid - Like a post
export const likePost = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ where: { clerkId } });
        const post = await Post.findByPk(req.params.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Use the special method 'addLike' created by Sequelize's association
        await post.addLike(user);
        res.status(200).json({ message: 'Post liked successfully' });

    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

// DELETE /api/posts/like/:postid - Unlike a post
export const unlikePost = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ where: { clerkId } });
        const post = await Post.findByPk(req.params.postid);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Use the special method 'removeLike' created by Sequelize
        await post.removeLike(user);
        res.status(200).json({ message: 'Post unliked successfully' });

    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
};