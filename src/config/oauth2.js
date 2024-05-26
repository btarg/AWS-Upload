import OAuth2 from 'discord-oauth2';

export const oauth = new OAuth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/api/auth/callback',
});
