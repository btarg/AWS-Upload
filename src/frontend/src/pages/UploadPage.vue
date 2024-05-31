<template>
  <button v-if="!authStore.loggedIn" @click="authStore.logIn()">Login</button>
  <button v-else @click="authStore.logOut()">Logout</button>

  <label v-if="authStore.loggedIn" class="text-white">{{
    authStore.discordUser ? authStore.discordUser.username : ""
    }}</label>

  <Uploader v-if="authStore.loggedIn" :on-complete="updateUserData" />
  <label v-if="authStore.loggedIn">
    Used:
    {{ bytesUsed }} /
    {{ bytesAllowed }}
  </label>
  <FolderViewPage v-if="authStore.loggedIn" />

</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore.js";
import Uploader from "../components/Uploader.vue";
import FolderViewPage from "./FolderViewPage.vue";
import prettyBytes from 'pretty-bytes';

const authStore = useAuthStore();
const bytesUsed = ref("");
const bytesAllowed = ref("");
const lastUpdate = ref(Date.now());
const cooldown = 15000; // Cooldown period in milliseconds

onMounted(async () => {
  await updateUserData(true);
});

async function updateUserData(useCooldown = true) {
  const now = Date.now();
  try {
    const isOnCooldown = now - lastUpdate.value < cooldown;
    // if cooldown is active then we do not override
    if (useCooldown) {
      await authStore.updateDBUser(!isOnCooldown);
    } else {
      await authStore.updateDBUser(false);
    }
    
    if (authStore.user) {
      bytesUsed.value = prettyBytes(Number(authStore.user.data.bytesUsed));
      bytesAllowed.value = prettyBytes(Number(authStore.user.data.bytesAllowed));
    }
    
  } catch (error) {
    console.error('Error updating user data:', error);
  } finally {
    lastUpdate.value = now; // Update the timestamp
  }
}
</script>
<script>
export default {
  name: "UploadPage",
  components: {
    Uploader,
    FolderViewPage,
  }
};
</script>
