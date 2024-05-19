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

const app = express();
const server = http.createServer(app);

(async () => {
    await initializeSocket(server);
})();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static(join(__dirname, 'frontend', 'dist')));

app.use('/auth', authRoutes);
app.use('/putfile', uploadRoutes);
app.use('/delete', deleteRoutes);
app.use('/download', downloadRoutes);
app.use('/list', listRoutes);
app.use('/discord', discordRoutes);
app.use('/config', configRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});