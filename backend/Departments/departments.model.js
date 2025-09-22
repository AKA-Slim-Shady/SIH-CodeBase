import pool from "../database.js";

export const createDepartmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("✅ Departments table ready");
  } catch (err) {
    console.error("❌ Error creating departments table:", err);
  }
};
