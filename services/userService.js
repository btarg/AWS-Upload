const userModel = require('../models/userModel');

const getUser = async (userId) => {
    const user = await userModel.getUserById(userId);
    if (user) {
        return user;
    }
    return { isPremium: false, premiumExpiry: null, bytesUsed: 0 };
};

// List all files
const getAllUsers = async () => {
    const users = await userModel.getAllUsers();
    return users;
};

const setPremiumStatus = async (userId, isPremium) => {
    const query = 'UPDATE users SET isPremium = $1 WHERE id = $2';
    await pool.query(query, [isPremium, userId]);
};

module.exports = {
    getUser,
    getAllUsers,
    setPremiumStatus
};
