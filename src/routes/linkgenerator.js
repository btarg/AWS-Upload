import { randomBytes } from 'crypto';

// Function to generate a unique ID 11 characters url safe
export function generateId() {
    return randomBytes(8).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/&/g, '')
        .replace(/\?/g, '')
        .replace(/=/g, '');
}