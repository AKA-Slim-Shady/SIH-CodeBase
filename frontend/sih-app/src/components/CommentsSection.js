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
        setComments((prev) => {
          if (prev.some(c => c.id === comment.id)) {
            return prev;
          }
          return [comment, ...prev];
        });
      }
    };

    const onUpdated = ({ postId: pId, comment }) => {
      if (parseInt(pId, 10) === parseInt(postId, 10)) {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? comment : c))
        );
      }
    };

    const onDeleted = ({ postId: pId, commentId }) => {
      if (parseInt(pId, 10) === parseInt(postId, 10)) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    };

    socket.on("commentCreated", onCreated);
    socket.on("commentUpdated", onUpdated);
    socket.on("commentDeleted", onDeleted);

    return () => {
      socket.off("commentCreated", onCreated);
      socket.off("commentUpdated", onUpdated);
      socket.off("commentDeleted", onDeleted);
    };
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be signed in to comment.");

    try {
      setIsPosting(true);
      const added = await apiCreateComment(postId, {
        content: newComment.trim(),
      });

      if (added && added.id) {
        setComments((prev) => [added, ...prev]);
        setNewComment("");
        setError(null);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Could not post comment.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be signed in to delete your comment.");
    if (!window.confirm("Delete this comment?")) return;

    try {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      await apiDeleteComment(postId, commentId);
    } catch (err) {
      console.error("Error deleting comment:", err);
      const data = await getComments(postId);
      if (Array.isArray(data)) setComments(data);
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
            <div key={c.id} style={{ marginBottom: 8 }}>
              <strong>{c.User?.name || "Anonymous"}:</strong> {c.content}
              {c.User?.id === userId && (
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: "red",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 8, display: "flex" }}>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={userId ? "Write a comment..." : "Sign in to comment"}
          disabled={!userId || isPosting}
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={!userId || isPosting || !newComment.trim()}
          style={{
            marginLeft: 6,
            padding: "6px 10px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
          }}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}