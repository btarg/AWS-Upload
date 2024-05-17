<script setup>
import { useAuthStore } from "../stores/authStore.js";
import GuildDropdown from "../components/GuildDropdown.vue";
import Uploader from "../components/Uploader.vue";
const authStore = useAuthStore();
authStore.updateLogin();
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

<template>
  <button v-if="!authStore.loggedIn" @click="authStore.logIn()">Login</button>
  <button v-else @click="authStore.logOut()">Logout</button>

  <label v-if="authStore.loggedIn">{{
    authStore.discordUser ? authStore.discordUser.username : ""
  }}</label>

  <GuildDropdown
    v-if="authStore.loggedIn"
    @guild-selected="handleGuildSelected"
  />
  <Uploader
    v-if="selectedGuildId && authStore.loggedIn"
    :selectedGuildId="selectedGuildId"
  />
  <label v-if="selectedGuildId && authStore.loggedIn"
    >Server: {{ selectedGuildId }}</label
  >
</template>

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
