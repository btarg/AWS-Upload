<template>
  <progress v-if="shouldUpload && progress > 0" :value="progress" max="100"></progress>
  <div v-else class="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-lg w-full">
    <div class="flex items-center space-x-4">
      <input class="file-checkbox h-5 w-5 text-purple-500" type="checkbox">
      <span :class="`text-xl fiv-viv fiv-icon-${currentFileType.extension}`"></span>
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
import { encryptAndAssignHash } from '../../../public/js/encryption.js';
import { getFileType } from '../../../public/js/util.js';
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
    const currentFileType = ref(props.file.filename);
    const friendlyDate = ref(null);

    onMounted(async () => {

      try {
        if (!props.shouldUpload) {
          console.log("Getting filetype for " + currentFile.value.filename);
          currentFileType.value = await getFileType(currentFile.value.filename);
          friendlyDate.value = new Date(currentFile.value.uploaddate).toLocaleString();
          return;
        }

        if (!currentFile.value.rawFile) {
          throw new Error("No raw file for upload found!");
        }
        // TODO: add proper progress tracking and allow for key to be set
        progress.value = 50;
        const uploadedFileBlob = await encryptAndAssignHash(currentFile.value.rawFile, "my-secret-key");
        console.log("Encrypted file size: " + uploadedFileBlob.size);

        // use headers instead of form data for file metadata to make parsing easier
        const insertFileAndGetURLResponse = await fetch('/api/upload/getUrl', {
          method: 'GET',
          headers: {
            'filename': uploadedFileBlob.filename,
            'filehash': uploadedFileBlob.filehash,
            'filesize': uploadedFileBlob.size,
            'encrypted': true,
            'iv': uploadedFileBlob.iv || null,
            'mime': uploadedFileBlob.filetype.mime,
          }
        });


        const insertedFileResponse = await insertFileAndGetURLResponse.json();
        if (!insertFileAndGetURLResponse.ok) {
          console.error("Error getting upload URL: " + JSON.stringify(insertedFileResponse.error));
          throw new Error("Error getting upload URL: " + JSON.stringify(insertedFileResponse.error));
        }

        // stringify and log uploadedFileData
        const url = insertedFileResponse.signedUrl;
        const fileId = insertedFileResponse.fileId;
        const uploadDate = insertedFileResponse.uploadDate;
        console.log("Got signed URL: " + url);
        console.log("File ID: " + fileId);
        console.log("Upload Date: " + uploadDate);

        // upload the file to the signed URL
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: uploadedFileBlob,
          headers: {
            'Content-Type': uploadedFileBlob.filetype.mime,
            'ContentDisposition': `inline; filename="${uploadedFileBlob.filename}"`
          }
        });

        currentFileType.value = uploadedFileBlob.filetype;
        console.log("CurrentFileType Value:" + JSON.stringify(currentFileType.value));

        if (uploadResponse.ok) {

          emit('upload-complete', {
            uploadedFile: insertedFileResponse,
            file: uploadedFileBlob
          });
          // we no longer have a raw file object because we are done processing
          currentFile.value.rawFile = null;

          // assign the final file object
          currentFile.value = uploadedFileBlob;

          // add the uploaded file data to the final file object
          currentFile.value.fileid = fileId;
          currentFile.value.uploaddate = uploadDate;

          // set the type and date
          currentFileType.value = uploadedFileBlob.filetype;
          friendlyDate.value = uploadDate.toLocaleString();

        } else {
          console.log("Upload response not ok: " + uploadResponse.statusText);
          const errorData = await uploadResponse.json();
          const str = JSON.stringify(errorData, null, 4);
          console.error("Response Error while uploading file: " + str);
          emit('upload-error', errorData);
        }
        progress.value = 0;

      } catch (error) {
        const errorMessage = error.error || error.message || JSON.stringify(error, null, 4);
        console.error("Error caught while uploading file: " + errorMessage);
        emit('upload-error', currentFile.value.rawFile.name);

        // If there is a file id, send a request to the /upload/error/:fileid endpoint
        if (currentFile.value.fileid) {
          const errorResponse = await fetch(`/upload/error/${currentFile.value.fileid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: errorMessage })
          });

          if (!errorResponse.ok) {
            console.error("Error sending error report: " + errorResponse.statusText);
          }
        }
      }
    });

    return {
      progress,
      currentFile,
      currentFileType
    };
  },
};
</script>