const BASE = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
  const res = await fetch(BASE);
  return res.json();
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
};
