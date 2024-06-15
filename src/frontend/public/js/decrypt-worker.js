import AEAD from "./AEAD.js";

export async function handleDownload(url, ivString) {
  const response = await fetch(url);
  const encryptedData = await response.arrayBuffer();
  console.log("Got array buffer: " + encryptedData);

  // the IV is a comma separated string of numbers, convert it to a Uint8Array
  const ivArray = ivString.split(",").map(Number);
  const iv = new Uint8Array(ivArray);

  // Decrypt the data
  const aeadInstance = await AEAD.create("my-secret-key");
  const decryptedArrayBuffer = await aeadInstance.decrypt(iv, encryptedData);

  // Create a Blob from the decrypted ArrayBuffer
  const blob = new Blob([decryptedArrayBuffer], { type: "application/octet-stream" });

  // Create a download link and programmatically click it
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'decrypted_file';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}