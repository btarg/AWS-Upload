<template>
  <div class="folder-element">
    <a @click="titleClickFunction(folder.id)">{{ folder.name }}</a>
    <!-- delete button -->
    <button @click="deleteFolderAndContents(folder.id)">Delete</button>
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
  methods: {
    async deleteFolderAndContents(folderId) {
      const response = await fetch(`/api/delete/folder/${folderId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Folder deleted');
      }
    }
  }
}
</script>

<style scoped>
.folder-element {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
.folder-element a {
  cursor: pointer;
}
</style>