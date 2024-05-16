const OAuth2 = require('discord-oauth2');

const oauth = new OAuth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/callback',
});

module.exports = oauth;