const BASE = "http://localhost:5000/api/status";

export const updateStatus = async (postId, data) => {
  const res = await fetch(`${BASE}/${postId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
};

export const getStatus = async (postId) => {
  const res = await fetch(`${BASE}/${postId}`);
  return res.json();
};
