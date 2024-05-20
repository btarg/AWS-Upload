import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import rateLimit from "express-rate-limit";

import { getFriendlyFileType, getThumbnailUrl } from '../utils/files.js';

const s3Client = new S3Client({ region: process.env.S3_REGION });

// Enable rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit each IP to 1 download per minute
    message: "Too many requests, please try again later."
});

router.get('/:id', limiter, async (req, res) => {
    const fileId = req.params.id;

    const result = await pool.query('SELECT * FROM files WHERE fileId = $1', [fileId]);
    console.log(result);
    const file = result.rows[0];

    if (!file || result.length === 0) {
        return res.status(404).send('File not found');
    }

    const s3key = `${file.userid}/${file.fileid}`;
    console.log('Downloading file:', s3key);

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3key
    };

    try {
        const command = new GetObjectCommand(params);

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        console.log("Signed S3 URL: " + signedUrl);

        const friendlyFileType = getFriendlyFileType(file.filename);
        const thumbnail = await getThumbnailUrl(file.filename);

        // Create an HTML response with OpenGraph meta tags
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${file.filename}</title>
                <meta property="og:title" content="${file.filename}" />
                <meta property="og:description" content="File size: ${file.size}, File type: ${friendlyFileType}" />
                <meta property="og:url" content="${signedUrl}" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="${thumbnail}" />
                <meta http-equiv="refresh" content="0; url=${signedUrl}" />
            </head>
            <body>
                <h1>${file.filename}</h1>
                <p>File size: ${file.size}</p>
                <p>File type: ${friendlyFileType}</p>
                <a href="${signedUrl}">Download file</a>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error generating signed URL', error);
        if (!res.headersSent) {
            return res.status(500).send('Error generating signed URL');
        }
    }
});

export default router;