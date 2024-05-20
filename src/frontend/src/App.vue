<script setup>
import { onMounted } from 'vue';
import Home from "./pages/Home.vue";
import UploadPage from "./pages/UploadPage.vue";

import { useAuthStore } from "./stores/authStore.js";
const authStore = useAuthStore();

var isUploadPage = false;
const urlParams = new URLSearchParams(window.location.search);

var channel;
var isDM;

// check for url parameters corresponding to uploading a file
if (urlParams.get("channel")) {
  channel = urlParams.get("channel");
  isDM = urlParams.get("isDM");
  isUploadPage = true;
}

onMounted(async () => {
  await authStore.updateLogin();
});
</script>

<template>
  <div id="app">
    <Home v-if="!isUploadPage" />
    <UploadPage v-else />
  </div>
</template>
