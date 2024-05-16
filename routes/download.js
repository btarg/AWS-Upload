const express = require('express');
const router = express.Router();
const s3 = require('../config/s3');
require('dotenv').config();
const pool = require('../config/database');

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
        const s3Stream = s3.getObject(params).createReadStream();

        res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);

        s3Stream.on('error', function (err) {
            console.error('Error downloading file', err);
            if (!res.headersSent) {
                return res.status(500).send('Error downloading file');
            }
        });

        s3Stream.pipe(res);
    } catch (error) {
        console.error('Error downloading file', error);
        if (!res.headersSent) {
            return res.status(500).send('Error downloading file');
        }
    }
});

module.exports = router;