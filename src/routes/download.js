// TODO: redo as a vuejs page with decryption options and better embed support

import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import rateLimit from "express-rate-limit";

import { getFileById } from '../services/fileService.js';
import { getFriendlyFileType, getThumbnailUrl } from '../utils/fileutil.js';
import { b2Client, Bucket } from '../config/backblaze.js';

const urlCache = new Map();

// Enable rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit each IP to 1 download per minute
    message: "Too many requests, please try again later."
});

export async function getS3URL(fileId, expiresInSeconds = 7200) {
    try {
        const command = new GetObjectCommand({
            Bucket: Bucket,
            Key: fileId
        });

        let signedUrl = urlCache.get(fileId);
        if (!signedUrl) {
            console.log(`URL for file ${fileId} not in cache, generating new link`);
            signedUrl = await getSignedUrl(b2Client, command, { expiresIn: expiresInSeconds });
            urlCache.set(fileId, signedUrl);

            // Automatically remove the URL from the cache just before it expires
            setTimeout(() => {
                urlCache.delete(fileId);
            }, (expiresInSeconds - 10) * 1000); // convert it to milliseconds for timeout
        } else {
            console.log(`Using cached URL for ${fileId}`);
        }
        return signedUrl;
    } catch (error) {
        console.error(`Error generating signed URL for file ${file.id}:`, error);
        throw error; // re-throw the error so it can be handled by the caller
    }
}

router.get('/:id', limiter, async (req, res) => {

    try {
        const fileId = req.params.id;
        const file = await getFileById(fileId);
        const signedUrl = await getS3URL(fileId);
        const friendlyFileType = await getFriendlyFileType(file.filename);
        const thumbnail = await getThumbnailUrl(file.filename);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${file.filename}</title>
                <meta property="og:title" content="${file.filename}" />
                <meta property="og:site_name" content="${process.env.SITE_NAME}">
                <meta property="og:description" content="File size: ${file.filesize}, File type: ${friendlyFileType.friendlyName}" />
                <meta property="og:url" content="${signedUrl}" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="${thumbnail}" />
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="${file.filename}">
                <meta name="twitter:description" content="File size: ${file.filesize}, File type: ${friendlyFileType.friendlyName}">
                <meta name="twitter:image" content="${thumbnail}">
                <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
                <style>
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    #my-video {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                ${friendlyFileType.mime.startsWith('video/')
                ? `<video id="my-video" class="video-js" controls preload="auto" data-setup="{}"><source src="${signedUrl}" type="${friendlyFileType.mime}">Your browser does not support the video tag.</video><script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script><script>var player = videojs('my-video');</script>`
                : `<embed src="${signedUrl}" type="${friendlyFileType.mime}" width="500" height="500">`}
            </body>
            </html>
        `;

        res.status(200).contentType('text/html').send(html);
    } catch (error) {
        console.error('Error generating signed URL', error);
        if (!res.headersSent) {
            return res.status(500).send('Error generating signed URL');
        }
    }
});

export default router;