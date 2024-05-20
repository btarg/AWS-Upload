<script setup>
import Home from "./pages/Home.vue";
import UploadPage from "./pages/UploadPage.vue";

var isUploadPage = false;
const urlParams = new URLSearchParams(window.location.search);

// check for url parameters corresponding to uploading a file
if (urlParams.get("channel")) {
  isUploadPage = true;
}

</script>

<template>
  <div id="app">
    <Home v-if="!isUploadPage" />
    <UploadPage v-else />
  </div>
</template>
