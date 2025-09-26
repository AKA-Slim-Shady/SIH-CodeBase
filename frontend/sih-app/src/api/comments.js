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

  // If the response is not ok, parse the error message and throw it.
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create comment.');
  }

  // If the response was ok (201 Created), we don't need the body.
  // The WebSocket will deliver the new comment. Just return a success flag.
  return { success: true };
};

export const updateComment = async (postId, commentId, data) => {
  const res = await fetch(`${BASE}/${postId}/${commentId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const responseData = await res.json();
  if (!res.ok) {
    throw new Error(responseData.message || 'Failed to update comment.');
  }
  return responseData;
};

export const deleteComment = async (postId, commentId) => {
  const res = await fetch(`${BASE}/${postId}/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const responseData = await res.json();
    throw new Error(responseData.message || 'Failed to delete comment.');
  }
  return { success: true };
};

export const getComments = async (postId) => {
  const res = await fetch(`${BASE}/${postId}`);
  const responseData = await res.json();
  if (!res.ok) {
    throw new Error(responseData.message || 'Failed to fetch comments.');
  }
  return responseData;
};

