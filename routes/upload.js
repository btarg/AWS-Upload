const express = require('express');
const multer = require('multer');
const fileService = require('../services/fileService');
const userService = require('../services/userService');
const userModel = require('../models/userModel');
const fs = require('fs');
const util = require('util');
const crypto = require('crypto');
const { getFullHostname } = require('../utils/hostname');

const { generateId } = require('./linkgenerator');
const upload = multer({ dest: 'uploads/' }); // store files in 'uploads/' directory
const unlinkFile = util.promisify(fs.unlink);

require('dotenv').config();

module.exports = (io) => {
    const router = express.Router();

    router.post('/', (req, res, next) => {
        try {

            upload.single('file')(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading.
                    console.error('Multer error', err);
                    return res.status(500).send('Error uploading file');
                } else if (err) {
                    // An unknown error occurred when uploading.
                    console.error('Unknown error', err);
                    return res.status(500).send('Error uploading file');
                }

                const file = req.file;
                const { guildId, userId, channelId, isDM } = req.body;

                // the last line of defense! if anything is null/undefined then error
                if (!file || !guildId || !userId || !channelId) {
                    return res.status(400).json({ error: 'Missing required parameters' });
                }

                console.log(`Uploading file: ${file.originalname} to guild ${guildId}, channel ${channelId}, user ${userId}`);

                // Refuse uploads below min
                const minSize = process.env.MB_MIN || 8;
                if (file.size < minSize * 1024 * 1024) {
                    return res.status(400).json({ error: `File size is too small. Minimum size is ${minSize}MB.` });
                }

                // Refuse uploads above limit
                if (file.size > (process.env.MB_MAX || 10) * 1024 * 1024 * 1024) {
                    return res.status(400).json({ error: `File size exceeds the limit. Maximum size is ${process.env.MB_MAX || 10}GB.` });
                }

                try {
                    const user = await userService.getUser(userId);

                    if (!user.isPremium && file.size > 10 * 1024 * 1024 * 1024) {
                        return res.status(400).json({ error: 'File size exceeds the limit for non-premium users' });
                    }

                    let fileId = req.session.linkId;
                    if (fileId) {
                        fileService.invalidateLink(fileId);
                    }
                    else {
                        fileId = generateId();
                    }

                    // hash the file
                    const hash = crypto.createHash('md5');
                    const stream = fs.createReadStream(file.path);
                    stream.on('data', (data) => hash.update(data));
                    await new Promise((resolve, reject) => {
                        stream.on('end', resolve);
                        stream.on('error', reject);
                    });
                    const fileHash = hash.digest('hex');

                    // Check if a file with the same hash already exists in this guild
                    // We don't check other guilds, since those files would have the wrong key structure
                    // and we want everyone's files to remain separate
                    const existingFile = await fileService.getFileByHash(fileHash, guildId);
                    if (existingFile) {
                        // If the file already exists, return the original copy
                        await unlinkFile(file.path); // delete the file after checking
                        const hostname = getFullHostname(req.hostname);
                        const downloadLink = `${hostname}/download/${existingFile.fileid}`; // remember, no capitals here!
                        console.log("Existing download link: " + downloadLink);
                        fileService.emitFileUploaded(channelId, userId, isDM, existingFile.filename, downloadLink);
                        return res.status(200).json({ message: 'File already exists', downloadLink: downloadLink });
                    }


                    // If the file doesn't exist, upload it to S3 and store the metadata in the database
                    const uploadResult = await fileService.uploadFile(req.hostname, fileId, file, guildId, channelId, isDM, userId, user.isPremium, fileHash, (progress) => {
                        io.emit('uploadProgress', { progress });
                        console.log('Upload progress:', progress);
                    });
                    await unlinkFile(file.path); // delete the file after upload

                    // Add the file size to the user object
                    await userModel.addBytes(userId, file.size);

                    req.session.linkId = null;
                    res.status(201).send(uploadResult);

                } catch (error) {
                    console.error('Error uploading file', error);
                    return res.status(500).send('Error uploading file');
                }
            });

        } catch (error) {
            if (error.code === 'ECONNRESET') {
                console.log('Connection was reset.')
            } else {
                throw error;
            }
        }
    });

    return router;

};
