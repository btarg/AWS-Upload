const pool = require('../config/database');

// Create the files table if it doesn't exist
const createFileTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      fileId VARCHAR(255) NOT NULL,
      guildId VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      fileHash VARCHAR(255) NOT NULL,
      fileSize BIGINT NOT NULL,
      uploadDate TIMESTAMP NOT NULL,
      expiresAt TIMESTAMP
    );
  `;
  await pool.query(query);
};

// Insert a new file record and return its ID
const insertFile = async (fileId, guildId, userId, filename, fileHash, fileSize, uploadDate, expiresAt) => {
  const query = `
    INSERT INTO files (fileId, guildId, userId, filename, fileHash, fileSize, uploadDate, expiresAt)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING fileId
  `;
  const result = await pool.query(query, [fileId, guildId, userId, filename, fileHash, fileSize, uploadDate, expiresAt]);
  return result.rows[0].fileId;
};

// Get expired files
const getExpiredFiles = async () => {
  const now = new Date();
  const currentDate = now.toISOString();

  const query = 'SELECT * FROM files WHERE expiresAt <= $1';
  const { rows } = await pool.query(query, [currentDate]);
  return rows;
};

// Delete a file record
const deleteFile = async (id) => {
  const query = 'DELETE FROM files WHERE fileId = $1';
  await pool.query(query, [id]);
};

module.exports = {
  createFileTable,
  insertFile,
  getExpiredFiles,
  deleteFile,
};
