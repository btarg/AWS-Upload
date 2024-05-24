<template>
  <footer class="fixed bottom-0 w-full bg-gradient-to-b from-transparent to-indigo-500 opacity-50">
    <div class="container px-2 py-2">
      <p class="dark:text-dark-muted light:text-light-primary text-left text-sm drop-shadow-lg">&copy; {{ currentYear }} ByteReserve. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
}
</script>