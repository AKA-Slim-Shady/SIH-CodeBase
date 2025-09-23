const BASE = "http://localhost:5000/api/comments";

export const createComment = async (postId, data) => {
  const res = await fetch(`${BASE}/${postId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
};

export const updateComment = async (postId, commentId, data) => {
  const res = await fetch(`${BASE}/${postId}/${commentId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
};

export const deleteComment = async (postId, commentId) => {
  const res = await fetch(`${BASE}/${postId}/${commentId}`, { method: "DELETE" });
  return res.json();
};

export const getComments = async (postId) => {
  const res = await fetch(`${BASE}/${postId}`);
  return res.json();
};
