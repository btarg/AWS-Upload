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
      bytesUsed.value = prettyBytesPSQL(authStore.user.bytesUsed);
      bytesAllowed.value = prettyBytesPSQL(authStore.user.bytesAllowed);
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
