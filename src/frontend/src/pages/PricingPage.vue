<template>
  <div class="pricing">
    <HeaderBar></HeaderBar>
    <main class="text-center py-4">
      <h1 class="text-5xl font-bold mb-4">Start free, <span class="payg-title">pay as you go</span></h1>
      <p class="text-lg mb-4 glow">Flexible storage with pricing that suits you, cheaper than <b>Dropbox</b> and
        <b>OneDrive.</b>
      </p>
      <h2 class="text-3xl font-bold mb-6 fading-line max-w-4xl mx-auto">Choose a plan that suits you</h2>
      <div class="flex justify-center space-x-6">
        <PricingCard v-for="(plan, key, index) in subscriptionPlans" :key="key"
          :titleClass="index === 0 ? 'greentext' : index === 1 ? 'purpletext' : 'orangetext'"
          :borderClass="index === 0 ? 'greenborder' : index === 1 ? 'purpleborder' : 'orangeborder'"
          :title="plan.title"
          :price="plan.price" :buttonText="index === 0 ? 'Start free' : 'Upgrade' "
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
.greentext {
  background: linear-gradient(to right, #00ff10, #37ffb5);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.purpletext {
  background: linear-gradient(to right, #5455ee, #a654f6);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.orangetext {
  background: linear-gradient(to right, #ff7e29, #ffcc29);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.greenborder {
  border: 2px solid #37ffb68f;
}
.purpleborder {
  border: 2px solid #a855f7;
}
.orangeborder {
  border: 2px solid #ffb12998;
}

.payg-title {
  background: linear-gradient(to right, #a855f7, #5255ee);
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