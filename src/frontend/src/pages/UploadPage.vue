<template>
  <button v-if="!authStore.loggedIn" @click="authStore.logIn()">Login</button>
  <button v-else @click="authStore.logOut()">Logout</button>

  <label v-if="authStore.loggedIn">{{
    authStore.discordUser ? authStore.discordUser.username : ""
    }}</label>

  <Uploader v-if="authStore.loggedIn" />
  <label v-if="authStore.loggedIn">
    Used:
    {{ bytesUsed }} /
    {{ bytesAllowed }}
  </label>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore.js";
import Uploader from "../components/Uploader.vue";
import { prettyBytesPSQL } from "../util.js";

const authStore = useAuthStore();
const bytesUsed = ref("");
const bytesAllowed = ref("");

onMounted(async () => {
  await updateUserData();
});

async function updateUserData() {
  try {
    await authStore.updateDBUser();
    if (authStore.user) {
      bytesUsed.value = prettyBytesPSQL(authStore.user.data.bytesUsed);
      bytesAllowed.value = prettyBytesPSQL(authStore.user.data.bytesAllowed);
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  }
}
</script>

<script>
export default {
  name: "UploadPage",
  components: {
    Uploader,
  }
};
</script>
