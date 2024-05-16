<template>
  <div>
    <select v-model="selectedGuildId" @change="emitSelectedGuild">
      <option v-for="guild in guilds" :key="guild.id" :value="guild.id">
        {{ guild.name }}
      </option>
    </select>
    <i class="fas fa-sync" @click="refreshGuilds"></i>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import { refreshToken } from "../stores/tokenManager";

export default {
  setup(props, context) {
    const guilds = ref([]);
    const selectedGuildId = ref(null);

    const fetchGuilds = async (refresh = false) => {
      const cachedGuilds = localStorage.getItem("guilds");
      if (cachedGuilds && !refresh) {
        guilds.value = JSON.parse(cachedGuilds);
      } else {
        try {
          console.log("Fetching guilds");
          const response = await fetch("/discord/guilds");
          if (!response.ok) {
            if (response.status === 401) {
              await refreshToken();
              return fetchGuilds(refresh);
            }
            throw new Error("Failed to fetch guilds");
          }
          guilds.value = await response.json();
          localStorage.setItem("guilds", JSON.stringify(guilds.value));
        } catch (error) {
          console.error(error);
          // Handle error appropriately
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const guildId = urlParams.get("guild");
      if (guildId) {
        selectedGuildId.value = guildId;
      } else if (guilds.value.length > 0) {
        selectedGuildId.value = guilds.value[0].id;
      }
      emitSelectedGuild();
    };

    const emitSelectedGuild = () => {
      nextTick(() => {
        console.log("Emitting guild-selected", selectedGuildId.value);
        context.emit("guild-selected", selectedGuildId.value);
      });
    };

    const refreshGuilds = () => {
      localStorage.removeItem("guilds");
      fetchGuilds(true);
    };

    onMounted(async () => {
      fetchGuilds();
    });

    return {
      guilds,
      selectedGuildId,
      refreshGuilds,
    };
  },
};
</script>
