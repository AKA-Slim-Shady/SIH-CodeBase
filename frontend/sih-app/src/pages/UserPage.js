import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 👈 NEW: Import Link for the feedback button
import { getMyPosts, updatePost, deletePost } from "../api/posts"; // 👈 UPGRADE: Import getMyPosts
import { getStatus } from "../api/status"; // 👈 NEW: Import getStatus

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postStatuses, setPostStatuses] = useState({}); // 👈 NEW: State to store post statuses
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const userData = JSON.parse(saved);
      setUser(userData);
      fetchUserPosts(); // Call without arguments
    } else {
        setIsLoading(false);
    }
  }, []);

  const fetchUserPosts = async () => {
    setIsLoading(true);
    try {
      // UPGRADE: Use the new, efficient API call
      const myPosts = await getMyPosts();
      setPosts(myPosts);

      // NEW: Fetch status for each post concurrently
      if (myPosts.length > 0) {
        const statusPromises = myPosts.map(post => getStatus(post.id));
        const statuses = await Promise.all(statusPromises);
        
        // Create a map of postId -> status string
        const statusMap = myPosts.reduce((acc, post, index) => {
          acc[post.id] = statuses[index]?.status || 'Pending';
          return acc;
        }, {});
        setPostStatuses(statusMap);
      }
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
    // Note: window.confirm is simple, but custom modals are better for UX
    if (window.confirm("Are you sure you want to delete this post?")) {
        try {
            await deletePost(postId);
            fetchUserPosts(); // Refresh posts
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    }
  };

  if (isLoading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading your posts...</p>;
  if (!user) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Please sign in to see your page.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 16 }}>
      <h2>{user.name}'s Dashboard</h2>
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>My Reported Issues</h3>
      {posts.length === 0 ? (
        <p>You have not reported any issues yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            {editingPostId === post.id ? (
              <>
                {/* ... edit form remains the same ... */}
              </>
            ) : (
              <div>
                <p><strong>{post.desc}</strong></p>
                {post.img && <img src={post.img} alt={post.desc} style={{ width: "100%", borderRadius: 4, maxHeight: 200, objectFit: "cover" }} />}
                
                {/* --- 👇 NEW: Status Display --- */}
                <div style={{ margin: '10px 0', padding: '8px', background: '#f5f5f5', borderRadius: 4 }}>
                  <strong>Status:</strong> {postStatuses[post.id] || 'Loading...'}
                </div>
                {/* --- 👆 END: Status Display --- */}

                <div style={{ marginTop: '10px' }}>
                  {/* --- 👇 NEW: Conditional Feedback Button --- */}
                  {postStatuses[post.id] === 'Issue resolved' ? (
                    <Link to={`/feedback/${post.id}`} style={{ textDecoration: 'none', color: 'white', background: '#28a745', padding: '8px 12px', borderRadius: 5, marginRight: '8px' }}>
                      Send Feedback
                    </Link>
                  ) : (
                    <button onClick={() => startEditing(post)}>Edit</button>
                  )}
                  {/* --- 👆 END: Conditional Button --- */}
                  <button onClick={() => removePost(post.id)} style={{ marginLeft: 8 }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
