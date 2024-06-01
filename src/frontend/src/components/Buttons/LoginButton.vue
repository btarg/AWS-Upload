<template>
    <IconButton href="/api/auth/login" iconClass="fab fa-discord" :primary="true"><slot></slot></IconButton>
</template>

<script>
import IconButton from './Buttons/IconButton.vue';

export default {
  components: {
    IconButton
  }
}
</script>