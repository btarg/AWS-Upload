<template>
  <div class="info-box border-2 border-indigo-500 border-opacity-50">
    <i v-if="iconClass" :class="[iconClass, 'fa-3x', 'ml-2', 'mr-2', 'text-indigo-400']"></i>
    <p>
      <slot>Text</slot>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    iconClass: {
      type: String,
      default: ''
    }
  }
}
</script>
<style>
/* apply tailwind classes */
@media (prefers-color-scheme: light) {
  .info-box {
    @apply bg-light-backgroundSecondary;
  }
}
@media (prefers-color-scheme: dark) {
  .info-box {
    @apply bg-dark-backgroundSecondary;
  }
}


.info-box {
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 1.125rem;
}

.info-box div {
  justify-content: flex-start;
  padding-right: 1rem;
}
</style>