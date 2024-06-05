import AEAD from './AEAD.js';
import { getFileType } from './util.js';

export function encryptAndAssignHash(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                // first calculate the hash
                const arrayBuffer = event.target.result;
                const hashBuffer = await window.crypto.subtle.digest(
                    "SHA-1",
                    arrayBuffer
                );
                const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
                const fileHash = hashArray
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join(""); // convert bytes to hex string

                // then encrypt the file, using the array buffer
                const iv = crypto.getRandomValues(new Uint8Array(AEAD.IV_LENGTH_IN_BYTES));
                const aead = await AEAD.create("my-secret-key");

                let encrypted = await aead.encrypt(iv, arrayBuffer);
                
                const fileType = await getFileType(file.name);
                let encryptedFile = new Blob([encrypted], { type: fileType.mime });

                // apply the calculated hash as well as the size to the file object
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
                encryptedFile.iv = iv;
                resolve(encryptedFile);
            } catch (error) {
                console.error(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}