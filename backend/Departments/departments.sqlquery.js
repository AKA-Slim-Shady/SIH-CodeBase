import pool from "../database.js";

// Create dept
export const createDepartment = async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO departments (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all depts
export const getDepartments = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM departments");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific dept
export const getDepartmentById = async (req, res) => {
  const { deptid } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM departments WHERE id=$1", [deptid]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update dept
export const updateDepartment = async (req, res) => {
  const { deptid } = req.params;
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE departments SET name=$1 WHERE id=$2 RETURNING *",
      [name, deptid]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete dept
export const deleteDepartment = async (req, res) => {
  const { deptid } = req.params;
  try {
    await pool.query("DELETE FROM departments WHERE id=$1", [deptid]);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
