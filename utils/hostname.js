require('dotenv').config();

function getFullHostname(hostname) {
    // add http or https to the hostname dependent on env var for https
    if (process.env.HTTPS === 'true') {
        hostname = `https://${hostname}`;
    } else {
        hostname = `http://${hostname}`;
    }
    // add port to hostname if it is not 80
    if (process.env.PORT !== '80') {
        hostname = `${hostname}:${process.env.PORT || 3000}`;
    }
    return hostname;
}

module.exports = { getFullHostname };