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
        <PricingCard titleClass="greentext" title="FREE" price="$0" buttonText="Start free"
          description="A small taster of what we offer"
          features="5GB Free forever,Total upload cap of 2TB,Upload up to 4 files at a time,Add credits whenever you want">
        </PricingCard>
        <PricingCard titleClass="purpletext" title="PLUS" price="$2.99" buttonText="Upgrade"
          description="For users wanting to upload more than 2TB. Cheaper than the competition"
          features="Total upload cap of 10TB,Upload up to 10 files at a time,Encrypt your files with AES-GCM and share keys via URLs,Use ShareX to upload files,Choose when links expire,5% off all credit top-ups,Import files from other services"
          monthly=true cardBorder=true>
        </PricingCard>
        <PricingCard titleClass="orangetext" title="OVERKILL" price="$12.99" buttonText="Contact us"
          description="Great for businesses with large storage needs"
          features="Total upload cap of 50TB,Upload up to 25 files at a time,10% off all credit top-ups,Priority support"
          monthly=true>
        </PricingCard>
      </div>
    </main>
    <FooterBar></FooterBar>
  </div>
</template>

<style>
.greentext {
  background: linear-gradient(45deg, rgb(0, 190, 95), rgb(100, 255, 155));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.purpletext {
  background: linear-gradient(45deg, #a855f7, #a5a8ff);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.orangetext {
  background: linear-gradient(45deg, #ff7e29, #ffcc29);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.payg-title {
  background: linear-gradient(45deg, #a855f7, #5255ee);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>

<script>
import PricingCard from '../components/PricingCard.vue';
import HeaderBar from '../components/HeaderBar.vue';
import FooterBar from '../components/FooterBar.vue';

export default {
  components: {
    HeaderBar,
    PricingCard,
    FooterBar,
  },
};
</script>