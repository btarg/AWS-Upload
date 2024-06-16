import AEAD from "./AEAD.js";

export async function handleDownload(fetchUrl, ivString, keyString) {
  console.log("Fetching URL: " + fetchUrl);
  const response = await fetch(fetchUrl);

  // Convert IV string to Uint8Array
  const ivArray = ivString.split(",").map(Number);
  let iv = new Uint8Array(ivArray);

  // Decrypt the data
  const aeadInstance = await AEAD.create(keyString);

  const decryptedStream = new ReadableStream({
    start(controller) {
      const reader = response.body.getReader();
      let previousChunk = new Uint8Array();

      return pump();

      async function pump() {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        // Concatenate previous chunk's last block and current chunk's value
        const combinedChunk = new Uint8Array(previousChunk.length + value.length);
        combinedChunk.set(previousChunk);
        combinedChunk.set(value, previousChunk.length);

        // Decrypt the current chunk using the current IV
        const decryptedArrayBuffer = await aeadInstance.decrypt(iv, combinedChunk.buffer);
        const decryptedChunk = new Uint8Array(decryptedArrayBuffer);

        // Enqueue the decrypted chunk
        controller.enqueue(decryptedChunk);

        // Update the IV to the last block of the current chunk
        iv = combinedChunk.slice(-16);
        previousChunk = value;

        return pump();
      }
    }
  });

  // Create a new response out of the stream
  const responseFromDecryptedStream = new Response(decryptedStream);
  // Create a Blob from the decrypted ReadableStream
  const blob = await responseFromDecryptedStream.blob();
  // Create an object URL for the blob
  const downloadUrl = URL.createObjectURL(blob);

  // Create a download link and programmatically click it
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'decrypted_file';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
