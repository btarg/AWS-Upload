import dotenv from 'dotenv';
dotenv.config();
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getFileById, deleteFileById } from '../services/fileService.js';
import { checkAuthenticated } from './auth.js';
import express from 'express';
const router = express.Router();
import cookieParser from 'cookie-parser';
import { b2Client } from '../config/backblaze.js';

import { deleteFolderAndContents } from '../models/folderModel.js';

router.use(cookieParser(process.env.SESSION_SECRET));

router.delete('/folder/:id', checkAuthenticated, async (req, res) => {
    const folderId = req.params.id;
    try {
        await deleteFolderAndContents(folderId);
        return res.status(200).send('Deleted folder: ' + folderId);
    } catch (error) {
        console.error('Error deleting folder from database', error);
        return res.status(500).json({  error: 'Error deleting folder from database' });
    }
    
});

router.delete('/file/:id', checkAuthenticated, async (req, res) => {
    const fileId = req.params.id;

    // Get the file record from the database
    const file = await getFileById(fileId);
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Check if the logged-in user is the owner of the file
    // (we use the user from the database and not discord user anymore)
    const currentUser = req.signedCookies.dbUser;
    if (currentUser.id !== file.userid) {
        return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    // Delete the file from S3
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileId
    };
    const command = new DeleteObjectCommand(params);
    try {
        await b2Client.send(command);
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