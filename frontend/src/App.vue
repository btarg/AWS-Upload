<script setup>
import Home from "./pages/Home.vue";
import UploadPage from "./pages/UploadPage.vue";

import { useAuthStore } from "./stores/authStore.js";
const authStore = useAuthStore();
authStore.updateLogin();

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
</script>

<template>
  <div id="app">
    <Home v-if="!isUploadPage" />
    <UploadPage v-else />
  </div>
</template>
