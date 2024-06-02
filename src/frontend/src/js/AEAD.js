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

    async getCryptoKeyFromRawKey(rawKey) {
        let encoder = new TextEncoder();
        let encodedKey = encoder.encode(rawKey);
        return crypto.subtle.importKey(
            'raw',
            encodedKey,
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