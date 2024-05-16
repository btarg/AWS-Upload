const express = require('express');
const oauth = require('../config/oauth2');
const userService = require('../services/userService');
const userModel = require('../models/userModel');

const router = express.Router();
const cookieParser = require('cookie-parser');

// Use the cookie-parser middleware
router.use(cookieParser());

const discordScope = ["identify", "guilds", "email"];

// Middleware to check if the user is authenticated
const checkAuthenticated = async (req, res, next) => {
    const discordUser = req.cookies.discordUser;
    // console.log("Discord user:" + discordUser.id);
    if (discordUser) {
        try {
            const dbUser = await userService.getUser(discordUser.id);
            res.cookie('user', dbUser); // update the user cookie with the database user
            next(); // Proceed to the route handler
        } catch (error) {
            console.error('Error fetching user data', error);
            res.status(500).send('Error fetching user data');
        }
    } else {
        res.status(401).send('Not authenticated'); // Respond with an error
    }
};

router.get('/logout', (req, res) => {

    if (req.session) {
        req.session.user = null;
    }
    // remove cookie
    res.clearCookie('user');
    res.clearCookie('discordUser')
    res.clearCookie('refreshToken');

    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out', err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/');
        }
    });
});

router.post('/storeRedirect', (req, res) => {
    // Store the redirect URL in the session
    req.session.redirect = req.body.redirect;
    res.sendStatus(200);
});

router.get('/refresh', async (req, res) => {
    console.log("Refreshing token endpoint");

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        console.error('Refresh token not found');
        return res.status(400).send('Refresh token not found');
    }

    try {
        const newToken = await oauth.tokenRequest({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            refreshToken: refreshToken,
            grantType: 'refresh_token',
            scope: discordScope
        });

        req.session.accessToken = newToken.access_token;
        console.log("New refresh token:", newToken.refresh_token);
        res.cookie('refreshToken', newToken.refresh_token);

        const oauthDiscordUser = await oauth.getUser(newToken.access_token);
        res.cookie('discordUser', oauthDiscordUser);

        res.json({ accessToken: newToken.access_token });
    } catch (error) {
        console.error('Error during token refresh', error);
        res.status(500).send('Error during token refresh');
    }
});

router.get('/discord', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
    if (req.cookies.user && req.cookies.discordUser) {
        // If the user is already authenticated, redirect to the redirectUri
        res.redirect(redirectUri);
    } else {
        // If the user is not authenticated, redirect to the authorizeUrl
        const authorizeUrl = oauth.generateAuthUrl({
            scope: discordScope,
            responseType: "code",
            clientId: process.env.DISCORD_CLIENT_ID,
            redirectUri: redirectUri
        });
        res.redirect(authorizeUrl);
    }
});

router.get('/callback', async (req, res) => {
    const redirect = req.session.redirect || '/'; // Get the redirect URL from the session
    const code = req.query.code;
    try {
        const token = await oauth.tokenRequest({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            code: code,
            scope: "identify",
            grantType: "authorization_code",
            redirectUri: `${req.protocol}://${req.get('host')}/auth/callback`
        });
        const oauthDiscordUser = await oauth.getUser(token.access_token);
        req.session.accessToken = token.access_token;

        res.cookie('refreshToken', token.refresh_token);
        res.cookie('discordUser', oauthDiscordUser);

        // Save the user data to the database if they are not already present
        const existingUser = await userModel.getUserById(oauthDiscordUser.id);
        if (existingUser.id === undefined) {
            await userModel.upsertUserData(oauthDiscordUser.id, false, null, 0);
        }


        res.redirect(redirect); // Redirect to upload.html after successful login
    } catch (error) {
        console.error('Error during OAuth callback', error);
        // Removed the line that sends a response before redirecting
        res.redirect(redirect);
    }
});

router.get('/user', checkAuthenticated, (req, res) => {
    res.json(req.cookies.user);
});
router.get('/discordUser', checkAuthenticated, (req, res) => {
    res.json(req.cookies.discordUser);
});

module.exports = { router, checkAuthenticated };