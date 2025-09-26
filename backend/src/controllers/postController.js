// backend/src/controllers/postController.js
import axios from 'axios';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Department from '../models/departmentModel.js';
import { io } from '../server.js';
import { predict } from '../services/mlService.js';

// Helper: parse "lat,lng" or JSON string into { latitude, longitude } or null
function parseLocation(loc) {
  if (!loc) return null;
  if (typeof loc === 'object' && loc.latitude !== undefined && loc.longitude !== undefined) {
    return { latitude: Number(loc.latitude), longitude: Number(loc.longitude) };
  }
  if (typeof loc === 'string') {
    try {
      const obj = JSON.parse(loc);
      if (obj && obj.latitude !== undefined && obj.longitude !== undefined) {
        return { latitude: Number(obj.latitude), longitude: Number(obj.longitude) };
      }
    } catch (e) {
      const parts = loc.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { latitude: lat, longitude: lng };
      }
    }
  }
  return null;
}

// Haversine distance in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------------- CREATE POST ----------------
export const createPost = async (req, res) => {
  const { img, desc, location } = req.body;

  if (!img || !desc) {
    return res.status(400).json({ message: 'Image and description are required.' });
  }

  try {
    const userId = req.user.id;

    // ✅ Get departmentId directly from ML service
    const departmentId = await predict(img);

    // ✅ Verify department exists (ML service auto-creates if missing)
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(500).json({ message: `Department with id '${departmentId}' not found.` });
    }

    console.log(`[PostController] Assigned department: ${department.name} (id=${department.id})`);

    const newPost = await Post.create({
      img,
      desc,
      location,
      departmentId, // ✅ use id directly
      userId
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// ---------------- GET ALL POSTS ----------------
export const getAllPosts = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5, sort } = req.query;

    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name"] },
        { model: User, as: "Likes", attributes: ["id", "name"] },
      ],
    });

    const mapped = posts.map((p) => {
      const plain = p.toJSON ? p.toJSON() : p;
      const parsedLocation = parseLocation(plain.location);
      const locationStr = plain.location || (parsedLocation ? `${parsedLocation.latitude},${parsedLocation.longitude}` : null);

      return {
        ...plain,
        location: locationStr,
        locationParsed: parsedLocation,
        likesCount: Array.isArray(plain.Likes) ? plain.Likes.length : 0,
      };
    });

    let filtered = mapped;
    if (lat && lng) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const r = Number(radiusKm);

      filtered = filtered.filter((p) => {
        if (!p.locationParsed) return false;
        const d = haversineKm(centerLat, centerLng, p.locationParsed.latitude, p.locationParsed.longitude);
        return d <= r;
      });
    }

    if (sort === "asc") filtered.sort((a, b) => a.likesCount - b.likesCount);
    else if (sort === "desc") filtered.sort((a, b) => b.likesCount - a.likesCount);
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(filtered || []);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// ---------------- GET POST BY ID ----------------
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postid, {
      include: [
        { model: User, attributes: ["name", "userpic"] },
        { model: User, as: "Likes", attributes: ["id", "name"] },
      ],
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// ---------------- UPDATE POST ----------------
export const updatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findByPk(req.params.postid);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await post.update(req.body);
    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// ---------------- DELETE POST ----------------
export const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findByPk(req.params.postid);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// ---------------- LIKE / UNLIKE ----------------
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const post = await Post.findByPk(req.params.postid, { include: [{ model: User, as: 'Likes', attributes: ['id', 'name'] }] });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.addLike(user);
    const updatedPost = await Post.findByPk(post.id, { include: [{ model: User, as: 'Likes', attributes: ['id', 'name'] }] });

    io.emit('postLiked', { postId: post.id, likes: updatedPost.Likes });
    res.status(200).json({ message: 'Post liked successfully', likes: updatedPost.Likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const post = await Post.findByPk(req.params.postid, { include: [{ model: User, as: 'Likes', attributes: ['id', 'name'] }] });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.removeLike(user);
    const updatedPost = await Post.findByPk(post.id, { include: [{ model: User, as: 'Likes', attributes: ['id', 'name'] }] });

    io.emit('postUnliked', { postId: post.id, likes: updatedPost.Likes });
    res.status(200).json({ message: 'Post unliked successfully', likes: updatedPost.Likes });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
};

// ---------------- GET POST DEPARTMENT ----------------
export const getPostDept = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postid, { include: Department });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post.Department);
  } catch (error) {
    console.error('Error fetching post department:', error);
    res.status(500).json({ error: 'Failed to fetch post department' });
  }
};

// ---------------- GET MY POSTS ----------------
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ["id", "name"] }]
    });
    res.status(200).json(posts || []);
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
};
