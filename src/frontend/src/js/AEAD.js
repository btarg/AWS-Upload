export default class AEAD {

    static KEY_LENGTH_IN_BYTES = 16;
    static IV_LENGTH_IN_BYTES = 16;
    static TAG_LENGTH_IN_BYTES = 16;

    static ALGORITH = 'AES-GCM';
    
    static secretKey;
    static tagLengthInBytes;

    constructor(secretKey, tagLengthInBytes = AEAD.TAG_LENGTH_IN_BYTES) {
        this.secretKey = secretKey;
        this.tagLengthInBytes = tagLengthInBytes;
    }

    static async getCryptoKeyFromRawKey(rawKey) {
        return crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: this.ALGORITHM, },
            true,
            ['encrypt', 'decrypt'],
        );
    }
    static async encrypt(iv, data) {
        return await crypto.subtle.encrypt({
            name: ALGORITHM,
            iv,
            tagLength: this.tagLengthInBytes * 8,
            secretKey: this.secretKey,
            data,
        });
    }

    static async decrypt(iv, data) {
        return await crypto.subtle.decrypt({
            name: ALGORITHM,
            iv,
            tagLength: this.tagLengthInBytes * 8,
            secretKey: this.secretKey,
            data,
        });
    }
}