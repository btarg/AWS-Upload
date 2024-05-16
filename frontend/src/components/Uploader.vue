<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button
      @click="uploadFile"
      :disabled="!selectedFile || uploadProgress > 0 || !authStore.loggedIn"
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
    }

    async function uploadFile() {
      if (
        !selectedFile.value ||
        uploadProgress.value > 0 ||
        !authStore.loggedIn
      )
        return;

      const fileSizeInMB = selectedFile.value.size / (1024 * 1024);
      if (fileSizeInMB > config.maxFileSize) {
        alert(`File size exceeds the limit of ${config.maxFileSize}MB`);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const formData = new FormData();
      formData.append("file", selectedFile.value);
      formData.append("guildId", this.selectedGuildId);
      formData.append("channelId", urlParams.get("channel"));
      formData.append("userId", authStore.user.id);
      formData.append("isDM", urlParams.get("isDM") || false);

      const response = await fetch("/putfile", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.status === 200 || response.status === 201) {
        uploadProgress.value = 0;

        const downloadLink = result.downloadLink;
        alert(`File uploaded successfully. Download link: ${downloadLink}`);
      } else {
        // alert the error
        alert(result.error);
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
