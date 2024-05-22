import pool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

// Create the users table if it doesn't exist
export const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL
    );
  `;
    await pool.query(query);
};

export const getAllUsers = async () => {
    const query = `
    SELECT * FROM users;
  `;
    const { rows } = await pool.query(query);
    return rows;
}

export const getUserByDiscord = async (discordUserId) => {
    const query = 'SELECT * FROM users WHERE data->>\'discordId\' = $1';
    const { rows } = await pool.query(query, [discordUserId]);
    if (rows.length > 0) {
        return rows[0];
    }
    return null;
}

export const getUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    if (rows.length > 0) {
        return rows[0];
    }
    // empty user with undefined id - we handle this elsewhere to create a new user
    return null;
};

// Insert or update a user
export const upsertUserData = async (id, data) => {
    if (!data.bytesAllowed) {
        data.bytesAllowed = await getBytesAllowed();
    }
    return await upsertUser(id, data);
};

export async function getBytesAllowed() {
    return (process.env.MB_ALLOWED || 10000) * 1024 * 1024;
};

export const addCredits = async (userId, creditsToAdd) => {
    const user = await getUserById(userId);
    if (user) {
        user.data.credits += creditsToAdd;
        await upsertUser(userId, user.data);
    }
};

export const removeCredits = async (userId, creditsToRemove) => {
    const user = await getUserById(userId);
    if (user) {
        user.data.credits = Math.max(0, user.data.credits - creditsToRemove);
        await upsertUser(userId, user.data);
    }
};

export const upsertUser = async (id, data) => {
    const query = `
    INSERT INTO users (id, data)
    VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data
    RETURNING *
  `;
    const { rows } = await pool.query(query, [id, JSON.stringify(data)]);
    return rows[0];
};


export const addBytes = async (userId, bytes) => {
    const user = await getUserById(userId);
    if (user) {
        user.data.bytesUsed += bytes;
        await upsertUser(userId, user.data);
    }
};

// Remove bytes from a user
export const removeBytes = async (userId, bytes) => {
    const user = await getUserById(userId);
    if (user) {
        user.data.bytesUsed = Math.max(0, user.data.bytesUsed - bytes);
        await upsertUser(userId, user.data);
    }
};