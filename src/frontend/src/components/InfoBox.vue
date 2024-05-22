<template>
  <div class="info-box">
    <i :class="[iconClass, 'fa-3x', 'ml-2', 'mr-2', 'text-indigo-400']"></i>
    <p><slot>Text</slot></p>
  </div>
</template>

<script>
export default {
  props: {
    iconClass: {
      type: String,
      default: 'fas fa-user-shield'
    }
  }
}
</script>