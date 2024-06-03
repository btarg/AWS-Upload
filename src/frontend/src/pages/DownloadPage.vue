<template>
  <div class="page-container">
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else>
      <div v-if="isLoading">Loading...</div>
      <div v-else>
        <div class="media-container">
          <div class="title-container">
            <h1 class="title text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{{ file.filename }}</h1>
          </div>
          <video v-if="isVideo" controls preload="auto" class="media">
            <source :src="signedUrl" :type="fileType.mime">
            Your browser does not support the video tag.
          </video>
          <img v-else-if="isImage" :src="signedUrl" class="fullscreen-image" alt="">
          <iframe v-else-if="isPdf"
            :src="`https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`"
            class="fullscreen-pdf">
          </iframe>
          <a v-else :href="signedUrl" download>Download file</a>
          <div class="ad-banner">
            <p class="text-2xl ml-2">This file was hosted with ByteReserve</p>
          </div>
          <FooterBar />
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: auto;
  display: flex;
  flex-direction: column;
}

.media-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 85vh;
}

.title-container {
  top: 0;
  left: 0;
  right: 0;
  padding: 0 1em;
  text-align: center;
  z-index: 1;
}

.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ad-banner {
  width: 100%;
  height: 15vh;
  margin-top: 2rem;
}

.fullscreen-video,
.fullscreen-image,
.fullscreen-pdf {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (prefers-color-scheme: light) {
  .media-container {
    @apply text-light-primary;
  }
}

@media (prefers-color-scheme: dark) {
  .media-container {
    @apply text-dark-primary;
  }
}
</style>

<script>
import FooterBar from '../components/FooterBar.vue';
import { getFileType } from '../js/util.js';

export default {
  components: {
    FooterBar,
  },
  data() {
    return {
      file: null,
      signedUrl: null,
      fileType: null,
      fileId: this.$route.params.fileId,
      isLoading: true,
      errorMessage: null,
    };
  },
  computed: {
    isVideo() {
      return this.fileType && this.fileType.mime.startsWith('video/');
    },
    isImage() {
      return this.fileType && this.fileType.mime.startsWith('image/');
    },
    isPdf() {
      return this.fileType && this.fileType.mime === 'application/pdf';
    },
    cacheExpiry() {
      return new Date().getTime() + 12 * 60 * 1000; // 12 minutes
    }
  },
  methods: {
    async getFileById(id) {
      let cachedData = JSON.parse(localStorage.getItem(`file-${id}`));
      if (cachedData && new Date().getTime() < cachedData.expiry) {
        return cachedData.data;
      }
      const response = await fetch(`/api/files/get/${id}`);
      let data = await response.json();
      localStorage.setItem(`file-${id}`, JSON.stringify({
        data: data,
        expiry: this.cacheExpiry,
      }));
      return data;
    },
    async getS3URL(id) {
      let cachedData = JSON.parse(localStorage.getItem(`url-${id}`));
      if (cachedData && new Date().getTime() < cachedData.expiry) {
        return cachedData.data;
      }
      const response = await fetch(`/api/download/getURL/${id}`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to get S3 URL');
      }
      let data = await response.json();
      localStorage.setItem(`url-${id}`, JSON.stringify({
        data: data,
        expiry: this.cacheExpiry,
      }));
      return data;
    },
    
    async fetchFileData() {
      try {
        if (!this.fileId) {
          this.$router.push('/');
          return;
        }
        this.file = await this.getFileById(this.fileId);
        this.signedUrl = await this.getS3URL(this.fileId);
        this.fileType = await getFileType(this.file.filename);
        this.isLoading = false;
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
  },
  async mounted() {
    await this.fetchFileData();
  },
};
</script>