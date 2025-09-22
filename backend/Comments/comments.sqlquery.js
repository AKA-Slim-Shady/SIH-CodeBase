import pool from "../database.js";

// Create comment
export const createComment = async (req, res) => {
  const { postid } = req.params;
  const { user_id, content } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [postid, user_id, content]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  const { postid, commentid } = req.params;
  const { content } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE comments SET content=$1 WHERE id=$2 AND post_id=$3 RETURNING *",
      [content, commentid, postid]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  const { postid, commentid } = req.params;
  try {
    await pool.query("DELETE FROM comments WHERE id=$1 AND post_id=$2", [commentid, postid]);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get comments for post
export const getComments = async (req, res) => {
  const { postid } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM comments WHERE post_id=$1", [postid]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
