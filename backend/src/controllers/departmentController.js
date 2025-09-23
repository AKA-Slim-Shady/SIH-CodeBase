// backend/src/controllers/departmentController.js

import Department from '../models/departmentModel.js';

// Create a new department (Admin only)
export const createDepartment = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Department name is required.' });
    }

    try {
        const newDepartment = await Department.create({ name, description });
        res.status(201).json(newDepartment);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ error: 'Failed to create department' });
    }
};

// Get all departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

// Get a specific department by ID
export const getDepartmentById = async (req, res) => {
    const { deptid } = req.params;
    try {
        const department = await Department.findByPk(deptid);
        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ error: 'Failed to fetch department' });
    }
};

// Update an existing department (Admin only)
export const updateDepartment = async (req, res) => {
    const { deptid } = req.params;
    const { name, description } = req.body;
    try {
        const [updatedRows] = await Department.update({ name, description }, {
            where: { id: deptid },
            returning: true,
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Department not found or no new data to update.' });
        }

        const updatedDepartment = await Department.findByPk(deptid);
        res.status(200).json(updatedDepartment);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
};

// Delete a department (Admin only)
export const deleteDepartment = async (req, res) => {
    const { deptid } = req.params;
    try {
        const deletedRows = await Department.destroy({
            where: { id: deptid },
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        res.status(200).json({ message: 'Department deleted successfully.' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
};
