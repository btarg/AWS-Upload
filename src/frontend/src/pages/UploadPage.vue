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
import prettyBytes from 'pretty-bytes';

const authStore = useAuthStore();
const bytesUsed = ref("");
const bytesAllowed = ref("");
const lastUpdate = ref(Date.now()); // Add this line
const cooldown = 60000; // Cooldown period in milliseconds (1 minute)

onMounted(async () => {
  await updateUserData();
});

async function updateUserData() {
  const now = Date.now();

  try {
    const isOnCooldown = now - lastUpdate.value < cooldown;
    // if cooldown is active then we do not override
    await authStore.updateDBUser(!isOnCooldown);
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
  }
};
</script>
