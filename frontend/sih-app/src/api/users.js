const USER_BASE = "http://localhost:5000/api/users";

export const getAllUsers = async () => {
  const res = await fetch(USER_BASE);
  return res.json();
};

export const getUser = async (id) => {
  const res = await fetch(`${USER_BASE}/${id}`);
  return res.json();
};

export const updateUser = async (id, data) => {
  const res = await fetch(`${USER_BASE}/${id}`, {
    method: "PATCH", // ✅ corrected
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${USER_BASE}/${id}`, { method: "DELETE" });
  return res.json();
};
