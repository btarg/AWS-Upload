export default class AEAD {

    static KEY_LENGTH_IN_BYTES = 32;
    static IV_LENGTH_IN_BYTES = 16;

    static secretKey;

    constructor(secretKey) {
        this.secretKey = secretKey;
    }

    static async create(secretKey) {
        const instance = new AEAD(secretKey);
        instance.secretKey = await instance.getCryptoKeyFromRawKey(secretKey);
        console.log("Created AEAD Instance with key " + secretKey);
        return instance;
    }

    bufferToHex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    async getHashedKey(rawKey) {
        const encoder = new TextEncoder();
        const data = encoder.encode(rawKey);
        const hash = await crypto.subtle.digest('SHA-256', data);
        console.log("Hashed key as string: " + this.bufferToHex(hash));
        return hash;
    }

    hexToBuffer(hex) {
        let buffer = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            buffer[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return buffer;
    }

    async getCryptoKeyFromRawKey(rawKey) {
        if (typeof (rawKey) != CryptoKey) {
            const hashedKey = await this.getHashedKey(rawKey);
            // Check if the key length is correct
            if (hashedKey.byteLength !== AEAD.KEY_LENGTH_IN_BYTES) {
                throw new Error(`Key length is incorrect. Expected ${AEAD.KEY_LENGTH_IN_BYTES} but got ${hashedKey.byteLength}`);
            }

            return crypto.subtle.importKey(
                'raw',
                hashedKey,
                { name: "AES-CBC", },
                true,
                ['encrypt', 'decrypt'],
            );
        } else {
            // already converted
            return rawKey;
        }
    }

    async encrypt(iv, data) {
        console.log("encrypting with IV: " + iv);
        return await crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: iv,
            },
            this.secretKey,
            data
        );
    }

    async decrypt(iv, data) {
        console.log("Type of encrypted file data: " + typeof data);
        if (!data) {
            console.error("No data");
            return;
        }

        // Check if data is not an instance of ArrayBuffer
        if (!(data instanceof ArrayBuffer)) {
            console.error("Data is not an ArrayBuffer");
            // Create a new ArrayBuffer and copy data over
            let buffer = new ArrayBuffer(data.byteLength);
            new Uint8Array(buffer).set(new Uint8Array(data));
            data = buffer;
        }
        const ivUint8Array = new Uint8Array(iv, 0, AEAD.IV_LENGTH_IN_BYTES);
        console.log("IV array: " + ivUint8Array);
        try {
            return await crypto.subtle.decrypt(
                {
                    name: "AES-CBC",
                    iv: ivUint8Array,
                },
                this.secretKey,
                data
            );
        } catch (error) {
            console.error("Decryption failed: " + error);
            throw error;
        }
    }
}