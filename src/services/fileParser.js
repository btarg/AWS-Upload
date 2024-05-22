import dotenv from "dotenv";
import { accessKeyId, secretAccessKey, region, Bucket } from '../config/aws.js';
import formidable from 'formidable';
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { Transform } from 'stream';
import { emitFileUploaded } from '../services/fileService.js';
import { addBytes } from '../models/userModel.js';
import { insertFile } from '../models/fileModel.js';
import { generateId } from '../routes/linkgenerator.js';
import { getFullHostname } from '../utils/urls.js';
import { getIo } from '../config/socket.js';

dotenv.config();

export const parseAndUpload = async (req, dbUser, discordUserData) => {
    return new Promise(async (resolve, reject) => {
        let options = {
            maxFileSize: (process.env.MB_MAX || 100) * 1024 * 1024, //100 megabytes converted to bytes,
            allowEmptyFiles: false,
            hashAlgorithm: 'sha1'
        }

        const io = getIo();

        const fileHash = req.headers['filehash'];
        const fileSize = Number(req.headers['filesize']);
        const channelId = req.headers['channelid'];
        const isDM = req.headers['isdm'];

        const userId = discordUserData.id;

        const form = formidable(options);

        const hostname = getFullHostname(req.hostname);
        const fileId = generateId();

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

        let lastEmittedProgress = 0;

        form.on('progress', (bytesReceived, bytesExpected) => {
            const progressPercentage = Math.round(bytesReceived / bytesExpected * 100); // Calculate the progress as a percentage and round it to the nearest whole number

            if (progressPercentage !== lastEmittedProgress) {
                if (!io) {
                    console.error('Socket.io not initialized');
                } else {
                    // Emit a 'progress' event with the calculated progress
                    io.emit('uploadProgress', { progress: progressPercentage });
                    lastEmittedProgress = progressPercentage;
                }
            }
        });

        form.on('fileBegin', (formName, file) => {
            originalFilename = file.originalFilename;

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

                // calculate part size - 5MB minimum, 10,000 maximum parts allowed
                const fileSizeInMB = fileSize / (1024 * 1024);
                const partSize = Math.max(5, Math.ceil(fileSizeInMB / 10000)) * 1024 * 1024;

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
                        Key: `${userId}/${fileId}`,
                        Body: this._writeStream,
                        ContentDisposition: `inline; filename="${originalFilename}"`
                    },
                    tags: [], // optional tags
                    queueSize: 4, // optional concurrency configuration
                    partSize: partSize,
                    leavePartsOnError: false, // optional manually handle dropped parts
                }).done()
                    .then(data => {
                        form.emit('data', { name: "complete", value: data });

                        // add bytes to user
                        addBytes(userId, fileSize);

                        const expirationDate = dbUser.isPremium ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

                        insertFile(fileId, userId, originalFilename, fileHash, fileSize, new Date(), expirationDate)
                            .then(() => {
                                const downloadLink = `${hostname}/download/${fileId}`;

                                emitFileUploaded(channelId, discordUserData, isDM, file.originalFilename, fileSize, expirationDate, downloadLink);
                                console.log(`Finished uploading to AWS: ${file.originalFilename}, user ${userId}`);

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
