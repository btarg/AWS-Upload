import express from 'express';
const router = express.Router();
import https from 'https';
import { checkAuthenticated } from "./auth.js";
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';

router.use(cookieParser(process.env.SESSION_SECRET));

router.get('/user', checkAuthenticated, (req, res) => {
    const options = {
        hostname: 'discord.com',
        path: '/api/users/@me',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + req.signedCookies.accessToken
        }
    };

    const request = https.request(options, response => {
        let data = '';

        response.on('data', chunk => {
            data += chunk;
        });

        response.on('end', () => {
            const body = JSON.parse(data);
            if (body.error) {
                throw new Error(body.error);
            }

            res.json(body);
        });
    });

    request.on('error', error => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch user info' });
    });

    request.end();
});

export default router;