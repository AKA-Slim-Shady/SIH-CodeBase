import React, { useEffect, useState } from "react";
import {
  getComments,
  createComment as apiCreateComment,
  deleteComment as apiDeleteComment,
} from "../api/comments";
import { io as ioClient } from "socket.io-client";

const socket = ioClient("http://localhost:5000");

export default function CommentsSection({ postId, userId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (useEffect hook remains the same) ...
    const fetchComments = async () => {
      try {
        const data = await getComments(postId);
        if (Array.isArray(data)) setComments(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments.");
      }
    };
    fetchComments();

    const onCreated = ({ postId: pId, comment }) => {
      if (parseInt(pId, 10) === parseInt(postId, 10)) {
        setComments((prev) => [comment, ...prev]);
      }
    };
    const onDeleted = ({ postId: pId, commentId }) => {
      if (parseInt(pId, 10) === parseInt(postId, 10)) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    };

    socket.on("commentCreated", onCreated);
    socket.on("commentDeleted", onDeleted);

    return () => {
      socket.off("commentCreated", onCreated);
      socket.off("commentDeleted", onDeleted);
    };
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be signed in to comment.");

    try {
      setIsPosting(true);
      // This function now returns { success: true }
      const result = await apiCreateComment(postId, {
        content: newComment.trim(),
      });

      // --- THE FIX: We check for the success flag ---
      // We no longer try to add the comment to the state here.
      // We trust the WebSocket 'commentCreated' event to do that.
      if (result.success) {
        setNewComment(""); // Clear the input on success
        setError(null);
      } else {
        // This is a fallback, but the API should throw an error before this.
        throw new Error("API did not confirm success.");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError(err.message || "Could not post comment."); // Use the specific error message
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    // ... (handleDelete function remains the same) ...
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiDeleteComment(postId, commentId);
      // The WebSocket 'commentDeleted' event will handle removing it from state.
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Could not delete comment.");
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ marginBottom: 6 }}>💬 Comments</h4>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        style={{
          maxHeight: 160,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 6,
          borderRadius: 6,
        }}
      >
        {comments.length === 0 && !error ? (
          <p style={{ color: "#777", margin: 0 }}>
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={{ marginBottom: 8, fontSize: '0.9rem' }}>
              <strong>{c.User?.name || "Anonymous"}:</strong> {c.content}
              {c.User?.id === userId && (
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{ marginLeft: 8, fontSize: 12, color: "red", border: "none", background: "transparent", cursor: "pointer"}}
                >
                  🗑
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: '6px' }}>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={userId ? "Write a comment..." : "Sign in to comment"}
          disabled={!userId || isPosting}
          style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          onClick={handleAddComment}
          disabled={!userId || isPosting || !newComment.trim()}
          style={{ padding: "6px 10px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6 }}
        >
          {isPosting ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}
