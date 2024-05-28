<template>
  <div class="folder-element">
    <a @click="titleClickFunction(folder.id)">{{ folder.name }}</a>
    <p>(Folder)</p>
  </div>
</template>

<script>

export default {
  props: {
    folder: {
      type: Object,
      required: true
    },
    titleClickFunction: {
      type: Function,
      required: true
    }
  },
}
</script>

<style scoped>
.folder-element {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
</style>