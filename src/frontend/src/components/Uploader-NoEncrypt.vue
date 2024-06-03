<template>
  <div id="dropzone" class="dropzone"></div>
  <!-- upload button -->
  <button @click="dropzone.processQueue()" :disabled="uploading">Upload</button>
  <!-- text box for folder structure e.g. coolfiles/coolerfiles/ -->
  <input type="text" v-model="folder" placeholder="Folder structure" />
</template>

<script>
import { ref } from 'vue';
import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";

export default {
  props: {
    onComplete: {
      type: Function,
      default: () => { },
    },
  },
  setup() {
    const uploading = ref(false);
    return {
      uploading,
    };
  },
  data() {
    return {
      dropzone: null,
      maxFileSize: null,
      folder: '',
    };
  },
  async mounted() {
    const vm = this;
    const response = await fetch('/api/config');
    const config = await response.json();
    this.maxFileSize = config.maxFileSize / (1024 * 1024); // Convert to MB

    this.dropzone = new Dropzone("#dropzone", {
      url: "/api/upload",
      maxFilesize: process.env.MB_MAX / (1024 * 1024), // in MB
      maxFiles: 5, // Limit the number of files that can be dropped at once
      headers: {},
      autoProcessQueue: false,
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
          };
          reader.readAsArrayBuffer(file);
        });
        this.on("sending", (file, xhr, formData) => {
          vm.uploading = true;
          xhr.setRequestHeader("folder", vm.folder)
          xhr.setRequestHeader("filehash", file.fileHash);
          xhr.setRequestHeader("filesize", file.fileSize);
        });
        this.on("success", (file, response) => {
          if (!response.error) {
            const downloadLink = response.downloadLink;
            console.log(`${file.name} uploaded successfully. Download: ${downloadLink}`);
          } else {
            // alert the error
            console.log(response.error.message);
          }
          vm.uploading = false;
        });
        this.on("queuecomplete", () => {
          console.log('All files have been uploaded.');
          vm.uploading = false;
          vm.onComplete(false);
        });

        this.on("error", (file, errorMessage) => {
          console.log(`Error uploading file ${file.name}: ${JSON.stringify(errorMessage)}`);
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