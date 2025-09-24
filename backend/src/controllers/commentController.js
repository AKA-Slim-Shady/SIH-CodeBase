// ------------------- commentController.js -------------------
import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import { io } from '../server.js';

export const createComment = async (req, res) => {
  const { content } = req.body;
  const { postid } = req.params;
  const userId = req.user?.id;

  if (!content) return res.status(400).json({ message: 'Comment content is required.' });
  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  try {
    const post = await Post.findByPk(postid);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Create the comment in DB
    const newComment = await Comment.create({ content, postId: parseInt(postid, 10), userId });

    // Fetch comment with author info to emit
    const commentForSocket = await Comment.findByPk(newComment.id, {
      include: { model: User, attributes: ['id', 'name'] }
    });

    // Emit via WebSocket only
    io.emit('commentCreated', { postId: parseInt(postid, 10), comment: commentForSocket });

    // Respond with a simple acknowledgement; frontend relies on WebSocket for actual comment
    res.status(201).json({ message: 'Comment sent via WebSocket.' });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};


export const updateComment = async (req, res) => {
  const { commentid } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  try {
    const comment = await Comment.findByPk(commentid);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await comment.update({ content });

    const updated = await Comment.findByPk(commentid, {
      include: { model: User, attributes: ['id', 'name'] }
    });

    try { io.emit('commentUpdated', { postId: updated.postId, comment: updated }); } catch (e) {}

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req, res) => {
  const { commentid } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Not authorized' });

  try {
    const comment = await Comment.findByPk(commentid);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const postId = comment.postId;
    await comment.destroy();

    try { io.emit('commentDeleted', { postId, commentId: parseInt(commentid, 10) }); } catch (e) {}

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export const getComments = async (req, res) => {
  const { postid } = req.params;
  try {
    const comments = await Comment.findAll({
      where: { postId: postid },
      include: { model: User, attributes: ['id', 'name'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};