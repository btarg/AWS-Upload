import { deleteFile } from '../models/fileModel.js';
import { removeBytes } from '../models/userModel.js';

import events from 'events';
import pool from '../config/database.js';

// Create an event emitter
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

export async function deleteFileById(fileId) {
    const file = await getFileById(fileId);
    await removeBytes(file.userid, file.fileSize);
    const result = await deleteFile(fileId);
    return result;
}

export function emitFileUploaded(channelId, userData, isDM, fileName, fileSize, expirationDate, downloadLink) {
    eventEmitter.emit('fileUploaded', { channelId: channelId, userData: userData, isDM: isDM, fileName: fileName, fileSize: fileSize, expirationDate: expirationDate, downloadLink: downloadLink });
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
