import { deleteFile } from '../models/fileModel.js';
import { removeBytes } from '../models/userModel.js';

import events from 'events';
import pool from '../config/database.js';

export const eventEmitter = new events.EventEmitter();

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
    let query = 'UPDATE files SET lifetimeData = jsonb_set(lifetimeData, \'{healthPoints}\', ((lifetimeData->>\'healthPoints\')::int - 1)::text::jsonb)';
    await pool.query(query);

    // Remove decayed files
    query = 'DELETE FROM files WHERE (lifetimeData->>\'healthPoints\')::int <= 0';
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
