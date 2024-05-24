import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from 'express';
import session from 'express-session';
import http from 'http';
import { initializeSocket } from './config/socket.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import deleteRoutes from './routes/delete.js';
import downloadRoutes from './routes/download.js';
import listRoutes from './routes/list.js';
import discordRoutes from './routes/discord.js';
import configRoutes from './routes/getconfig.js';
import { initializeDatabase } from './config/dbinit.js';
import { getFullHostname } from './utils/urls.js';

(async () => {
    dotenv.config();
    const app = express();
    const server = http.createServer(app);
    await initializeSocket(server);
    await initializeDatabase();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const isHttps = (process.env.HTTPS === 'true');
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: isHttps }
    }));

    app.use('/auth', authRoutes);
    app.use('/putfile', uploadRoutes);
    app.use('/delete', deleteRoutes);
    app.use('/download', downloadRoutes);
    app.use('/list', listRoutes);
    app.use('/discord', discordRoutes);
    app.use('/config', configRoutes);

    app.get('/banner', (req, res) => {
        res.sendFile(join(__dirname, 'banner.txt'));
    });

    app.use(express.static(join(__dirname, 'frontend', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'frontend', 'dist', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    const hostname = getFullHostname();
    server.listen(PORT, () => {
        console.log(`Server started at ${hostname}`);
    });

})();

