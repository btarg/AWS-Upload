import AEAD from './AEAD.js';
import { getFileType } from './util.js';

export async function encryptAndAssignHash(file, keyString, chunkSize = 1024 * 1024) { // default chunk size is 1MB
    let currentChunk = 0;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks = [];

    const aeadInstance = await AEAD.create(keyString);
    // Generate 16 byte IV
    let iv = crypto.getRandomValues(new Uint8Array(AEAD.IV_LENGTH_IN_BYTES));
    const initialIV = new Uint8Array(iv);

    for (currentChunk = 0; currentChunk < totalChunks; currentChunk++) {
        const blob = file.slice(currentChunk * chunkSize, (currentChunk + 1) * chunkSize);
        const arrayBuffer = await blob.arrayBuffer();

        console.log("Encrypting chunk", currentChunk + 1, "of", totalChunks);

        // Encrypt the chunk
        const encryptedArrayBuffer = await aeadInstance.encrypt(iv, arrayBuffer);
        const encryptedBytes = new Uint8Array(encryptedArrayBuffer);
        console.log("Encrypted " + encryptedBytes.length + " bytes");

        // Update the IV to the last block of the encrypted chunk
        iv = encryptedBytes.slice(-16);

        // Copy the encrypted data into the new array
        chunks.push(encryptedBytes);
    }

    // All chunks have been read and encrypted
    // Create a Blob with all the chunks
    let encryptedFile = new Blob(chunks);
    console.log("Encrypted file size:", encryptedFile.size);

    // Calculate the hash and file type of the final file blob
    const arrayBuffer = await encryptedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    console.log("File hash:", fileHash);
    const fileType = await getFileType(file.name);

    encryptedFile.filehash = fileHash;
    encryptedFile.filename = file.name;
    encryptedFile.filetype = fileType;
    encryptedFile.iv = initialIV;
    return encryptedFile;
}
