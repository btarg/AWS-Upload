<template>
  <!-- ... -->
  <div id="dropzone" class="dropzone"></div>
  <!-- ... -->
</template>

<script>
import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";

export default {
  data() {
    return {
      dropzone: null,
    };
  },
  mounted() {
    this.dropzone = new Dropzone("#dropzone", {
      url: "/putfile",
      maxFilesize: process.env.MB_MAX / (1024 * 1024), // in MB
      maxFiles: 5, // Limit the number of files that can be dropped at once
      headers: {},
      autoProcessQueue: true,
      init: function () {
        this.on("addedfile", (file) => {
          // Calculate the file hash
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const hashBuffer = await window.crypto.subtle.digest(
              "SHA-1",
              arrayBuffer
            );
            const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
            const fileHash = hashArray
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(""); // convert bytes to hex string
            console.log(`Hash of file ${file.name}: ${fileHash}`);
            file.fileHash = fileHash;
            if (!isNaN(file.size)) {
              file.fileSize = file.size;
            } else {
              console.error(`Invalid file size for file ${file.name}`);
            }
            this.processFile(file); // Process the file after the hash has been calculated
          };
          reader.readAsArrayBuffer(file);
        });
        this.on("sending", (file, xhr, formData) => {
          xhr.setRequestHeader("filehash", file.fileHash);
          xhr.setRequestHeader("filesize", file.fileSize);
        });

        this.on("uploadprogress", (file, progress) => {
          // console.log('Upload progress:', progress);
        });
        this.on("success", (file, response) => {
          if (!response.error) {
            const downloadLink = response.downloadLink;
            console.log(`File uploaded successfully. Download link: ${downloadLink}`);
          } else {
            // alert the error
            console.log(response.error.message);
          }
        });
        this.on("queuecomplete", () => {
          console.log('All files have been uploaded.');
        });
        this.on("error", (file, errorMessage) => {
          console.log(`Error uploading file ${file.name}: ${errorMessage}`);
        });
      },
    });
  },
  beforeDestroy() {
    if (this.dropzone) {
      this.dropzone.destroy();
    }
  },
};
</script>