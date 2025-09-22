import User from '../models/userModel.js';

// GET /api/users - Get a list of all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // Exclude the primary key 'id' from the result, as clerkId is the public ID
            attributes: { exclude: ['id'] }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// GET /api/users/:userid - Get a single user by their Clerk ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { clerkId: req.params.userid },
            attributes: { exclude: ['id'] } 
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

// PATCH /api/users/:userid - Update a user's information
export const updateUser = async (req, res) => {
    // Security Check: A user can only update their own profile.
    // req.auth.userId comes from the Clerk middleware
    if (req.auth.userId !== req.params.userid) {
         return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }
    
    try {
        const [numberOfAffectedRows] = await User.update(req.body, {
            where: { clerkId: req.params.userid }
        });

        if (numberOfAffectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no new data to update' });
        }
        
        // Fetch and return the updated user data
        const updatedUser = await User.findOne({ where: { clerkId: req.params.userid } });
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

