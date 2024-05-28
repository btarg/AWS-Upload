import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { checkAuthenticated } from './auth.js';
import dotenv from 'dotenv';
import { getAllRootFiles, getAllUserFiles, getFileById, getUserFileById } from '../services/fileService.js';
dotenv.config();

const router = express.Router();
router.use(cookieParser(process.env.SESSION_SECRET));

const getUserIdFromRequest = (req) => {
    const dbUser = req.signedCookies.dbUser;
    return dbUser ? dbUser.id : null;
};

const getFolders = async (req, res, fetchFunction) => {
    const userId = getUserIdFromRequest(req);
    const folders = userId ? await fetchFunction(userId) : null;
    res.json(folders || {});
};

router.get('/all', checkAuthenticated, (req, res) => {
    getFolders(req, res, getAllUserFiles);
});

router.get('/root', checkAuthenticated, (req, res) => {
    getFolders(req, res, getAllRootFiles);
});

router.get('/get/:id', checkAuthenticated, async (req, res) => {
    const fileId = req.params.id;
    const userId = getUserIdFromRequest(req);
    const file = userId ? await getUserFileById(fileId, userId) : null;
    res.json(file || {});
});

export default router;