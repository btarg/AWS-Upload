<template>
  <div class="home max-w-none">
    <HeaderBar></HeaderBar>
    <main class="flex flex-col items-center justify-center text-center mx-auto mb-10">
      <!-- Header box -->
      <div class="text-white bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg max-w-1xl p-4 mt-4">
        <h1 class="text-4xl font-extrabold">Cheap storage with zero compromises.</h1>
      </div>
      <p class="text-xl mt-4 glow">We're cheaper than <b>DropBox</b> and <b>OneDrive,</b> with flexible pricing that
        suits you.</p>
      <!-- Info boxes -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-w-3xl p-2">

          <InfoBoxWithButton iconClass="fas fa-piggy-bank" buttonText="Pricing Info">
            Pay as you go with <b>credits</b> worth <b>1¢ each.</b> Never pay for more than what you're using.
          </InfoBoxWithButton>

          <InfoBoxWithButton iconClass="fas fa-hourglass-half" buttonText="Learn about File Expiration">
            Your files won't expire immediately if you run out of credits. You can also set your own expiration date.
          </InfoBoxWithButton>

          <InfoBoxWithButton iconClass="fas fa-user-shield" buttonText="Customer Privacy">
            We don't store <b>any sensitive user data</b> in our database, and we never transfer any sensitive data.
          </InfoBoxWithButton>

          <InfoBoxWithButton href="https://google.com" iconClass="fas fa-lock" buttonText="Customer Privacy">
            Encrypt your files with <b>AES-GCM</b> when uploading.<br>We don't store the key, and no key is transferred
            when downloading.
          </InfoBoxWithButton>

      </div>
      <!-- File count -->
      <div class="text-xl mt-4 glow">
        No passwords required; just log in with your Discord account.<br>
        You'll get <b>5GB</b> of storage, free forever.
      </div>
      <!-- Main page buttons -->
      <div class="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 space-x-0 sm:space-x-4">
        <IconButton href="/auth/login" iconClass="fab fa-discord" :primary="true">Log in with Discord</IconButton>
        <IconButton iconClass="fas fa-dollar-sign">Calculate Price</IconButton>
      </div>
      <div class="text-xl sm:text-2xl md:text-4xl lg:text-4xl font-bold mt-6 fading-line">
        <span>Proudly serving <span
            class="text-white bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-1 sm:p-2">420,69,777</span>
          files</span>
      </div>

    </main>
  </div>
  <FooterBar></FooterBar>
</template>


<script>
import HeaderBar from '../components/HeaderBar.vue';
import InfoBox from '../components/InfoBox.vue';
import IconButton from '../components/IconButton.vue';
import FooterBar from '../components/FooterBar.vue';
import InfoBoxWithButton from '../components/InfoBoxWithButton.vue';

export default {
  components: {
    InfoBox,
    InfoBoxWithButton,
    IconButton,
    HeaderBar,
    FooterBar
  },
};
</script>