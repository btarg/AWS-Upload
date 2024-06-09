import AEAD from "./AEAD.js";

class ProgressStream extends TransformStream {
  constructor({ start, progress, end } = {}, AEADInstance, writableStrategy) {
    super({
      start() { start?.(); },
      transform(chunk, controller) {
        console.log('Transform called');
        const chunkArrayBuffer = chunk instanceof Uint8Array ? chunk.buffer : chunk;

        // Define the sizes of the IV and encrypted data
        const ivLength = AEAD.IV_LENGTH_IN_BYTES;
        const encryptedDataLength = chunkArrayBuffer.byteLength - ivLength; // Adjust for actual chunk size

        // Extract the IV from the start of the chunk
        const iv = new Uint8Array(chunkArrayBuffer, 0, ivLength);
        console.log("IV: ", iv);

        // Extract the actual encrypted data
        const actualEncryptedChunk = new Uint8Array(chunkArrayBuffer, ivLength, encryptedDataLength);
        console.log(actualEncryptedChunk);

        // // Decrypt the encrypted data
        // AEADInstance.decrypt(iv, actualEncryptedChunk)
        //   .then(decryptedChunk => {
        //     controller.enqueue(new Uint8Array(decryptedChunk));
        //     progress?.(decryptedChunk.byteLength);
        //   })
        //   .catch(error => {
        //     console.error("Chunk error: ", error);
        //     controller.error(error);
        //   });

        // debug: give back encrypted file
        // Create a new Uint8Array with the size of the IV and the actual encrypted chunk
        const encryptedFile = new Uint8Array(ivLength + encryptedDataLength);
        // Copy the IV and the actual encrypted chunk into the new array
        encryptedFile.set(iv);
        encryptedFile.set(actualEncryptedChunk, ivLength);

        controller.enqueue(encryptedFile);
        progress?.(encryptedFile.byteLength);
        
      },
      flush() { end?.(); },
    }, writableStrategy, AEADInstance);
  }
}



async function getFileHandle() {
  const opts = {
    suggestedName: 'input.txt',
    types: [{
      description: 'Text file',
      accept: { 'text/plain': ['.txt'] },
    }],
  };
  return window.showSaveFilePicker(opts);
}

// Determine whether or not permission to write is granted
async function getWritePermission(fsFileHandle) {
  const writeMode = { mode: 'readwrite' };
  if (await fsFileHandle.queryPermission(writeMode) === 'granted') return true;
  if (await fsFileHandle.requestPermission(writeMode) === 'granted') return true;
  return false;
}

let fsFileHandle;
export async function handleDownload(downloadUrl) {
  const AEADInstance = await AEAD.create("my-secret-key");
  if (!AEADInstance) {
    throw new Error("No AEAD instance!");
  }
  if (!fsFileHandle) {
    try { fsFileHandle = await getFileHandle(); }
    catch (exception) {
      throw exception;
    }
  }

  if (!await getWritePermission(fsFileHandle)) {
    throw new Error('File write permission not granted');
  }

  // get file response from URL
  const response = await fetch(downloadUrl);
  const fsWritableStream = await fsFileHandle.createWritable();

  const writableStrategy = {
  highWaterMark: 10,
  size(chunk) {
    return chunk.byteLength;
  }
};

  await response.body
    .pipeThrough(new ProgressStream({
      start: () => console.log('Download starting'),
      progress: (byteLength) => console.log(`Downloaded ${byteLength} bytes`),
      end: () => console.log('Download finished'),
    }, AEADInstance, writableStrategy))
    .pipeTo(fsWritableStream); // Will automatically close when stream ends

  console.log('Done');
}