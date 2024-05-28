import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteFileById } from '../services/fileService.js';

export const createFolderTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS folders (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      userId VARCHAR(255) NOT NULL,
      parent_folder_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (parent_folder_id) REFERENCES folders(id),
      UNIQUE (name, userId, parent_folder_id)
    );
  `;
    await pool.query(query);
};

// Insert a new folder record and return its ID
// When a folder is not unique we try to get the right one
export async function insertFolder(name, userId, parentFolderId = null) {
    // Check if the user exists
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
        throw new Error(`User with ID ${userId} does not exist`);
    }

    try {
        // Generate a new UUID for the folder
        const folderId = uuidv4();

        // Try to insert the folder
        await pool.query('INSERT INTO folders (id, name, userId, parent_folder_id) VALUES ($1, $2, $3, $4)', [folderId, name, userId, parentFolderId]);
        return folderId;
    } catch (error) {
        if (error.code === '23505') { // Unique violation error
            // The folder already exists, so get its ID
            const { rows } = await pool.query('SELECT id FROM folders WHERE name = $1 AND userId = $2 AND parent_folder_id = $3', [name, userId, parentFolderId]);
            return rows[0].id;
        } else {
            throw error;
        }
    }
}


export async function deleteFolderAndContents(folderId) {
    const cteQuery = `
        WITH RECURSIVE cte AS (
            SELECT id FROM folders WHERE id = $1
            UNION ALL
            SELECT folders.id FROM folders JOIN cte ON folders.parent_folder_id = cte.id
        )
        SELECT id FROM cte
    `;

    const folderIds = await pool.query(cteQuery, [folderId]);

    const getFilesQuery = `SELECT fileid FROM files WHERE folderid = ANY($1::VARCHAR(255)[])`;
    const files = await pool.query(getFilesQuery, [folderIds.rows.map(row => row.id)]);

    for (let file of files.rows) {
        await deleteFileById(file.fileid);
    }

    const deleteFoldersQuery = `DELETE FROM folders WHERE id = ANY($1::VARCHAR(255)[])`;
    await pool.query(deleteFoldersQuery, [folderIds.rows.map(row => row.id)]);
}

export const deleteFolder = async (id) => {
    const query = 'DELETE FROM folders WHERE id = $1';
    await pool.query(query, [id]);
};