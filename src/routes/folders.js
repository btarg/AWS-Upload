import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { getParentFolderNames, getAllFilesInFolder, getParentFolder } from '../services/fileService.js';
import { getAllFolders, getFolderById, getFolderWithSubfoldersAndFiles, getRootFolders, getSubFolders } from '../services/folderService.js';
import { checkAuthenticated } from './auth.js';
import cookieParser from 'cookie-parser';

const router = express.Router();
router.use(cookieParser(process.env.SESSION_SECRET));

const getUserIdFromRequest = (req) => {
    const dbUser = req.signedCookies.dbUser;
    return dbUser ? dbUser.id : null;
};

const fetchData = async (req, res, fetchFunction) => {
    const userId = getUserIdFromRequest(req);
    const data = userId ? await fetchFunction(userId) : null;
    res.json(data || {});
};

router.get('/root', checkAuthenticated, (req, res) => {
    fetchData(req, res, getRootFolders);
});

router.get('/all', checkAuthenticated, (req, res) => {
    fetchData(req, res, getAllFolders);
});

router.get('/get/:folderId', checkAuthenticated, async (req, res) => {
    const folderId = req.params.folderId;
    const userId = getUserIdFromRequest(req);
    let folder = null;
    if (userId) {
        folder = await getFolderWithSubfoldersAndFiles(folderId, userId);
    }
    
    res.json(folder) || {};
});

router.get('/getFiles/:folderId', checkAuthenticated, async (req, res) => {
    const folderId = req.params.folderId;
    const userId = getUserIdFromRequest(req);
    const files = userId ? await getAllFilesInFolder(folderId, userId) : null;
    res.json(files) || {};
});


router.get('/getParent/:folderId', checkAuthenticated, async (req, res) => {
    const folderId = req.params.folderId;
    const parent = await getParentFolder(folderId);
    res.json(parent) || {};
});

router.get('/getParentFromFile/:fileId', checkAuthenticated, async (req, res) => {
    const fileId = req.params.fileId;
    const folderNames = await getParentFolderNames(fileId);
    const folderNamesString = folderNames.join('/');
    res.json({ folderNamesString });
});

router.get('/getSubFolders/:folderId', checkAuthenticated, async (req, res) => {
    const folderId = req.params.folderId;
    const folders = await getSubFolders(folderId);
    res.json(folders);
});

export default router;