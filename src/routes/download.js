import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import rateLimit from "express-rate-limit";
import { getFriendlyFileType } from '../utils/fileutil.js';
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
        console.error(`Error generating signed URL for file ${file.fileid}:`, error);
        throw error; // re-throw the error so it can be handled by the caller
    }
}

router.get('/getType/:filename', limiter, async (req, res) => {
    try {
        const filename = req.params.filename;
        const fileType = await getFriendlyFileType(filename);
        res.status(200).json(fileType);
    } catch (error) {
        console.error('Error getting file type', error);
        if (!res.headersSent) {
            return res.status(500).send('Error getting file type');
        }
    }
});

router.get('/getURL/:id', limiter, async (req, res) => {
    try {
        const fileId = req.params.id;
        const signedUrl = await getS3URL(fileId);
        res.status(200).json(signedUrl);
    } catch (error) {
        console.error('Error generating signed URL', error);
        if (!res.headersSent) {
            return res.status(500).send('Error generating signed URL');
        }
    }
});

export default router;