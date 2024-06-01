import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
router.use(cookieParser(process.env.SESSION_SECRET));

import rateLimit from 'express-rate-limit';
import express from 'express';
import { parseAndUpload } from '../services/fileParser.js';
import { checkAuthenticated, fetchUserData } from '../routes/auth.js';
import cookieParser from 'cookie-parser';
import { getFileByHash, emitFileUploaded } from '../services/fileService.js';
import { getFullHostname } from '../utils/urls.js';
import { getSubscriptionPlan } from '../config/subscriptions.js';

const uploadLimiter = async (req, res, next) => {
    try {
        const currentUser = await fetchUserData(req);
        const userId = currentUser.id;
        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }
        const planName = currentUser.data.subscriptionPlan;
        console.log(`User id ${userId} has a subscription plan of ${planName}`)
        const subscriptionPlan = getSubscriptionPlan(planName);
        const maxHourlyUploads = subscriptionPlan.maxHourlyUploads || 5;
        console.log(`User id ${userId} has a max hourly upload limit of ${maxHourlyUploads}`);
        rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: maxHourlyUploads,
            message: "Too many upload attempts from this IP, please try again after 15 minutes."
        })(req, res, next);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send(req.body);
    }
};

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

                try {
                    const data = await parseAndUpload(req);
                    // pass the data directly on success. the json should include downloadLink
                    return res.status(200).json(data);
                } catch (error) {
                    console.log(error);
                    return res.status(error.statusCode || 500).json({
                        message: "An error occurred.",
                        error
                    });
                }

            }

        })
        .catch(error => {
            console.error('Error getting file by hash:', error);
            return res.status(500).send(error);
        });


});

export default router;