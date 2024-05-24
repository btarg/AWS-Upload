<template>
  <div class="home max-w-none">
    <HeaderBar></HeaderBar>
    <main class="flex flex-col items-center justify-center text-center mx-auto mb-10">
      <!-- Header box -->
      <div class="text-white bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg max-w-1xl p-4 mt-4">
        <h1 class="text-4xl font-extrabold">Cheap storage with zero compromises.</h1>
      </div>
      <!-- Info boxes -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-w-3xl p-2">

        <InfoBoxWithButton href="/pricing" iconClass="fas fa-piggy-bank" buttonText="Pricing Info">
          Pay as you go with credits worth 1¢ each. Never pay for more than what you're using.
        </InfoBoxWithButton>

        <InfoBoxWithButton iconClass="fas fa-hourglass-half" buttonText="File Expiration Info">
          Your files won't expire immediately if you run out of credits. You can also set your own expiration date.
        </InfoBoxWithButton>

        <InfoBoxWithButton iconClass="fas fa-user-shield" buttonText="Customer Privacy">
          We don't store any sensitive user data in our database, or transfer any data to third parties.
        </InfoBoxWithButton>

        <InfoBoxWithButton href="https://google.com" iconClass="fas fa-lock" buttonText="Encryption Info">
          All files are stored encrypted at rest. With Plus, you can also encrypt your files with AES-GCM when uploading, done entirely client-side.
        </InfoBoxWithButton>

      </div>
      <!-- File count -->
      <div class="text-xl mt-4 glow">
        No passwords required; just log in with your Discord account.<br>
        You'll get <b>5GB</b> of storage, free forever.
      </div>
      <!-- Main page buttons -->
      <div class="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 space-x-0 sm:space-x-4">
        <LoginButton>Log in with Discord</LoginButton>
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
import LoginButton from '../components/LoginButton.vue';
import FooterBar from '../components/FooterBar.vue';
import InfoBoxWithButton from '../components/InfoBoxWithButton.vue';

export default {
  components: {
    InfoBox,
    InfoBoxWithButton,
    IconButton,
    LoginButton,
    HeaderBar,
    FooterBar
  },
};
</script>