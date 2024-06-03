<template>
  <div>
    <input type="file" @change="onFileChange" multiple />
    <button @click="uploadFiles" :disabled="uploading">Upload</button>
    <input type="text" v-model="folder" placeholder="Folder structure" />
  </div>
</template>

<script>
import { ref } from 'vue';
import { encryptAndAssignHash } from '../js/encryption.js';

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
      files: [],
      folder: '',
    };
  },
  methods: {
    onFileChange(e) {
      this.files = [...this.files, ...Array.from(e.target.files)];
    },
    async uploadFiles() {
      this.uploading = true;
      try {
        for (let file of this.files) {
          const encryptedFile = await encryptAndAssignHash(file);
          const formData = new FormData();
          formData.append('file', encryptedFile, file.name);
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'folder': this.folder,
              'filehash': encryptedFile.fileHash,
              'filesize': encryptedFile.fileSize,
              'encrypted': encryptedFile.encrypted,
              ...(encryptedFile.encrypted ? { 'iv': encryptedFile.iv } : {}),
            },
            body: formData,
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        this.onComplete(false);
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>