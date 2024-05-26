<template>
  <div :class="`box-background p-8 rounded-lg w-80 ${borderClass}`">
    <h2 :class="`text-lg font-semibold ${titleClass}`">{{ title }}
    </h2>
    <p class="light:text-light-primary dark:text-gray-400 text-4xl font-bold mb-4">{{ formatMoney(price) }}
    <p class="text-lg font-normal" v-if="monthly">per month</p>
    </p>
    <p class="description mb-6">{{ description }}</p>
    <div class="flex justify-center">
      <IconButton :iconClass="iconClass" class="mb-4" :href="buttonLink" :primary="true">{{ buttonText }}</IconButton>
    </div>
    <ul class="text-left light:text-light-primary dark:text-gray-400 space-y-2">
      <li :key="maxHourlyUploads">
        <i :class="`fas fa-check-circle font-bold ${titleClass}`"></i>
        Upload up to {{ maxHourlyUploads }} files per hour
      </li>
      <li :key="totalUploadCap">
        <i :class="`fas fa-check-circle font-bold ${titleClass}`"></i>
        Upload up to {{ prettyBytes(totalUploadCap) }} in total
      </li>
      <li v-for="feature in mappedFeatures" :key="feature">
        <i :class="`fas fa-check-circle font-bold ${titleClass}`"></i>
        {{ feature }}
      </li>
    </ul>
  </div>
</template>

<style>
/* apply tailwind to box-background */
@media (prefers-color-scheme: light) {
  .box-background {
    @apply bg-slate-200;
  }

  .description, li {
    @apply text-light-muted;
  }
}

@media (prefers-color-scheme: dark) {
  .box-background {
    @apply bg-dark-backgroundSecondary;
  }

  .description, li {
    @apply text-dark-muted;
  }
}
</style>

<script>
import { formatMoney } from '../util.js';
import IconButton from './IconButton.vue';
import prettyBytes from 'pretty-bytes';
import { getMappedFeatures } from '../../../config/subscriptions.js';

export default {
  components: {
    IconButton
  },
  props: {
    title: String,
    price: String,
    monthly: Boolean,
    description: String,
    buttonText: String,
    maxHourlyUploads: Number,
    totalUploadCap: Number,
    featuresList: Array,
    buttonLink: String,
    titleClass: String,
    iconClass: String,
    borderClass: String,
  },
  computed: {
    mappedFeatures() {
      return getMappedFeatures(this.featuresList); // Use getMappedFeatures to map featuresList
    }
  },
  methods: {
    formatMoney,
    prettyBytes
  }
};
</script>