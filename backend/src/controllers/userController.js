// backend/src/controllers/userController.js

import User from '../models/userModel.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Never send the password hash
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userid, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const updateUser = async (req, res) => {
    if (req.user.id != req.params.userid) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }

    try {
        const [numberOfAffectedRows] = await User.update(req.body, {
            where: { id: req.params.userid }
        });

        if (numberOfAffectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no new data to update' });
        }

        const updatedUser = await User.findByPk(req.params.userid, { attributes: { exclude: ['password'] } });
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    if (req.user.id != req.params.userid) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own profile.' });
    }

    try {
        const user = await User.findByPk(req.params.userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};