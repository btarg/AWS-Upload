require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const adminAuth = (req, res, next) => {
    const authPassword = req.headers['x-admin-password'];
    if (authPassword && authPassword === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
};

module.exports = { adminAuth };