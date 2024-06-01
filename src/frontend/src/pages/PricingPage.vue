<template>
  <div class="pricing text-16px">
    <HeaderBar></HeaderBar>
    <main class="text-center py-4">
      <h1 class="text-5xl font-bold mb-4">Start free, <span class="payg-title">pay as you go</span></h1>
      <p class="text-lg text-gray-400">Flexible storage with pricing that suits you,
        cheaper than Dropbox and OneDrive.
      </p>
      <p class="text-lg text-gray-400 mb-12">
        Click "Start free" to top up your account with credits. Upgrade anytime to unlock more features.
      </p>
      <div class="flex justify-center space-x-6">
        <PricingCard v-for="(plan, key, index) in subscriptionPlans" :key="key"
          :titleClass="index === 0 ? 'greentext' : index === 1 ? 'purpletext' : 'orangetext'"
          :borderClass="index === 1 ? 'purpleborder' : ''" :title="plan.title" :price="plan.price"
          :buttonText="index === 0 ? 'Start free' : 'Upgrade' "
          :iconClass="index === 0 ? 'fas fa-flag-checkered' : 'fas fa-circle-up'" :description="plan.description"
          :maxHourlyUploads="plan.maxHourlyUploads" :totalUploadCap="plan.totalUploadCap" :featuresList="plan.features"
          :monthly="plan.price > 0">
        </PricingCard>
      </div>
    </main>
    <FooterBar></FooterBar>
  </div>
</template>

<style>
.i {
  size: .5rem;
}

.greentext {
  background: rgb(74 222 128);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.purpletext {
  background: linear-gradient(to right, #8181eb, rgb(192 132 252));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.orangetext {
  background: linear-gradient(to right, #ff7e29, #ffcc29);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.purpleborder {
  border: 2px solid #a855f7;
}

.payg-title {
  background: linear-gradient(90deg, #a855f7, #ec4899);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>

<script>
import PricingCard from '../components/PricingCard.vue';
import HeaderBar from '../components/HeaderBar.vue';
import FooterBar from '../components/FooterBar.vue';
import { subscriptionFeatures, subscriptionPlans } from '../../../config/subscriptions.js';

export default {
  components: {
    HeaderBar,
    PricingCard,
    FooterBar,
  },
  data() {
    return {
      subscriptionPlans,
      subscriptionFeatures
    };
  }
};
</script>