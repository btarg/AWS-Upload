<template>
  <progress v-if="shouldUpload && progress > 0" :value="progress" max="100"></progress>
  <div v-else class="flex justify-between items-center bg-gray-800 p-4 rounded-lg w-full">
    <div class="flex items-center space-x-4">
      <input class="form-checkbox h-5 w-5 text-purple-500" type="checkbox">
      <img alt="Icon representing a PDF file" class="w-10 h-10" height="40" width="40">
      <a :href="`/download/${currentFile.fileid}`" class="text-white">{{ currentFile.filename }}</a>
    </div>
    <div class="flex items-center space-x-4 ml-auto mr-4">
      <span class="text-gray-400"> {{ prettySize(currentFile.filesize) }} </span>
      <span class="text-gray-400">{{ friendlyDate }} </span>
    </div>
    <div class="flex items-center space-x-4">
      <a href="#"><i class="fas fa-share"></i></a>
      <a href="#"><i class="fas fa-cog"></i></a>
      <a href="#" @click.prevent="deleteFileById(currentFile.fileid)"><i class="fas fa-trash"></i></a>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { encryptAndAssignHash } from '../../js/encryption.js';
import prettyBytes from 'pretty-bytes';

export default {
  props: {
    file: {
      type: File,
      required: true,
    },
    shouldUpload: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    prettySize(sizeInBytes) {
      if (!sizeInBytes || isNaN(Number(sizeInBytes))) {
        return 0;
      }
      return prettyBytes(Number(sizeInBytes));
    },
    async deleteFileById(fileId) {
      const response = await fetch(`/api/delete/file/${fileId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        this.$emit('delete', fileId);
      } else {
        console.error("Error deleting file: " + response.error);
      }
    }
  },
  setup(props, { emit }) {
    const progress = ref(0);
    const currentFile = ref(props.file);

    onMounted(async () => {
      try {
        if (!props.shouldUpload) {
          return;
        }

        if (!currentFile.value.rawFile) {
          throw new Error("No raw file for upload found!");
        }
        // TODO: add proper progress tracking
        progress.value = 50;

        const uploadedFileBlob = await encryptAndAssignHash(currentFile.value.rawFile);
        const formData = new FormData();
        formData.append('file', uploadedFileBlob, uploadedFileBlob.fileName);

        // use headers instead of form data for file metadata to make parsing easier
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'filename': uploadedFileBlob.filename,
            'filehash': uploadedFileBlob.filehash,
            'filesize': uploadedFileBlob.filesize,
            'encrypted': true,
            'iv': uploadedFileBlob.iv || null,
            'mime': uploadedFileBlob.filetype.mime,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();

          const str = JSON.stringify(data, null, 4);
          console.log("Upload data: " + str);
          emit('upload-complete', {
            uploadedFile: data,
            file: uploadedFileBlob
          });
          // we no longer have a raw file object because we are done processing
          uploadedFileBlob.rawFile = null;
          // add the file id to the final file object
          uploadedFileBlob.fileid = data.id;
          currentFile.value = uploadedFileBlob;

        } else {
          const errorData = await response.json();
          const str = JSON.stringify(errorData, null, 4);
          console.error("Error uploading file: " + str);
          emit('upload-error', errorData);
        }
        progress.value = 0;
        

      } catch (error) {
        console.error("Error uploading file: " + error);
        emit('upload-error', currentFile.value.rawFile.name);
      }
    });

    return {
      progress,
      currentFile
    };
  },
};
</script>