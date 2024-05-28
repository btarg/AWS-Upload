<template>
  <div class="file-element">
    <a :href="`/download/${file.fileid}`">{{ file.filename }}</a>
    <p>Size: {{ file.filesize }} bytes</p>
    <p>Uploaded at: {{ friendlyDate }}</p>
    <p>File type: {{ friendlyFileType }}</p>
    <button @click="deleteFileById(file.fileid)">Delete</button>
  </div>
</template>

<script>

export default {
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      friendlyFileType: '',
      friendlyDate: '',
    };
  },
  async created() {
    this.friendlyDate = new Date(this.file.uploaddate).toLocaleString();
    this.friendlyFileType = "Test";
  },
  methods: {
    async deleteFileById(fileId) {
      const response = await fetch(`/api/delete/file/${fileId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('File deleted');
      }
    }
  }
}
</script>

<style scoped>
.file-element {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
</style>