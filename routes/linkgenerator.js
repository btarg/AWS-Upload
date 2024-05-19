const crypto = require('crypto');
const { getFullHostname } = require('../utils/hostname');

// Function to generate a unique ID 11 characters url safe
function generateId() {
    return crypto.randomBytes(8).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

function createUploadLink(guildId, channelId, userId, isDM = false) {
    const hostname = getFullHostname(process.env.HOSTNAME || "localhost");
    return `${hostname}/?guild=${guildId}&channel=${channelId}&isDM=${isDM}`;
}

module.exports = { createUploadLink, generateId };