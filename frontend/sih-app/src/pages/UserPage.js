import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPosts, updatePost, deletePost } from "../api/posts";
// 'getStatus' is no longer needed and has been removed.

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  // 'postStatuses' state is no longer needed.
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const userData = JSON.parse(saved);
      setUser(userData);
      fetchUserPosts();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserPosts = async () => {
    setIsLoading(true);
    try {
      // This single API call now returns posts WITH their statuses
      const myPosts = await getMyPosts();
      setPosts(myPosts);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setEditDesc(post.desc);
    setEditImg(post.img);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditDesc("");
    setEditImg("");
  };

  const saveEdit = async () => {
    try {
      await updatePost(editingPostId, { desc: editDesc, img: editImg });
      cancelEditing();
      fetchUserPosts(); // Refresh posts
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const removePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        fetchUserPosts(); // Refresh posts
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  if (isLoading) return <p className="page-loader">Loading your posts...</p>;
  if (!user) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Please sign in to see your page.</p>;

  return (
    <div className="page-container">
      <h2>{user.name}'s Dashboard</h2>
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>My Reported Issues</h3>
      {posts.length === 0 ? (
        <p>You have not reported any issues yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="user-post-card">
            {editingPostId === post.id ? (
              <div className="form-card" style={{padding: 0, margin: 0, boxShadow: 'none'}}>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
                <input
                  type="text"
                  placeholder="New image URL (optional)"
                  value={editImg}
                  onChange={(e) => setEditImg(e.target.value)}
                />
                <div className="button-group">
                  <button onClick={saveEdit} className="feedback-btn">Save Changes</button>
                  <button onClick={cancelEditing} className="edit-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p><strong>{post.desc}</strong></p>
                {post.img && <img src={post.img} alt={post.desc} />}
                <div className="status-display">
                  {/* Read status directly from the post object */}
                  <strong>Status:</strong> {post.status || 'Pending'}
                </div>
                <div className="button-group">
                  {/* Read status directly from the post object */}
                  {post.status === 'Issue resolved' ? (
                    <Link to={`/feedback/${post.id}`} className="feedback-btn">
                      Send Feedback
                    </Link>
                  ) : (
                    <button onClick={() => startEditing(post)} className="edit-btn">Edit</button>
                  )}
                  <button onClick={() => removePost(post.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
