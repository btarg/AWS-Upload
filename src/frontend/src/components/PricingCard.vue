<template>
    <div
        :class="`box-background p-8 rounded-lg w-80 ${cardBorder ? 'border-2 border-purple-500' : ''}`">
        <h2 :class="`text-xl font-black ${titleClass}`">{{ title }}
        </h2>
        <p class="light:text-light-primary dark:text-dark-primary text-4xl font-bold mb-4">{{ formatMoney(price) }} <span
    class="text-lg font-normal" v-if="monthly">per
                month</span></p>
        <p class="light:text-light-muted dark:text-dark-muted mb-6">{{ description }}</p>
        <div class="flex justify-center">
            <IconButton class="mb-4" :href="buttonLink" :primary="false">{{ buttonText }}</IconButton>
        </div>
        <ul class="text-left light:text-light-primary dark:text-dark-primary space-y-2">
            <li v-for="feature in featureList" :key="feature">            
                <i :class="`fas fa-check-circle font-bold ${titleClass}`"></i> {{ feature }}
            </li>
        </ul>
    </div>
</template>

<style>
/* apply tailwind to box-background */
@media (prefers-color-scheme: light) {
    .box-background {
        @apply bg-light-background;
    }
}
@media (prefers-color-scheme: dark) {
    .box-background {
        @apply bg-dark-backgroundSecondary;
    }
}

</style>

<script>
import { formatMoney } from '../util.js';
import IconButton from './IconButton.vue';
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
    features: String,
    cardBorder: Boolean,
    buttonLink: String,
    titleClass: String,
  },
  computed: {
    featureList() {
      return this.featuresText.split(',');
    },
  },
  methods: {
    formatMoney
  }
};
</script>