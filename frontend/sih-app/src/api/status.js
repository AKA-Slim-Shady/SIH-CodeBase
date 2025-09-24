const BASE = "http://localhost:5000/api/status";

// This function is used by the admin dashboard to change an issue's status.
// Your new version with explicit token handling is more robust.
export const updateStatus = async (postId, data) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authorization token found.");
  }
  
  const res = await fetch(`${BASE}/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to update status.");
  }
  
  return res.json();
};

// This function is used by the UserPage to display the status of each post.
export const getStatus = async (postId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authorization token found.");
  }

  const res = await fetch(`${BASE}/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // MERGED LOGIC: If a status record isn't found for a post, it means
  // the status is still "Pending". This prevents the UI from breaking.
  if (res.status === 404) {
    return { status: 'Pending' };
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to get status.");
  }

  return res.json();
};

