import pool from "../database.js";

// Update status
export const updateStatus = async (req, res) => {
  const { postid } = req.params;
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE status SET status=$1, updated_at=NOW() WHERE post_id=$2 RETURNING *",
      [status, postid]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get status
export const getStatus = async (req, res) => {
  const { postid } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM status WHERE post_id=$1",
      [postid]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
