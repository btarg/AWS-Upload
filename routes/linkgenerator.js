// link generator
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getFullHostname } = require('../utils/hostname');

const { checkAuthenticated } = require('./auth');

// In-memory map to store associations
const linkMap = new Map();

// Function to generate a unique ID 11 characters url safe
function generateId() {
    return crypto.randomBytes(8).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

function createUploadLink(guildId, channelId, userId, isDM = false) {
    return new Promise((resolve, reject) => {
        const id = generateId();
        linkMap.set(id, { guildId, channelId, userId, isDM });
        // Invalidate the link after 60 minutes
        setTimeout(() => {
            invalidateLink(id);
        }, 60 * 60 * 1000);
        const hostname = getFullHostname(process.env.HOSTNAME || "localhost")

        resolve(`${hostname}/new/${id}`);
    });
}

// Route handler to invalidate the link
router.get('/invalidate/:linkId', checkAuthenticated, (req, res) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    const id = req.params.linkId;
    invalidateLink(id);
    res.status(200).send('Link invalidated');
});

// Route handler for the generated link
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const data = getDataFromLinkMap(id);
    if (!data) {
        return res.status(404).send('Link not found or expired');
    }
    // set a session variable to store the id
    req.session.linkId = id;

    // Redirect to the upload page with the appropriate parameters
    // isDM means that the channel is actually a user id
    res.redirect(`/?guild=${data.guildId}&channel=${data.channelId}&isDM=${data.isDM}`);
});

function isLinkValid(id) {
    return linkMap.has(id);
}
function getDataFromLinkMap(id) {
    return linkMap.get(id);
}
// invalidate link function
function invalidateLink(id) {
    linkMap.delete(id);
}

// export router
module.exports = { router, createUploadLink, invalidateLink, getDataFromLinkMap, isLinkValid, generateId };