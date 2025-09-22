import pool from "../database.js";

export const createStatusTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS status (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'Pending',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("✅ Status table ready");
  } catch (err) {
    console.error("❌ Error creating status table:", err);
  }
};
