import express from 'express';
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config();

router.get('/', (req, res) => {
    res.json({
        maxFileSize: process.env.MB_MAX || 10000,
        minFileSize: process.env.MB_MIN || 8,
    });
});

export default router;