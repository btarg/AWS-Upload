export default class AEAD {

    static KEY_LENGTH_IN_BYTES = 16;
    static IV_LENGTH_IN_BYTES = 16;
    static TAG_LENGTH_IN_BYTES = 16;

    static ALGORITHM = 'AES-GCM';

    static secretKey;
    static tagLengthInBytes;

    constructor(secretKey, tagLengthInBytes = AEAD.TAG_LENGTH_IN_BYTES) {
        this.secretKey = secretKey;
        this.tagLengthInBytes = tagLengthInBytes;
    }

    static async create(secretKey, tagLengthInBytes = AEAD.TAG_LENGTH_IN_BYTES) {
        const instance = new AEAD(secretKey, tagLengthInBytes);
        instance.secretKey = await instance.getCryptoKeyFromRawKey(secretKey);
        return instance;
    }

    bufferToHex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    async getHashedKey(rawKey) {
        const encoder = new TextEncoder();
        const data = encoder.encode(rawKey);
        const hash = await window.crypto.subtle.digest('SHA-256', data);
        return this.bufferToHex(hash);
    }

    hexToBuffer(hex) {
        let buffer = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            buffer[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return buffer;
    }

    async getCryptoKeyFromRawKey(rawKey) {
        const hashedKey = await this.getHashedKey(rawKey);
        const buffer = this.hexToBuffer(hashedKey);
        return crypto.subtle.importKey(
            'raw',
            buffer,
            { name: AEAD.ALGORITHM, },
            true,
            ['encrypt', 'decrypt'],
        );
    }

    async encrypt(iv, data) {
        let encoder = new TextEncoder();
        let encodedIV = encoder.encode(iv);
        const key = await this.getCryptoKeyFromRawKey(this.secretKey);
        return await crypto.subtle.encrypt(
            {
                name: AEAD.ALGORITHM,
                iv: encodedIV,
                tagLength: this.tagLengthInBytes * 8,
            },
            key,
            data
        );
    }

    async decrypt(iv, data) {
        const key = await this.getCryptoKeyFromRawKey(this.secretKey);
        return await crypto.subtle.decrypt(
            {
                name: AEAD.ALGORITHM,
                iv: iv,
                tagLength: this.tagLengthInBytes * 8,
            },
            key,
            data
        );
    }
}