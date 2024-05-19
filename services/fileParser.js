const formidable = require('formidable');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, S3 } = require("@aws-sdk/client-s3");
const Transform = require('stream').Transform;

const fileService = require('../services/fileService');
const userModel = require('../models/userModel');
const fileModel = require('../models/fileModel');

const { isLinkValid, generateId } = require('../routes/linkgenerator');
const { getFullHostname } = require('../utils/hostname');

require("dotenv").config();

const { getIo } = require('../config/socket');
const io = getIo();

const { accessKeyId, secretAccessKey, region, Bucket } = require('../config/aws');
const numberFromPSQL = require('../utils/conversions');

const parseAndUpload = async (req) => {
    return new Promise(async (resolve, reject) => {
        let options = {
            maxFileSize: (process.env.MB_MAX || 100) * 1024 * 1024, //100 megabytes converted to bytes,
            allowEmptyFiles: false,
            hashAlgorithm: 'sha1'
        }

        const fileHash = req.headers['filehash'];
        const fileSize = Number(req.headers['filesize']);
        const guildId = req.headers['guildid'];
        const channelId = req.headers['channelid'];
        const userId = req.headers['userid'];
        const isDM = req.headers['isdm'];

        const form = formidable(options);

        const hostname = getFullHostname(req.hostname);
        let fileId = req.session.linkId;
        if (!fileId || !isLinkValid(fileId)) {
            console.log('Invalid link ID, generating new one');
            fileId = generateId();
            req.session.linkId = fileId;
        } else {
            fileService.invalidateLink(fileId);
        }

        let user;
        try {
            user = await userModel.getUserById(userId);
            if (!user) {
                console.log("User not found");
                reject({ error: 'User not found', statusCode: 404 });
                return;
            }
        } catch (error) {
            console.log("Error getting user: " + error);
            reject({ error: 'Error getting user', statusCode: 500 });
            return;
        }

        // this will be set later
        let originalFilename;

        // method accepts the request and a callback.
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log("Error parsing: " + err);
                reject({ error: err.message, statusCode: 500 });
                return;
            }

        })
        form.on('error', error => {
            console.log("Rejected with error: " + error.message);
            reject({ error: error.message, statusCode: 500 })
            return;
        })

        form.on('progress', (bytesReceived, bytesExpected) => {
            const progressPercentage = bytesReceived / bytesExpected * 100; // Calculate the progress as a percentage
            if (!io) {
                console.error('Socket.io not initialized');

            } else {
                // Emit a 'progress' event with the calculated progress
                io.emit('uploadProgress', { progress: progressPercentage });
            }

        });

        form.on('fileBegin', (formName, file) => {
            originalFilename = file.originalFilename;
            console.log(`S3 KEY IS ${guildId}/${userId}/${originalFilename}`);

            let fileExists = false;

            // Check if a file with the same hash already exists in this guild
            fileService.getFileByHash(fileHash, guildId)
                .then(existingFile => {
                    console.log("Existing file: " + existingFile);
                    if (existingFile) {
                        // If the file already exists, return the original copy
                        const downloadLink = `${hostname}/download/${existingFile.fileid}`; // remember, no capitals here!
                        console.log("Existing download link: " + downloadLink);
                        fileService.emitFileUploaded(channelId, userId, isDM, existingFile.filename, downloadLink);
                        resolve({ message: 'File already exists', downloadLink: downloadLink });
                        fileExists = true;
                        return;
                    } else {

                        var bytesUsed = numberFromPSQL(user.bytesUsed);
                        var bytesAllowed = numberFromPSQL(user.bytesAllowed);
                        const bytesAboutToBeUsed = bytesUsed + fileSize;

                        console.log("FILE SIZE IS " + fileSize);
                        console.log("BYTES USED IS " + bytesUsed);
                        console.log("BYTES ALLOWED IS " + bytesAllowed);

                        console.log("Bytes used plus file size: " + bytesAboutToBeUsed);
                        if (bytesAboutToBeUsed >= bytesAllowed) {
                            console.log("User exceeded storage limit");
                            reject({ error: 'User has exceeded their storage limit', statusCode: 403 });
                            return;
                        }

                        file.open = async function () {
                            this._writeStream = new Transform({
                                transform(chunk, encoding, callback) {
                                    callback(null, chunk)
                                }
                            })

                            this._writeStream.on('error', e => {
                                form.emit('error', e)
                            });

                            // upload to S3
                            new Upload({
                                client: new S3Client({
                                    credentials: {
                                        accessKeyId,
                                        secretAccessKey
                                    },
                                    region
                                }),
                                params: {
                                    Bucket,
                                    Key: `${guildId}/${userId}/${originalFilename}`,
                                    Body: this._writeStream
                                },
                                tags: [], // optional tags
                                queueSize: 4, // optional concurrency configuration
                                partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
                                leavePartsOnError: false, // optional manually handle dropped parts
                            }).done()
                                .then(data => {
                                    form.emit('data', { name: "complete", value: data });

                                    // add bytes to user
                                    userModel.addBytes(userId, fileSize);

                                    const expirationDate = user.isPremium ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

                                    fileModel.insertFile(fileId, guildId, userId, originalFilename, fileHash, new Date(), expirationDate)
                                        .then(() => {
                                            const downloadLink = `${hostname}/download/${fileId}`;

                                            fileService.emitFileUploaded(channelId, userId, isDM, file.originalFilename, downloadLink);
                                            console.log(`Finished uploading to AWS: ${file.originalFilename} to guild ${guildId}, channel ${channelId}, user ${userId}`);

                                            resolve({ downloadLink: downloadLink });
                                        })
                                        .catch(error => {
                                            console.error('Error inserting file:', error);
                                            reject(error);
                                        });

                                }).catch((err) => {
                                    form.emit('error', err);
                                })
                        }

                        file.end = function (cb) {
                            this._writeStream.on('finish', () => {
                                this.emit('end')
                                cb()
                            })
                            this._writeStream.end()
                        }

                    }
                })
                .catch(error => {
                    console.error('Error getting file by hash:', error);
                    reject(error);
                    return;
                });

        })
    })
}

module.exports = parseAndUpload;