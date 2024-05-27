import { deleteFile } from '../models/fileModel.js';
import { removeBytes } from '../models/userModel.js';

import events from 'events';
import pool from '../config/database.js';

export const eventEmitter = new events.EventEmitter();

export async function getParentFolderNames(fileId) {
    const query = `
        WITH RECURSIVE parent_folders AS (
            SELECT id, name, parent_folder_id, userId
            FROM folders
            WHERE (id, userId) = (
                SELECT folderId, userId
                FROM files
                WHERE fileId = $1
            )
            UNION ALL
            SELECT f.id, f.name, f.parent_folder_id, f.userId
            FROM folders f
            INNER JOIN parent_folders pf ON f.id = pf.parent_folder_id AND f.userId = pf.userId
        )
        SELECT array_agg(name ORDER BY id) as names
        FROM parent_folders;
    `;
    const { rows } = await pool.query(query, [fileId]);
    return rows[0]?.names || [];
}

export const getAllFilesInFolder = (folderId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM files WHERE folderId = $1', [folderId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows);
            }
        });
    });
}

export const getFileByHash = (fileHash) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM files WHERE fileHash = $1', [fileHash], (error, results) => {
            if (error) {
                reject(error);
            } else if (results.rows.length > 0) {
                resolve(results.rows[0]);
            } else {
                resolve(null);
            }
        });
    });
};
export const getFileById = (fileId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM files WHERE fileId = $1', [fileId], (error, results) => {
            if (error) {
                reject(error);
            } else if (results.rows.length > 0) {
                resolve(results.rows[0]);
            } else {
                resolve(null);
            }
        });
    });
};

export async function isFileIdUsed(fileId) {
    const file = await getFileById(fileId);
    return file !== null;
}
export const decreaseHealthPointsAndRemoveDecayedFiles = async () => {
    // Decrease health points for all files
    let query = 'UPDATE files SET healthPoints = (healthPoints::int - 1)::text';
    await pool.query(query);

    // Remove decayed files
    query = 'DELETE FROM files WHERE healthPoints::int <= 0';
    const { rows } = await pool.query(query);
    return rows;
};
export async function deleteFileById(fileId) {
    const file = await getFileById(fileId);
    await removeBytes(file.userid, file.fileSize);
    const result = await deleteFile(fileId);
    return result;
}

export function emitFileUploaded(user, fileName, fileSize, encryptionData, downloadLink) {
    eventEmitter.emit('fileUploaded', { user: user, fileName: fileName, fileSize: fileSize, encryptionData: encryptionData, downloadLink: downloadLink });
}

export function searchFile(userId, filename) {
    return new Promise(async (resolve, reject) => {
        // Allow searching via name, hash or ID
        pool.query('SELECT * FROM files WHERE userId = $1 AND (filename LIKE $2 OR filehash LIKE $2 OR fileid LIKE $2)', [userId, `%${filename}%`], (error, results) => {
            if (error) {
                reject(error);
            } else if (results.rows.length > 0) {
                resolve(results.rows);
            } else {
                reject(new Error('File not found'));
            }
        });
    });
}
