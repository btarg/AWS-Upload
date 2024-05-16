const pool = require('../config/database');

// Create the users table if it doesn't exist
const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      isPremium BOOLEAN NOT NULL,
      premiumExpiry TIMESTAMP,
      bytesUsed BIGINT DEFAULT 0
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
        return { id: user.id, isPremium, premiumExpiry: user.premiumexpiry, bytesUsed: user.bytesused };
    }
    // empty user
    return { isPremium: false, premiumExpiry: null, bytesUsed: 0 };
};

const getAllUsers = async () => {
    const query = `
    SELECT * FROM users;
  `;

    const { rows } = await pool.query(query);
    return rows;
}

// Insert or update a user
const upsertUserData = async (id, isPremium, premiumExpiry, bytesUsed) => {
    const user = {
        id,
        isPremium,
        premiumExpiry,
        bytesUsed
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

// Add bytes to a user
const addBytes = async (userId, bytes) => {
    const query = `
    UPDATE users
    SET bytesUsed = bytesUsed + $2
    WHERE id = $1
  `;
    await pool.query(query, [userId, bytes]);
};

// Remove bytes from a user
const removeBytes = async (userId, bytes) => {
    const query = `
    UPDATE users
    SET bytesUsed = GREATEST(0, bytesUsed - $2)
    WHERE id = $1
  `;
    await pool.query(query, [userId, bytes]);
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