// frontend/src/api/comments.js
const BASE = "http://localhost:5000/api/comments";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export const createComment = async (postId, data) => {
  const res = await fetch(`${BASE}/${postId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateComment = async (postId, commentId, data) => {
  const res = await fetch(`${BASE}/${postId}/${commentId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteComment = async (postId, commentId) => {
  const res = await fetch(`${BASE}/${postId}/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getComments = async (postId) => {
  const res = await fetch(`${BASE}/${postId}`);
  return res.json();
};
