<template>
  <div class="flex justify-between items-center bg-gray-800 p-4 rounded-lg w-full">
    <div class="flex items-center space-x-4">
      <input class="form-checkbox h-5 w-5 text-purple-500" type="checkbox">
      <img alt="Icon representing a PDF file" class="w-10 h-10" height="40" width="40">
      <a :href="`/download/${file.fileid}`" class="text-white">{{ file.filename }}</a>
    </div>
    <div class="flex items-center space-x-4 ml-auto mr-4">
      <span class="text-gray-400"> {{ file.filesize }} bytes </span>
      <span class="text-gray-400">{{ friendlyDate }} </span>
    </div>
    <div class="flex items-center space-x-4">
      <a href="#"><i class="fas fa-share"></i></a>
      <a href="#"><i class="fas fa-cog"></i></a>
      <a href="#" @click.prevent="deleteFileById(file.fileid)"><i class="fas fa-trash"></i></a>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    file: {
      type: Object,
      required: true
    },
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
