
const fileModel = require('../models/fileModel');
const userModel = require('../models/userModel');

const events = require('events');
const pool = require('../config/database');

// Create an event emitter
const eventEmitter = new events.EventEmitter();

const getFileByHash = (fileHash, guildId) => {
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
const getFileById = (fileId) => {
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

async function isFileIdUsed(fileId) {
    const file = await getFileById(fileId);
    return file !== null;
}

const deleteFile = async (fileId) => {
    const file = await getFileById(fileId);
    await userModel.removeBytes(file.userid, file.fileSize);

    const result = await fileModel.deleteFile(fileId);

    return result;
}

function emitFileUploaded(channelId, userId, isDM, fileName, downloadLink) {
    eventEmitter.emit('fileUploaded', { channelId: channelId, userId: userId, isDM: isDM, fileName: fileName, downloadLink: downloadLink });
}

function searchFile(guildId, userId, filename) {
    return new Promise(async (resolve, reject) => {
        // Use the LIKE operator with a wildcard to search for partial names
        pool.query('SELECT * FROM files WHERE guildId = $1 AND userId = $2 AND filename LIKE $3', [guildId, userId, '%' + filename + '%'], (error, results) => {
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

module.exports = {
    deleteFile,
    getFileByHash,
    getFileById,
    isFileIdUsed,
    eventEmitter,
    emitFileUploaded,
    searchFile
};
