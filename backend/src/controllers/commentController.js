// backend/src/controllers/commentController.js

import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

// Create a new comment
export const createComment = async (req, res) => {
    const { content } = req.body;
    const { postid } = req.params;
    const userId = req.user.id; // User ID from the 'protect' middleware

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required.' });
    }

    try {
        const post = await Post.findByPk(postid);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newComment = await Comment.create({
            content,
            PostId: postid,
            UserId: userId
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};

// Update an existing comment
export const updateComment = async (req, res) => {
    const { commentid } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
        const comment = await Comment.findByPk(commentid);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        if (comment.UserId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own comments.' });
        }

        await comment.update({ content });
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
};

// Delete an existing comment
export const deleteComment = async (req, res) => {
    const { commentid } = req.params;
    const userId = req.user.id;

    try {
        const comment = await Comment.findByPk(commentid);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        if (comment.UserId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own comments.' });
        }

        await comment.destroy();
        res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Get all comments for a specific post
export const getComments = async (req, res) => {
    const { postid } = req.params;
    try {
        const comments = await Comment.findAll({
            where: { PostId: postid },
            include: { model: User, attributes: ['id', 'name', 'userpic'] },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};
