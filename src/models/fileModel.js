import pool from '../config/database.js';

export const createFileTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      fileId VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      fileHash VARCHAR(255) NOT NULL,
      fileSize BIGINT NOT NULL,
      uploadDate TIMESTAMP NOT NULL,
      encryptionData JSONB NOT NULL,
      healthPoints VARCHAR(255) NOT NULL
    );
  `;
  await pool.query(query);
};

// Insert a new file record and return its ID
export const insertFile = async (fileId, userId, filename, fileHash, fileSize, uploadDate, encryptionData, healthPoints) => {
  const query = `
    INSERT INTO files (fileId, userId, filename, fileHash, fileSize, uploadDate, encryptionData, healthPoints)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING fileId
  `;

  // Convert dates to ISO 8601 strings
  const uploadDateISO = uploadDate ? uploadDate.toISOString() : null;

  const result = await pool.query(query, [fileId, userId, filename, fileHash, fileSize, uploadDateISO, JSON.stringify(encryptionData), healthPoints]);  // Removed JSON.stringify from healthPoints
  return result.rows[0].fileId;
};

// Delete a file record
export const deleteFile = async (id) => {
  const query = 'DELETE FROM files WHERE fileId = $1';
  await pool.query(query, [id]);
};