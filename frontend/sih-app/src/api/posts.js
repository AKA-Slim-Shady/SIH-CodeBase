const BASE = "http://localhost:5000/api/posts";

const getAuthHeaders = () => {
  // This helper function correctly includes the token in requests
  const token = localStorage.getItem("token");
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- 👇 NEW: A dedicated function to get only the logged-in user's posts ---
export const getMyPosts = async () => {
  const res = await fetch(`${BASE}/myposts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    // Handle potential errors like an expired token
    throw new Error('Could not fetch your posts.');
  }
  return res.json();
};
// --- 👆 END: New Function ---


// GET all posts (This is still used by MapFeed.js)
export const getAllPosts = async () => {
  const res = await fetch(BASE, {
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// DELETE post
export const deletePost = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { 
    method: "DELETE", 
    headers: getAuthHeaders() 
  });
  return res.json();
};

// POST create - Note: For FormData, we let the browser set the Content-Type
export const createPost = async (formData) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(BASE, {
        method: "POST",
        headers: headers,
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
