import { deleteFile } from '../models/fileModel.js';
import { removeBytes } from '../models/userModel.js';

import events from 'events';
import pool from '../config/database.js';

// Create an event emitter
export const eventEmitter = new events.EventEmitter();

export const getFileByHash = (fileHash, guildId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM files WHERE guildId = $1 AND fileHash = $2', [guildId, fileHash], (error, results) => {
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

export function emitFileUploaded(channelId, userData, isDM, fileName, fileSize, downloadLink) {
    eventEmitter.emit('fileUploaded', { channelId: channelId, userData: userData, isDM: isDM, fileName: fileName, fileSize: fileSize, downloadLink: downloadLink });
}

export function searchFile(guildId, userId, filename) {
    return new Promise(async (resolve, reject) => {
        // Use the LIKE operator with a wildcard to search for partial names
        pool.query('SELECT * FROM files WHERE guildId = $1 AND userId = $2 AND (filename LIKE $3 OR filehash LIKE $3)', [guildId, userId, `%${filename}%`], (error, results) => {
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
