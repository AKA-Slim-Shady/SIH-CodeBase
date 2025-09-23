import React, { useEffect, useState } from "react";
import { getAllPosts, updatePost, deletePost } from "../api/posts";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const userData = JSON.parse(saved);
      setUser(userData);

      fetchUserPosts(userData.id);
    }
  }, []);

  const fetchUserPosts = async (userId) => {
    try {
      const allPosts = await getAllPosts();
      setPosts(allPosts.filter((p) => p.userId === userId));
    } catch (err) {
      console.error("Error fetching user posts:", err);
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
      setEditingPostId(null);
      fetchUserPosts(user.id);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const removePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(postId);
      fetchUserPosts(user.id);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 16 }}>
      <h2>{user.name}'s Profile</h2>
      {user.userpic && <img src={user.userpic} alt={user.name} style={{ width: 100, borderRadius: "50%" }} />}
      <h3>My Posts</h3>
      {posts.map((post) => (
        <div key={post.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 8 }}>
          {editingPostId === post.id ? (
            <>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description"
                style={{ width: "100%", marginBottom: 4 }}
              />
              <input
                type="text"
                value={editImg}
                onChange={(e) => setEditImg(e.target.value)}
                placeholder="Image URL"
                style={{ width: "100%", marginBottom: 4 }}
              />
              <button onClick={saveEdit}>Save</button>
              <button onClick={cancelEditing} style={{ marginLeft: 8 }}>Cancel</button>
            </>
          ) : (
            <>
              <p><strong>{post.desc}</strong></p>
              {post.img && <img src={post.img} alt={post.desc} style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />}
              <p><small>Created at: {new Date(post.createdAt).toLocaleString()}</small></p>
              <button onClick={() => startEditing(post)}>Edit</button>
              <button onClick={() => removePost(post.id)} style={{ marginLeft: 8 }}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
