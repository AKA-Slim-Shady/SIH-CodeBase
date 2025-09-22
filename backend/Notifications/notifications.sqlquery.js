import pool from "../database.js";

// Get notifications for user
export const getUserNotifications = async (req, res) => {
  const { userid } = req.body; // or take from auth middleware
  try {
    const { rows } = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
      [userid]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  const { notificationid } = req.params;
  try {
    await pool.query("DELETE FROM notifications WHERE id=$1", [notificationid]);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
