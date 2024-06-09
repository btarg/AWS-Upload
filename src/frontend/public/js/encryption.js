import AEAD from './AEAD.js';
import { getFileType } from './util.js';

export function encryptAndAssignHash(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const hashBuffer = await crypto.subtle.digest(
                    "SHA-1",
                    arrayBuffer
                );
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const fileHash = hashArray
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");

                const aeadInstance = await AEAD.create("my-secret-key");

                // Slice the file into chunks and encrypt each chunk
                const CHUNK_SIZE = 1024 * 1024; // 1MB
                let encryptedChunks = [];
                for (let i = 0; i < arrayBuffer.byteLength; i += CHUNK_SIZE) {
                    const chunk = arrayBuffer.slice(i, i + CHUNK_SIZE);

                    const iv = crypto.getRandomValues(new Uint8Array(AEAD.IV_LENGTH_IN_BYTES));
                    const encryptedChunk = await aeadInstance.encrypt(iv, chunk);

                    // Prepend the IV to the encrypted chunk
                    let ivBytes = new Uint8Array(iv);
                    let encryptedChunkBytes = new Uint8Array(encryptedChunk);

                    let ivAndEncryptedChunk = new Uint8Array(ivBytes.length + encryptedChunkBytes.length);
                    ivAndEncryptedChunk.set(ivBytes, 0);
                    ivAndEncryptedChunk.set(encryptedChunkBytes, ivBytes.length);

                    console.log(`Chunk ${i} has IV of ${ivBytes}`);
                    encryptedChunks.push(ivAndEncryptedChunk);
                }

                const fileType = await getFileType(file.name);
                let encryptedFile = new Blob(encryptedChunks, { type: fileType.mime });

                console.log(`Hash of file ${file.name}: ${fileHash}`);
                encryptedFile.filehash = fileHash;
                if (!isNaN(file.size)) {
                    encryptedFile.filesize = file.size;
                } else {
                    console.error(`Invalid file size for file ${file.name}`);
                    encryptedFile.filesize = 0;
                }
                encryptedFile.filename = file.name;
                encryptedFile.filetype = fileType;
                resolve(encryptedFile);
            } catch (error) {
                console.error(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}