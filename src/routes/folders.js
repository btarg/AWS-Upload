
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { getParentFolderNames, getAllFilesInFolder } from '../services/fileService.js';
import { getAllFolders } from '../services/folderService.js';
import { checkAuthenticated } from './auth.js';

import cookieParser from 'cookie-parser';
const router = express.Router();
router.use(cookieParser(process.env.SESSION_SECRET));

router.get('/all', checkAuthenticated, async (req, res) => {
    let folders = null;
    const dbUser = req.signedCookies.dbUser;
    if (dbUser) {
        const userId = dbUser.id;
        folders = await getAllFolders(userId);
    }
    res.json(folders);
});

router.get('/getFolder/:folderId', checkAuthenticated, async (req, res) => {
    const folderId = req.params.folderId;
    const files = await getAllFilesInFolder(folderId);
    res.json(files);
});

router.get('/getParentFromFile/:fileId', checkAuthenticated, async (req, res) => {
    const fileId = req.params.fileId;
    const folderNames = await getParentFolderNames(fileId);
    const folderNamesString = folderNames.join('/');
    res.json({ folderNamesString });
});

export default router;