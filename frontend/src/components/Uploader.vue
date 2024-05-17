<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button
      @click="uploadFile"
      :disabled="
        !selectedFile || uploadProgress.value > 0 || !authStore.loggedIn
      "
    >
      Upload
    </button>
    <progress :value="uploadProgress" max="100"></progress>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";

export default defineComponent({
  props: {
    selectedGuildId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore();
    const selectedFile = ref(null);
    const fileHash = ref(null);
    const uploadProgress = ref(0);
    const config = ref(null);

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

    async function handleFileUpload(event) {
      selectedFile.value = event.target.files[0];
      // Calculate the file hash
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const hashBuffer = await window.crypto.subtle.digest(
          "SHA-1",
          arrayBuffer
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        fileHash.value = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""); // convert bytes to hex string
        console.log("HASH: " + fileHash.value);
      };
      reader.readAsArrayBuffer(selectedFile.value);
    }

    async function uploadFile() {
      if (
        !selectedFile.value ||
        uploadProgress.value > 0 ||
        !authStore.loggedIn
      )
        return;

      const fileSizeInMB = selectedFile.value.size / (1024 * 1024);
      if (fileSizeInMB > config.value.maxFileSize) {
        alert(`File size exceeds the limit of ${config.value.maxFileSize}MB`);
        return;
      }

      // only append the file to the form
      const urlParams = new URLSearchParams(window.location.search);
      const formData = new FormData();
      formData.append("file", selectedFile.value);
      // the headers store details about the file upload so we don't have to parse them from a form
      // this was a nightmare
      const response = await fetch("/putfile", {
        method: "POST",
        body: formData,
        headers: {
          fileHash: fileHash.value,
          guildId: this.selectedGuildId,
          channelId: urlParams.get("channel"),
          userId: authStore.user.id,
          isDM: urlParams.get("isDM") || "false",
        },
      });
      const result = await response.json();

      if (!result.error) {
        uploadProgress.value = 0;

        const downloadLink = result.downloadLink;
        alert(`File uploaded successfully. Download link: ${downloadLink}`);
      } else {
        // alert the error
        alert(result.error.message);
      }
    }

    return {
      authStore,
      selectedFile,
      uploadProgress,
      handleFileUpload,
      uploadFile,
    };
  },
});
</script>
