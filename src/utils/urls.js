import dotenv from 'dotenv';
import https from 'https';
dotenv.config();

export function getFullHostname(hostname = null) {
    if (!hostname) {
        hostname = process.env.HOSTNAME || 'localhost';
    }

    // add http or https to the hostname dependent on env var for https
    if (process.env.HTTPS === 'true') {
        hostname = `https://${hostname}`;
    } else {
        hostname = `http://${hostname}`;
    }
    // // add port to hostname if it is not 80
    // if (process.env.PORT !== '80') {
    //     hostname = `${hostname}:${process.env.PORT || 3000}`;
    // }
    return hostname;
}

export function isValidUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', (err) => {
            resolve(false);
        });
    });
}