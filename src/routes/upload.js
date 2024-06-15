import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
router.use(cookieParser(process.env.SESSION_SECRET));

import rateLimit from 'express-rate-limit';
import express from 'express';
import { checkAuthenticated, fetchUserData } from '../routes/auth.js';
import cookieParser from 'cookie-parser';
import { getFileById, emitFileUploaded } from '../services/fileService.js';
import { getFullHostname } from '../utils/urls.js';
import { getSubscriptionPlan } from '../config/subscriptions.js';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateId } from '../utils/linkgenerator.js';
import { deleteFile, insertFile } from '../models/fileModel.js';
import { addBytes } from '../models/userModel.js';
import { getOrCreateFolders } from '../services/folderService.js';

import { b2Client, Bucket } from '../config/backblaze.js';

const uploadLimiter = async (req, res, next) => {
    try {
        const currentUser = await fetchUserData(req);
        const userId = currentUser.id;
        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }
        const planName = currentUser.data.subscriptionPlan;
        console.log(`User id ${userId} has a subscription plan of ${planName}`)
        const subscriptionPlan = await getSubscriptionPlan(planName);
        const maxHourlyUploads = subscriptionPlan.maxHourlyUploads || 5;
        console.log(`User id ${userId} has a max hourly upload limit of ${maxHourlyUploads}`);
        rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: maxHourlyUploads,
            message: "Too many upload attempts from this IP, please try again after 15 minutes."
        })(req, res, next);
    } catch (error) {
        console.error("Upload limiter error: " + error.error);
        return res.status(500).json({ error: error });
    }
};

// Route to get a URL for uploading a file from S3
// it also inserts the file into the database
router.get('/getUrl', checkAuthenticated, uploadLimiter, async (req, res) => {
    const fileId = generateId();
    const dbUser = req.signedCookies.dbUser;
    if (!dbUser) {
        return res.status(404).json({ error: "User not found" });
    }
    const userId = dbUser.id;
    const fileName = req.headers['filename'] || "New File";
    const fileHash = req.headers['filehash'];
    const fileSize = Number(req.headers['filesize']);

    const params = {
        Bucket: Bucket,
        Key: fileId,
    }
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(b2Client, command, { expiresIn: 3600 });

    let isEncrypted = false;
    let fileIV = null;
    if (req.headers['encrypted']) {
        isEncrypted = true;
        fileIV = req.headers['iv'];
    }

    const folderString = req.headers['folder'];

    let folderId;
    try {
        folderId = await getOrCreateFolders(folderString, dbUser.id);
        console.log("Folder ID: " + folderId);
    } catch (error) {
        console.error('Error getting or creating folders: ' + error);
        return res.status(500).json({ error: 'Error getting or creating folders: ' + error });
    }

    const encryptionData = { encrypted: isEncrypted, iv: fileIV };
    const healthPoints = 72;

    const uploadDate = new Date();
    const hostname = getFullHostname(req.hostname);

    // insert file into database and give back the link to the user
    insertFile(fileId, userId, fileName, fileHash, fileSize, uploadDate, encryptionData, healthPoints, folderId)
        .then(async () => {
            // add bytes to user
            await addBytes(userId, fileSize);
            // get download link and emit
            const downloadLink = `${hostname}/download/${fileId}`;
            emitFileUploaded(dbUser, fileName, fileSize, encryptionData, downloadLink);
            return res.status(200).json({ fileId: fileId, uploadDate: uploadDate, signedUrl: signedUrl });
        })
        .catch(error => {
            console.log('Error inserting file: ' + error);
            // delete the file from the database when there is an error
            onError(fileId, req, res);
        });

});

async function onError(fileId, req, res) {

    console.log("Error uploading file to S3, deleting file from database " + fileId);

    const currentUser = await fetchUserData(req);

    if (!currentUser || !currentUser.id) {
        return res.status(404).json({ error: "DB User not found for error cleanup" });
    }
    const userId = currentUser.id;

    const file = await getFileById(fileId);
    if (!file) {
        return res.status(404).json({ error: "Upload error: requested file for deletion not found in database" });
    }
    if (file.userId !== userId) {
        return res.status(403).json({ error: "You do not have permission to delete this file" });
    }
    try {
        // delete the file in the database on error
        await deleteFile(fileId);
        await removeBytes(userId);
        return res.status(500).json({ error: "There was an error uploading the file, deleting from database." });

    } catch (error) {
        console.error("Error deleting file from database: " + error);
        return res.status(500).json({ error: "Error deleting file from database: " + error });
    }
}

router.get('/error/:fileId', checkAuthenticated, uploadLimiter, async (req, res) => {
    const fileId = req.params.fileId;
    return await onError(fileId, req, res);
});

export default router;