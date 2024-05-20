import express from 'express';
const router = express.Router();
import https from 'https';
import { client } from '../services/discordbot.js';
import { checkAuthenticated } from "./auth.js";

import cookieParser from 'cookie-parser';

router.use(cookieParser());

router.get('/guilds', checkAuthenticated, (req, res) => {
    if (!req.session || !req.session.accessToken) {
        console.error('/guilds: Not authenticated');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const options = {
        hostname: 'discord.com',
        path: '/api/users/@me/guilds',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + req.session.accessToken
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

            // Filter the guilds by only ones that the bot is a member of
            const botGuilds = body.filter(guild => client.guilds.cache.has(guild.id));

            res.json(botGuilds);
        });
    });

    request.on('error', error => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    });

    request.end();
});

router.get('/user', checkAuthenticated, (req, res) => {
    const options = {
        hostname: 'discord.com',
        path: '/api/users/@me',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + req.session.accessToken
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