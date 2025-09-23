export const admin = (req, res, next) => {
    // This middleware assumes that 'protect' has already run and attached the user to the request
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. You are not an admin." });
    }
};