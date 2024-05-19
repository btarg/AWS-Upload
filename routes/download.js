const express = require('express');
const router = express.Router();
require('dotenv').config();
const pool = require('../config/database');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const rateLimit = require("express-rate-limit");

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

    const key = `${file.guildid}/${file.userid}/${file.filename}`;
    console.log('Downloading file:', key);

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    };

    try {
        const command = new GetObjectCommand(params);
        // Expires in 15 mins, even if the url expires during download it will continue downloading
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        console.log("Signed S3 URL: " + signedUrl);
        res.redirect(signedUrl);
    } catch (error) {
        console.error('Error generating signed URL', error);
        if (!res.headersSent) {
            return res.status(500).send('Error generating signed URL');
        }
    }
});

module.exports = router;