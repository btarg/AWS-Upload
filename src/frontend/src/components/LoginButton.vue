<template>
    <IconButton href="/auth/login" iconClass="fab fa-discord" :primary="true"><slot></slot></IconButton>
</template>

<script>
import IconButton from './IconButton.vue';

export default {
  components: {
    IconButton
  }
}
</script>