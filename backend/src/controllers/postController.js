// backend/src/controllers/postController.js
import { Op } from 'sequelize';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Department from '../models/departmentModel.js';
import { io } from '../server.js'; // import the io instance
import ComplaintStatus from '../models/complaintStatusModel.js';

// Helper: parse "lat,lng" or JSON string into { latitude, longitude } or null
function parseLocation(loc) {
  if (!loc) return null;
  // If already stored as JSON string like '{"latitude":..., "longitude":...}'
  if (typeof loc === 'object' && loc.latitude !== undefined && loc.longitude !== undefined) {
    return { latitude: Number(loc.latitude), longitude: Number(loc.longitude) };
  }
  if (typeof loc === 'string') {
    // try JSON first
    try {
      const obj = JSON.parse(loc);
      if (obj && obj.latitude !== undefined && obj.longitude !== undefined) {
        return { latitude: Number(obj.latitude), longitude: Number(obj.longitude) };
      }
    } catch (e) {
      // not JSON, try "lat,lng"
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

// Haversine distance in kilometers
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ----------------- existing controllers (createPost etc) -----------------
// (keep your other functions as-is; below we only replace/implement getAllPosts, and ensure getPostDept import exists)

export const createPost = async (req, res) => {
    const { img, desc, location } = req.body;

    if (!img || !desc) {
        return res.status(400).json({ message: 'Image and description are required.' });
    }

    try {
        const userId = req.user.id;

        // store location directly as object/string
        const newPost = await Post.create({ img, desc, location, userId });
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const getAllPosts = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5, sort } = req.query;

    // --- CHANGE 1: Include the ComplaintStatus model in the query ---
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name"] },
        { model: User, as: "Likes", attributes: ["id", "name"] },
        {
          model: ComplaintStatus,
          required: false // This makes it a LEFT JOIN, returning posts even if they have no status
        }
      ],
    });

    const mapped = posts.map((p) => {
      const plain = p.toJSON();
      const parsedLocation = parseLocation(plain.location);

      return {
        ...plain,
        // --- CHANGE 2: Add a clean 'status' field to the response ---
        // If a ComplaintStatus object exists, use its status. Otherwise, default to "Pending".
        status: plain.ComplaintStatus ? plain.ComplaintStatus.status : 'Pending',
        locationParsed: parsedLocation,
        likesCount: plain.Likes ? plain.Likes.length : 0,
      };
    });

    // All filtering and sorting logic from here remains the same
    let filtered = mapped;
    if (lat && lng) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const r = Number(radiusKm) || 5;

      filtered = filtered.filter((p) => {
        if (!p.locationParsed) return false;
        const d = haversineKm(
          centerLat,
          centerLng,
          p.locationParsed.latitude,
          p.locationParsed.longitude
        );
        return d <= r;
      });
    }

    if (sort === "asc") filtered.sort((a, b) => a.likesCount - b.likesCount);
    else if (sort === "desc") filtered.sort((a, b) => b.likesCount - a.likesCount);
    
    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};


// ----------------- rest of file (getPostById, update, delete, like/unlike, getPostDept) -----------------
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

    const post = await Post.findByPk(req.params.postid, { include: [{ model: User, as: 'Likes', attributes: ['id', 'name'] }] });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.addLike(user);

    const updatedPost = await Post.findByPk(post.id, { include: [{ model: User, as: 'Likes', attributes: ['id', 'name'] }] });

    // Emit full array of user objects
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

export const getPostDept = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postid, {
            include: { model: Department }
        });
        if (!post) { return res.status(404).json({ message: 'Post not found' }); }
        res.status(200).json(post.Department);
    } catch (error) {
        console.error('Error fetching post department:', error);
        res.status(500).json({ error: 'Failed to fetch post department' });
    }
};

// in backend/src/controllers/postController.js

export const getMyPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await Post.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            // Add the include for ComplaintStatus here as well
            include: [
                { model: User, attributes: ["id", "name"] },
                { model: ComplaintStatus, required: false }
            ],
        });
        
        // Map the results to include a default status
        const mappedPosts = posts.map(post => {
            const plain = post.toJSON();
            return {
                ...plain,
                status: plain.ComplaintStatus ? plain.ComplaintStatus.status : 'Pending'
            };
        });

        res.status(200).json(mappedPosts || []);
    } catch (error) {
        console.error("Error fetching user's posts:", error);
        res.status(500).json({ error: "Failed to fetch user's posts" });
    }
};
