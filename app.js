const path = require('path');

const express = require('express');
const session = require('express-session');
const http = require('http');
const app = express();
const server = http.createServer(app);

// Make sure the socket.io socket is set up
const { initializeSocket } = require('./config/socket');
(async () => {
    await initializeSocket(server);
})();

const dotenv = require('dotenv');
const { router: authRoutes } = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const deleteRoutes = require('./routes/delete');
const downloadRoutes = require('./routes/download');
const listRoutes = require('./routes/list');
const discordRoutes = require('./routes/discord');
const { router: newRoutes } = require('./routes/linkgenerator');
const configRoutes = require('./routes/getconfig');

// db init
const { initializeDatabase } = require('./config/dbinit');
initializeDatabase();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, // replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if your app is on https
}));


app.use(express.static(path.join(__dirname, 'frontend', 'dist')));


app.use('/auth', authRoutes);
app.use('/putfile', uploadRoutes);
app.use('/delete', deleteRoutes);
app.use('/download', downloadRoutes);
app.use('/list', listRoutes);
app.use('/discord', discordRoutes);
app.use('/new', newRoutes);
app.use('/config', configRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});