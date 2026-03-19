const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
        }

        const decoded = jwt.verify(token, "asim123");
        
        // Check if the verified user has the admin role
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. You do not have administrator privileges.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
};

module.exports = adminAuth;
