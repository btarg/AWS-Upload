<template>
  <button v-if="!authStore.loggedIn" @click="authStore.logIn()">Login</button>
  <button v-else @click="authStore.logOut()">Logout</button>

  <label v-if="authStore.loggedIn">{{
    authStore.discordUser ? authStore.discordUser.username : ""
  }}</label>

  <GuildDropdown v-if="authStore.loggedIn" @guild-selected="handleGuildSelected" />
  <Uploader v-if="selectedGuildId && authStore.loggedIn" :selectedGuildId="selectedGuildId" />
  <label v-if="selectedGuildId && authStore.loggedIn">
    Used:
    {{ bytesUsed }} /
    {{ bytesAllowed }}
  </label>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore.js";
import GuildDropdown from "../components/GuildDropdown.vue";
import Uploader from "../components/Uploader.vue";
import { prettyPrintBytes } from "../utils.js";

const authStore = useAuthStore();
const bytesUsed = ref("");
const bytesAllowed = ref("");

import { onBeforeUnmount, nextTick } from "vue";

let intervalId;

onMounted(async () => {
  await updateUserData();
  intervalId = setInterval(updateUserData, 30000); // Refresh every 30 seconds
});

onBeforeUnmount(() => {
  clearInterval(intervalId); // Clear the interval when the component is unmounted
});

async function updateUserData() {
  try {
    await authStore.updateDBUser();
    if (authStore.user) {
      bytesUsed.value = prettyPrintBytes(authStore.user.bytesUsed);
      bytesAllowed.value = prettyPrintBytes(authStore.user.bytesAllowed);
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
    GuildDropdown,
    Uploader,
  },
  data() {
    return {
      selectedGuildId: null,
    };
  },
  methods: {
    handleGuildSelected(guildId) {
      this.selectedGuildId = guildId;
    },
  },
};
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
