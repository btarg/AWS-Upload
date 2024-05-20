import { randomBytes } from 'crypto';
import { getFullHostname } from '../utils/urls.js';

// Function to generate a unique ID 11 characters url safe
export function generateId() {
    return randomBytes(8).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

export function createUploadLink(guildId, channelId, userId, isDM = false) {
    const hostname = getFullHostname(process.env.HOSTNAME || "localhost");
    return `${hostname}/?guild=${guildId}&channel=${channelId}&isDM=${isDM}`;
}
