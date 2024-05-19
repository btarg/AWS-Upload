const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fileService = require('../services/fileService');
const { checkAuthenticated } = require('./auth');


require('dotenv').config();

const s3Client = new S3Client({ region: process.env.S3_REGION });

router.delete('/:id', checkAuthenticated, async (req, res) => {
    const fileId = req.params.id;

    // Get the file record from the database
    const file = await fileService.getFileById(fileId);
    if (!file) {
        return res.status(404).send('File not found');
    }

    // Check if the logged-in user is the owner of the file
    const discordUser = req.cookies.serverDiscordUser;
    if (discordUser.id !== file.userid) {
        return res.status(403).send('Not authorized to delete this file');
    }

    // Delete the file from S3
    const key = `${file.guildid}/${file.userid}/${file.fileid}`;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    };
    const command = new DeleteObjectCommand(params);
    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting file from S3', error);
        return res.status(500).send('Error deleting file from S3');
    }

    // Delete the file record from the database
    try {
        await fileService.deleteFile(fileId);
    } catch (error) {
        console.error('Error deleting file record from database', error);
        return res.status(500).send('Error deleting file record from database');
    }

    res.status(200).send('File deleted successfully');
});

module.exports = router;