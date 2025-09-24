const BASE = "http://localhost:5000/api/status";

export const updateStatus = async (postId, data) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authorization token found.");
  }
  
  const res = await fetch(`${BASE}/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ Add the authorization header
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to update status.");
  }
  
  return res.json();
};

export const getStatus = async (postId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authorization token found.");
  }

  const res = await fetch(`${BASE}/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Add the authorization header
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to get status.");
  }

  return res.json();
};
