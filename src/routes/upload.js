const router = express.Router();
router.use(cookieParser());

import rateLimit from 'express-rate-limit';
import express from 'express';
import { parseAndUpload } from '../services/fileParser.js';
import { checkAuthenticated } from '../routes/auth.js';
import cookieParser from 'cookie-parser';
import { getFileByHash, emitFileUploaded } from '../services/fileService.js';
import { numberFromPSQL } from '../utils/conversions.js';
import { getFullHostname } from '../utils/urls.js';
import { getUserById } from '../models/userModel.js';

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 uploads every 15 minutes
    message: "Too many upload attempts from this IP, please try again after 15 minutes."
});

router.post('/', uploadLimiter, checkAuthenticated, async (req, res) => {
    // these are the same headers that will be passed to the parser
    const fileHash = req.headers['filehash'];
    const fileSize = Number(req.headers['filesize']);
    // const guildId = req.headers['guildid'];
    const channelId = req.headers['channelid'];
    const isDM = req.headers['isdm'];

    const hostname = getFullHostname(req.hostname);

    const discordUserData = req.cookies.serverDiscordUser;
    const userId = discordUserData.id;

    if (!userId) {
        return res.status(404).send("User not found");
    }
    let dbUser;
    try {
        dbUser = await getUserById(userId);
        if (!dbUser) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }
    } catch (error) {
        console.log("Error getting user: " + error);
        return res.status(500).send("Error getting user");
    }

    // Check if a file with the same hash already exists in this guild
    getFileByHash(fileHash)
        .then(async existingFile => {
            if (existingFile) {
                // If the file already exists, return the original copy
                const downloadLink = `${hostname}/download/${existingFile.fileid}`; // remember, no capitals here
                console.log("Existing download link: " + downloadLink);
                emitFileUploaded(channelId, discordUserData, isDM, existingFile.filename, fileSize, existingFile.expiresat, downloadLink);
                return res.status(200).json({ message: 'File already exists', downloadLink: downloadLink });
            }
            else {
                console.log("File does not already exist");
                var bytesUsed = numberFromPSQL(dbUser.bytesUsed);
                var bytesAllowed = numberFromPSQL(dbUser.bytesAllowed);
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
                    const data = await parseAndUpload(req, dbUser, discordUserData);
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