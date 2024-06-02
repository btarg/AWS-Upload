import AEAD from './AEAD.js';

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
                let encryptedFileObject = new Blob([encrypted], { type: file.type });

                // apply the calculated hash as well as the size to the file object
                console.log(`Hash of file ${file.name}: ${fileHash}`);
                encryptedFileObject.fileHash = fileHash;
                if (!isNaN(file.size)) {
                    encryptedFileObject.fileSize = file.size;
                } else {
                    console.error(`Invalid file size for file ${file.name}`);
                }
                // add the iv back to the object so we can retrieve it later
                encryptedFileObject.iv = iv;

                console.log("Encrypted file: " + encryptedFileObject);
                resolve(encryptedFileObject);
            } catch (error) {
                console.error(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}