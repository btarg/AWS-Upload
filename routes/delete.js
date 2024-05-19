import dotenv from 'dotenv';
dotenv.config();
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getFileById, deleteFileById } from '../services/fileService.js';
import { checkAuthenticated } from './auth.js';
import express from 'express';
const router = express.Router();
import cookieParser from 'cookie-parser';
router.use(cookieParser());

const s3Client = new S3Client({ region: process.env.S3_REGION });

router.delete('/:id', checkAuthenticated, async (req, res) => {
    const fileId = req.params.id;

    // Get the file record from the database
    const file = await getFileById(fileId);
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
        await deleteFileById(fileId);
    } catch (error) {
        console.error('Error deleting file record from database', error);
        return res.status(500).send('Error deleting file record from database');
    }

    res.status(200).send('File deleted successfully');
});

export default router;