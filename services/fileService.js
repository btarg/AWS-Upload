const fs = require('fs');
const s3 = require('../config/s3');
const fileModel = require('../models/fileModel');

// get link map from new.js
const { invalidateLink, generateId } = require('../routes/linkgenerator');

const events = require('events'); // Import the events module

const { getFullHostname } = require('../utils/hostname');
const pool = require('../config/database');
const { emit } = require('process');

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

const deleteFile = async (fileId) => {
    const result = await fileModel.deleteFile(fileId);
    return result;
}

const uploadFile = async (hostname, fileId, file, guildId, channelId, isDM, userId, isPremium, fileHash, onProgress) => {
    hostname = getFullHostname(hostname);
    const s3Key = `${guildId}/${userId}/${file.originalname}`;

    const fileStream = fs.createReadStream(file.path);
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
    };

    const upload = s3.upload(params);

    upload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        onProgress(percentage);
    });

    const s3Result = await upload.promise();
    const expirationDate = isPremium ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const inserted = await fileModel.insertFile(fileId, guildId, userId, file.originalname, fileHash, new Date(), expirationDate);
    const downloadLink = `${hostname}/download/${fileId}`;

    emitFileUploaded(channelId, userId, isDM, file.originalname, downloadLink);

    return { result: s3Result, downloadLink: downloadLink };
};

function emitFileUploaded(channelId, userId, isDM, fileName, downloadLink) {
    eventEmitter.emit('fileUploaded', { channelId: channelId, userId: userId, isDM: isDM, fileName: fileName, downloadLink: downloadLink });
}

function searchFile(guildId, userId, filename) {
    return new Promise(async (resolve, reject) => {
        // Use the LIKE operator with a wildcard to search for partial names
        await pool.query('SELECT * FROM files WHERE guildId = $1 AND userId = $2 AND filename LIKE $3', [guildId, userId, '%' + filename + '%'], (error, results) => {
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
    uploadFile,
    deleteFile,
    getFileByHash,
    eventEmitter,
    emitFileUploaded,
    invalidateLink,
    searchFile
};
