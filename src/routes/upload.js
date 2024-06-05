import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
router.use(cookieParser(process.env.SESSION_SECRET));

import rateLimit from 'express-rate-limit';
import express from 'express';
import { parseAndUpload } from '../services/fileParser.js';
import { checkAuthenticated, fetchUserData } from '../routes/auth.js';
import cookieParser from 'cookie-parser';
import { getFileByHash, getFileById, emitFileUploaded } from '../services/fileService.js';
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
        console.error("Upload error: " + error.error);
        return res.status(500).send(req.body);
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
        // ContentType: 'application/octet-stream',
        // ContentDisposition: `inline; filename="${fileName}"`
    }
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(b2Client, command, { expiresIn: 3600 });

    let isEncrypted = false;
    let fileIV = null;
    if (req.headers['encrypted']) {
        isEncrypted = true;
        fileIV = req.headers['iv'];
    }

    const hostname = getFullHostname(req.hostname);
    const folderString = req.headers['folder'];

    let folderId;
    try {
        folderId = await getOrCreateFolders(folderString, dbUser.id);
        console.log("Folder ID: " + folderId);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting or creating folders: ' + error });
    }

    // add bytes to user
    await addBytes(userId, fileSize);

    const encryptionData = { encrypted: isEncrypted, iv: fileIV };
    const healthPoints = 72;

    const uploadDate = new Date();

    // insert file into database and give back the link to the user
    insertFile(fileId, userId, fileName, fileHash, fileSize, uploadDate, encryptionData, healthPoints, folderId)
        .then(() => {
            const downloadLink = `${hostname}/download/${fileId}`;
            emitFileUploaded(dbUser, fileName, fileSize, encryptionData, downloadLink);
            return res.status(200).json({ fileId: fileId, uploadDate: uploadDate, signedUrl: signedUrl });
        })
        .catch(error => {
            console.error('Error inserting file:', error);
            return res.status(500).json({ error: "Error inserting file" });
        });

});

router.get('/error/:fileId', checkAuthenticated, uploadLimiter, async (req, res) => {
    const fileId = req.params.fileId;
    console.log("Error uploading file to S3, deleting file from database " + fileId);

    const currentUser = await fetchUserData(req);
    const userId = currentUser.id;
    if (!userId) {
        return res.status(404).json({ error: "User not found" });
    }

    const file = await getFileById(fileId);
    if (file.userId !== userId) {
        return res.status(403).json({ error: "You do not have permission to access this file" });
    }
    // delete the file in the database on error
    await deleteFile(fileId);
    await removeBytes(userId);
});

router.post('/', checkAuthenticated, uploadLimiter, async (req, res) => {
    // these are the same headers that will be passed to the parser
    const fileHash = req.headers['filehash'];
    const fileSize = Number(req.headers['filesize']);

    const hostname = getFullHostname(req.hostname);
    const dbUser = await fetchUserData(req);

    // Check if a file with the same hash already exists in this guild
    getFileByHash(fileHash)
        .then(async existingFile => {
            if (existingFile) {
                // If the file already exists, return the original copy
                const downloadLink = `${hostname}/api/download/${existingFile.fileid}`; // remember, no capitals here
                console.log("Existing download link: " + downloadLink);
                emitFileUploaded(dbUser, existingFile.filename, fileSize, existingFile.expiresat, downloadLink);
                return res.status(200).json({ message: 'File already exists', downloadLink: downloadLink });
            }
            else {
                console.log("File does not already exist");

                console.log(dbUser);
                console.log(dbUser.data);

                var bytesUsed = dbUser.data.bytesUsed;
                var bytesAllowed = dbUser.data.bytesAllowed;
                const bytesAboutToBeUsed = bytesUsed + fileSize;

                console.log("FILE SIZE IS " + fileSize);
                console.log("BYTES USED IS " + bytesUsed);
                console.log("BYTES ALLOWED IS " + bytesAllowed);

                console.log("Bytes used plus file size: " + bytesAboutToBeUsed);
                if (bytesAboutToBeUsed >= bytesAllowed) {
                    console.log("User exceeded storage limit");
                    return res.status(403).send("User has exceeded their storage limit");
                }

                const data = await parseAndUpload(req);
                // pass the data directly on success. the json should include downloadLink
                return res.status(200).json(data);

            }

        })
        .catch(error => {
            console.error('Error getting file by hash:', error);
            return res.status(500).send(error);
        });


});

export default router;