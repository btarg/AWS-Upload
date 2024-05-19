require("dotenv").config();
const { accessKeyId, secretAccessKey, region, Bucket } = require('../config/aws');
const formidable = require('formidable');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, S3 } = require("@aws-sdk/client-s3");
const Transform = require('stream').Transform;
const fileService = require('../services/fileService');
const userModel = require('../models/userModel');
const fileModel = require('../models/fileModel');
const { isLinkValid, generateId } = require('../routes/linkgenerator');
const { getFullHostname } = require('../utils/hostname');
const { getIo } = require('../config/socket');
const io = getIo();

const parseAndUpload = async (req, user) => {
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
        const isDM = req.headers['isdm'];

        const userId = user.id;

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

            file.open = async function () {
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk);
                    }
                });

                this._writeStream.on('error', e => {
                    console.error('Error: ', e);
                    form.emit('error', e);
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

                        fileModel.insertFile(fileId, guildId, userId, originalFilename, fileHash, fileSize, new Date(), expirationDate)
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
        })
    })
}

module.exports = parseAndUpload;