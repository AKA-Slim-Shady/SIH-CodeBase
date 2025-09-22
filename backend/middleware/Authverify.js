import { clerkClient } from "@clerk/express";
import { User } from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing.' });
    }

    try {
        const claims = await clerkClient.verifyToken(token);
        const clerkId = claims.sub;

        const user = await User.findOne({ clerkId: clerkId });
        if (!user) {
            return res.status(404).json({ message: 'User not found in database.' });
        }

        req.user = user;

        next();
    } catch (err) {
        console.error('Error in authMiddleware:', err);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};


export const adminMiddleware = (req, res, next) => {
    // Assuming your main authentication middleware has populated req.user
    // with the authenticated user's details, including their admin status.
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. You are not an admin." });
    }
    // If the user is an admin, proceed to the next middleware or controller
    next();
};