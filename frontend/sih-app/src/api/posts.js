const BASE = "http://localhost:5000/api/posts";

export const createPost = async (formData) => {
  const res = await fetch(BASE, { method: "POST", body: formData });
  return res.json();
};

export const getAllPosts = async () => {
  const res = await fetch(BASE);
  return res.json();
};

export const getPost = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  return res.json();
};

export const updatePost = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
};

export const deletePost = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
};

export const filterPosts = async (loc) => {
  const res = await fetch(`${BASE}?loc=${loc}`);
  return res.json();
};

export const likePost = async (id) => {
  const res = await fetch(`${BASE}/like/${id}`, { method: "POST" });
  return res.json();
};

export const dislikePost = async (id) => {
  const res = await fetch(`${BASE}/like/${id}`, { method: "DELETE" });
  return res.json();
};

export const getDeptForPost = async (id) => {
  const res = await fetch(`${BASE}/dept/${id}`);
  return res.json();
};
