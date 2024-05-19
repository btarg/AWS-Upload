const pool = require('../config/database');
require("dotenv").config();

// Create the users table if it doesn't exist
const createUserTable = async () => {
    const defaultBytesAllowed = await getBytesAllowed(false);

    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      isPremium BOOLEAN NOT NULL DEFAULT false,
      premiumExpiry TIMESTAMP,
      bytesUsed BIGINT DEFAULT 0,
      bytesAllowed BIGINT DEFAULT ${defaultBytesAllowed}
    );
  `;
    await pool.query(query);
};

// Get user by ID
const getUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    if (rows.length > 0) {
        const user = rows[0];
        let isPremium = user.ispremium;
        if (user.premiumexpiry && !isNaN(new Date(user.premiumexpiry))) {
            isPremium = user.ispremium && new Date(user.premiumexpiry) > new Date();
        }
        const bytesAllowed = await getBytesAllowed(isPremium);

        return { id: user.id, isPremium, premiumExpiry: user.premiumexpiry, bytesUsed: user.bytesused, bytesAllowed: bytesAllowed };
    }
    // empty user with undefined id
    const bytesAllowed = await getBytesAllowed(false);
    return { isPremium: false, premiumExpiry: null, bytesUsed: 0, bytesAllowed: bytesAllowed };
};

const getAllUsers = async () => {
    const query = `
    SELECT * FROM users;
  `;

    const { rows } = await pool.query(query);
    return rows;
}

const getBytesAllowed = async (premium) => {
    if (premium) {
        return (process.env.MB_ALLOWED_PREMIUM || 25000) * 1024 * 1024; // 100mb
    } else {
        return (process.env.MB_ALLOWED || 10000) * 1024 * 1024
    }
};

// Insert or update a user
const upsertUserData = async (id, isPremium, premiumExpiry, bytesUsed) => {
    const bytesAllowed = getBytesAllowed(isPremium);
    const user = {
        id,
        isPremium,
        premiumExpiry,
        bytesUsed,
        bytesAllowed
    };
    await upsertUser(user);
};


const upsertUser = async (user) => {
    const query = `
    INSERT INTO users (id, isPremium, premiumExpiry, bytesUsed)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE
    SET isPremium = EXCLUDED.isPremium,
        premiumExpiry = EXCLUDED.premiumExpiry,
        bytesUsed = EXCLUDED.bytesUsed
  `;
    await pool.query(query, [user.id, user.isPremium, user.premiumExpiry, user.bytesUsed]);
};

const addBytes = async (userId, bytes) => {
    const query = `
    UPDATE users
    SET bytesUsed = bytesUsed + $2
    WHERE id = $1
  `;
    try {
        await pool.query(query, [userId, bytes]);
    } catch (error) {
        console.error('Error updating bytes used:', error);
    }
};

// Remove bytes from a user
const removeBytes = async (userId, bytes) => {
    const query = `
    UPDATE users
    SET bytesUsed = GREATEST(0, bytesUsed - $2)
    WHERE id = $1
  `;
    try {
        await pool.query(query, [userId, bytes]);
    } catch (error) {
        console.error('Error removing bytes used:', error);
    }
};

module.exports = {
    createUserTable,
    getUserById,
    upsertUser,
    upsertUserData,
    getAllUsers,
    addBytes,
    removeBytes
};