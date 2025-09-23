const BASE = "http://localhost:5000/api/posts";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// GET all posts
export const getAllPosts = async () => {
  const token = localStorage.getItem("token"); // only in frontend
  const res = await fetch(BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

// GET single post
export const getPost = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { headers: getAuthHeaders() });
  return res.json();
};

// PATCH update post
export const updatePost = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
};

// DELETE post
export const deletePost = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE", headers: getAuthHeaders() });
  return res.json();
};

// POST create
export const createPost = async (formData) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
};

export const likePost = async (postId) => {
  const res = await fetch(`${BASE}/like/${postId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const unlikePost = async (postId) => {
  const res = await fetch(`${BASE}/like/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
};

// etc. for filterPosts, likePost, dislikePost, getDeptForPost
