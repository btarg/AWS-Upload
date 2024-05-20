<template>
  <div class="home">
    <h1>Welcome to the Home Page</h1>
    <p v-if="authStore.loggedIn">{{ authStore.discordUser.global_name }}</p>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useAuthStore } from "../stores/authStore.js";

export default {
  name: "Home",
  setup() {
    const authStore = useAuthStore();
    const isLoading = ref(true);

    onMounted(async () => {
      try {
        await authStore.updateLogin();
      } catch (err) {
        console.error('Failed to update login:', err);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      authStore,
      isLoading,
    };
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}
</style>