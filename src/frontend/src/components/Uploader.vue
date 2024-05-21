<template>
  <div class="Uploader">
    <div class="mx-auto max-w-2xl rounded-lg bg-gray-800 p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-semibold text-white">Upload Files</h2>

      <!-- Drag and Drop Upload Box -->
      <div v-if="!isUploading" id="dropbox"
        class="dropbox mb-4 flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-700 text-center"
        @click="open" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop($event)" ref="dropZoneRef">
        <div class="text-gray-400">
          <i class="fas fa-cloud-upload-alt fa-3x mb-2"></i>
          <p>Drag & Drop your files here or click to upload</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="isUploading && isUploading.value === true" class="mb-1 flex justify-between">
        <span class="text-base font-medium text-blue-700 dark:text-white">Upload progress</span>
        <span class="text-sm font-medium text-blue-700 dark:text-white">{{ uploadProgress }}%</span>
      </div>
      <div v-if="isUploading && isUploading.value === true"
        class="h-5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div class="h-5 rounded-full bg-indigo-500" :style="{ width: `${uploadProgress}%` }"></div>
      </div>

      <!-- File List -->
      <ul v-if="!isUploading" id="fileList" class="divide-y divide-gray-700 mt-4">
        <li class="flex items-center justify-between py-4" v-for="file in uploadedFiles" :key="file.name">
          <div class="flex items-center">
            <i class="fas fa-file-alt text-gray-500 file-icon mr-2"></i>
            <span>{{ file.name }}</span>
          </div>
          <span class="text-sm text-gray-400">{{ prettyBytesPSQL(file.size) }}</span>
        </li>
      </ul>

    </div>
    <!-- Button to start uploading -->
    <div class="Uploader">
      <!-- ...existing code... -->
      <UploadQueue :queue="uploadQueue" @remove="removeFromQueue" />
      <button id="uploadButton" v-if="!cannotUpload()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        @click="uploadFile">Upload</button>
    </div>

  </div>

</template>

<script>
import { ref, defineComponent, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useDropZone, useFileDialog } from '@vueuse/core';
import UploadQueue from './UploadQueue.vue';

export default defineComponent({
  components: {
    UploadQueue
  },

  setup() {
    const authStore = useAuthStore();
    const selectedFile = ref(null);
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const config = ref(null);
    const dropZoneRef = ref(null);
    const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);

    const uploadQueue = ref(new Map());

    const { files, open, reset, onChange } = useFileDialog();
    onChange((files) => {
      handleFileUpload(Array.from(files));
    })

    const socket = io();
    socket.on("uploadProgress", (data) => {
      uploadProgress.value = data.progress;
    });

    onMounted(async () => {
      let configData = localStorage.getItem("config");
      if (!configData) {
        const response = await fetch("/config");
        configData = await response.json();
        localStorage.setItem("config", JSON.stringify(configData));
      } else {
        configData = JSON.parse(configData);
      }
      config.value = configData;

    });
    function onDrop(event) {
      handleFileUpload(Array.from(event.dataTransfer.files));
    }

    function handleFileUpload(files) {
      files.forEach(file => {
        if (!file) { return; }
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
          uploadQueue.value.set(fileHash, file);
        };
        reader.readAsArrayBuffer(file);
      });
    }

    function removeFromQueue(hash) {
      // We don't remove if we're uploading currently
      if (!isUploading.value) {
        uploadQueue.value.delete(hash);
      }
    }
    function cannotUpload() {
      return (
        !uploadQueue.value.size ||
        uploadQueue.value.size < 1 ||
        uploadQueue.value.size > 4 || // max is 4
        isUploading.value ||
        uploadProgress.value > 0 ||
        !authStore.loggedIn
      );
    }
    
    async function uploadFile() {
      const successfulUploads = new Set();
      if (cannotUpload()) {
        return;
      }
      isUploading.value = true;

      for (let [fileHash, selectedFile] of uploadQueue.value) {
        if (!selectedFile) {
          continue;
        }

        const fileSizeInMB = selectedFile.size / (1024 * 1024);
        if (fileSizeInMB > config.value.maxFileSize) {
          console.log(`File ${file.name} size exceeds the limit of ${config.value.maxFileSize}MB`);
          continue;
        }

        // only append the file to the form
        const urlParams = new URLSearchParams(window.location.search);
        const formData = new FormData();
        formData.append("file", selectedFile);
        // the headers store details about the file upload so we don't have to parse them from a form
        // this was a nightmare
        const response = await fetch("/putfile", {
          method: "POST",
          body: formData,
          headers: {
            fileHash: fileHash,
            fileSize: selectedFile.size,
            channelId: urlParams.get("channel") || "867773234976260110",
            userId: authStore.user.id,
            isDM: urlParams.get("isDM") || "false",
          },
        });
        const result = await response.json();

        if (!result.error) {
          const downloadLink = result.downloadLink;
          console.log(`File uploaded successfully. Download link: ${downloadLink}`);
          successfulUploads.add(fileHash);
        } else {
          // alert the error
          console.log(result.error.message);
          continue;
        }

        // since we have added bytes, override the user cookie
        await authStore.updateDBUser(true);

      }
      // Clear the uploadQueue of successfully uploaded files
      for (let fileHash of successfulUploads) {
        uploadQueue.value.delete(fileHash);
      }

      uploadProgress.value = 0;
      isUploading.value = false;

    }

    return {
      authStore,
      selectedFile,
      uploadProgress,
      handleFileUpload,
      uploadFile,
      files,
      open,
      reset,
      onDrop,
      uploadQueue,
      removeFromQueue,
      cannotUpload
    };
  },
});
</script>
