import express from 'express';
import { oauth } from '../config/oauth2.js';
import { getUserById, upsertUserData } from '../models/userModel.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.use(cookieParser(process.env.SESSION_SECRET));

const discordScope = ["identify", "guilds", "email"];

// Middleware to check if the user is authenticated with discord
export const checkAuthenticated = async (req, res, next) => {
    try {
        const discordUser = req.signedCookies.serverDiscordUser;
        if (discordUser && discordUser.id) {
            next();
        } else {
            // don't "throw" here, just send a response
            res.status(401).send('Not authenticated');
            return;
        }
    } catch (error) {
        console.error('Error checking authentication', error);
        res.status(401).send('Not authenticated'); // Respond with an error
    }
};

router.get('/logout', (req, res) => {

    // remove cookies including serverside ones
    res.clearCookie('user');
    res.clearCookie('discordUser')
    res.clearCookie('serverUser');
    res.clearCookie('serverDiscordUser')

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

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

router.get('/refresh', checkAuthenticated, async (req, res) => {
    console.log("Refreshing token endpoint");

    const refreshToken = req.signedCookies.refreshToken;
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

        //req.session.accessToken = newToken.access_token;
        console.log("New refresh token:", newToken.refresh_token);
        res.cookie('refreshToken', newToken.refresh_token, { httpOnly: true, signed: true });
        res.cookie('accessToken', newToken.access_token, { httpOnly: true, signed: true });

        const oauthDiscordUser = await oauth.getUser(newToken.access_token);
        res.cookie('serverDiscordUser', oauthDiscordUser, { httpOnly: true, signed: true });
        res.cookie('discordUser', oauthDiscordUser, { httpOnly: false, signed: true });

        res.json({ accessToken: newToken.access_token });
    } catch (error) {
        console.error('Error during token refresh', error);
        res.status(500).send('Error during token refresh');
    }
});

router.get('/login', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
    if (req.signedCookies.serverUser && req.signedCookies.serverDiscordUser) {
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
        // if user is not verified then throw an error and stop trying to log in.
        // go back to the homepage
        if (!oauthDiscordUser.verified) {
            throw new Error("User is not verified");
        }
        //req.session.accessToken = token.access_token;
        res.cookie('serverDiscordUser', oauthDiscordUser, { httpOnly: true, signed: true });
        res.cookie('discordUser', oauthDiscordUser);

        res.cookie('refreshToken', token.refresh_token, { httpOnly: true, signed: true });
        res.cookie('accessToken', token.access_token, { httpOnly: true, signed: true });

        // Save the user data to the database if they are not already present
        const existingUser = await getUserById(oauthDiscordUser.id);
        if (existingUser.id === undefined) {
            await upsertUserData(oauthDiscordUser.id, false, null, 0);
        }

        // Redirect to the previous page which is saved in session
        res.redirect(redirect);
    } catch (error) {
        console.error('Error during OAuth callback', error);
        // Removed the line that sends a response before redirecting
        res.redirect(redirect);
    }
});

router.get('/user', checkAuthenticated, async (req, res) => {
    try {
        const discordUser = req.signedCookies.serverDiscordUser;
        const dbUser = await getUserById(discordUser.id);
        // if we have a valid discord user but no db entry, create a db entry (edgecase)
        if (dbUser.id === undefined && discordUser.id) {
            console.log('Discord user detected but no DB record. Creating user in database');
            await upsertUserData(discordUser.id, false, null, 0);
        }
        res.cookie('user', dbUser, { httpOnly: false, signed: true }); // update the user cookie with the database user
        res.cookie('serverUser', dbUser, { httpOnly: true, signed: true });
        res.json(dbUser);
    } catch (error) {
        console.error('Error fetching user data', error);
        res.status(500).send('Error fetching user data');
    }
});
router.get('/discordUser', checkAuthenticated, (req, res) => {
    res.json(req.signedCookies.serverDiscordUser);
});

export default router;