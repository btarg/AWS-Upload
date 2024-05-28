<template>
  <div class="file-element">
    <a :href="`/download/${file.id || file.fileid}`">{{ file.name || file.filename }}</a>
    <p>Size: {{ file.filesize }} bytes</p>
    <p>Uploaded at: {{ friendlyDate }}</p>
    <p>File type: {{ friendlyFileType }}</p>
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