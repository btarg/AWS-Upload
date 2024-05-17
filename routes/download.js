const express = require('express');
const router = express.Router();
require('dotenv').config();
const pool = require('../config/database');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createReadStream } = require('stream');

const s3Client = new S3Client({ region: process.env.S3_REGION });

router.get('/:id', async (req, res) => {
    const fileId = req.params.id;

    const result = await pool.query('SELECT * FROM files WHERE fileId = $1', [fileId]);
    console.log(result);

    if (!result || result.length === 0) {
        return res.status(404).send('File not found');
    }

    const file = result.rows[0];

    const key = `${file.guildid}/${file.userid}/${file.filename}`;
    console.log('Downloading file:', key);

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    };

    try {
        const command = new GetObjectCommand(params);
        const response = await s3Client.send(command);

        res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);

        response.Body.pipe(res); // Pipe the S3 object data directly to the response
    } catch (error) {
        console.error('Error downloading file', error);
        if (!res.headersSent) {
            return res.status(500).send('Error downloading file');
        }
    }
});

module.exports = router;