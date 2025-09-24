const BASE = "http://localhost:5000/api/notifications";

// Helper to get authorization headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  // Ensure the headers are set correctly for protected routes
  return token 
    ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      } 
    : {
        'Content-Type': 'application/json'
      };
};

// GET all notifications for the logged-in user
export const getNotifications = async () => {
  const res = await fetch(BASE, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return res.json();
};

// --- 👇 NEW: Function to mark a notification as read ---
export const markNotificationAsRead = async (id) => {
  const res = await fetch(`${BASE}/${id}/read`, { 
    method: "PATCH", // Use PATCH for partial updates
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to mark notification as read');
  }
  return res.json();
};
// --- 👆 END: New Function ---


// DELETE a notification by its ID
export const deleteNotification = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to delete notification');
  }
  return res.json();
};

