import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import deleteRoutes from './routes/delete.js';
import downloadRoutes from './routes/download.js';
import listRoutes from './routes/list.js';
import fileRoutes from './routes/files.js';
import folderRoutes from './routes/folders.js';
import discordRoutes from './routes/discord.js';
import configRoutes from './routes/getconfig.js';
import { initializeDatabase } from './config/dbinit.js';
import { getFullHostname } from './utils/urls.js';

(async () => {
    dotenv.config();
    const app = express();
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

    // API endpoints
    app.use('/api/auth', authRoutes);
    app.use('/api/discord', discordRoutes);
    app.use('/api/putfile', uploadRoutes);
    app.use('/api/download', downloadRoutes);
    app.use('/api/delete', deleteRoutes);
    app.use('/api/list', listRoutes);
    app.use('/api/files', fileRoutes);
    app.use('/api/folders', folderRoutes);
    app.use('/api/config', configRoutes);
    app.get('/api/banner', (req, res) => {
        res.sendFile(join(__dirname, 'banner.txt'));
    });
    

    app.use(express.static(join(__dirname, 'frontend', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'frontend', 'dist', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    const hostname = getFullHostname();
    app.listen(PORT, () => {
        console.log(`Server started at ${hostname}`);
    });

})();

