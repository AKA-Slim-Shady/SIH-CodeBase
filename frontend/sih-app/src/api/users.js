const BASE = "http://localhost:5000/api/users";

// Existing CRUD functions
export const createUser = async (data) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetch(BASE);
  return res.json();
};

export const getUser = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  return res.json();
};

export const updateUser = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
};

// ✅ Add login function
export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
};

// ✅ Add register function
export const registerUser = async (userData) => {
  const res = await fetch(`${BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};
