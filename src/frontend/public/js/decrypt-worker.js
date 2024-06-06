import AEAD from './AEAD.js';

self.onmessage = async (event) => {
  const { file, iv } = event.data;

  try {
    const aead = await AEAD.create("my-secret-key");
    const reader = new FileReader();
    const chunkSize = 1024; // size of chunks to read
    let start = 0;

    let decryptedChunks = [];
    reader.onload = async function() {
      const arrayBuffer = reader.result;
      const decryptedChunk = await aead.decrypt(iv, new Uint8Array(arrayBuffer));
      decryptedChunks.push(decryptedChunk);

      if (start < file.size) {
        readNextChunk();
      } else {
        self.postMessage(decryptedChunks);
      }
    };

    function readNextChunk() {
      const end = start + chunkSize;
      const slice = file.slice(start, end);
      reader.readAsArrayBuffer(slice);
      start = end;
    }

    readNextChunk();
  } catch (error) {
    console.error('Error in worker:', error.message);
    console.error('Stack trace:', error.stack);
  }
};