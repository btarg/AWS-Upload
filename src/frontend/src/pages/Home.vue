<template>
  <div class="home">
    <header class="flex items-center justify-between border-b border-gray-700 py-2 px-6">
      <div class="flex items-center">
        <span class="site-logo text-indigo-500">ByteReserve</span>
      </div>
      <nav class="flex space-x-6 px-6">
        <!-- Navigation links -->
        <a class="text-gray-400 hover:text-white" href="#">Privacy</a>
        <a class="text-gray-400 hover:text-white" href="#">Pricing</a>
        <a class="text-gray-400 hover:text-white" href="#">About</a>
        <a class="text-gray-400 hover:text-white" href="#">Contact</a>
      </nav>
    </header>
    <main class="mt-6 flex flex-col items-center justify-center text-center mx-auto pb-10">
      <!-- Header box -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg md:max-w-2xl p-4">
        <h1 class="text-2xl sm:text-5xl font-extrabold">Cheap storage with zero compromises.</h1>
      </div>
      <div class="mt-8 flex space-x-4">
        <button type="button" class="rounded-lg px-6 py-3 text-white bg-indigo-600 ButtonGradient">
          <i class="fab fa-discord mr-2"></i>
          <span class="button-text">Login with Discord</span>
        </button>
        <button type="button" class="flex items-center px-4 py-3 text-indigo-400 rounded-lg bg-gray-800 ButtonGradient">
          <i class="fas fa-dollar-sign mr-2"></i>
          <span class="button-text">Calculate Price</span>
        </button>
      </div>
      <!-- Info -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 md:max-w-2xl p-2">
        <InfoBox iconClass="fas fa-hand-holding-dollar">Pay as you go with <b>credits</b> worth <b>1¢ each.</b>
        </InfoBox>
        <InfoBox iconClass="fas fa-database">Store <b>100GB</b> of data for <b>less than half a credit</b> per
          week.<span class="text-gray-300">*</span></InfoBox>
        <InfoBox iconClass="fas fa-box-open">Storing <b>5GB</b> or less is <b>always free</b>, no matter what.</InfoBox>
        <InfoBox iconClass="fas fa-hourglass-half">We'll give you <b>7 days</b> before your files expire if you run out
          of credits.</InfoBox>
        <InfoBox iconClass="fas fa-piggy-bank">We don't charge you for <b>bandwidth</b> or <b>API requests</b>.
        </InfoBox>
        <InfoBox iconClass="fas fa-user-shield">
          <div class="flex flex-col items-center">
            <p>We don't store <b>any sensitive user data</b> in our database.</p>
            <button type="button"
              class="flex items-center text-indigo-400 rounded-lg bg-gray-800 ButtonGradient mt-2">
              <span class="button-text text-sm">Learn More →</span>
            </button>
          </div>
        </InfoBox>
      </div>
      <span class="text-gray-500 text-sm">*It costs around 0.009 credits per month to store 1GB of files.</span>
      <!-- Customer count -->
      <div class="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mt-2 sm:mt-4 md:mt-6 lg:mt-10">
        <span class="customers-text">Currently hosting <span
            class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-1 sm:p-2">361,451</span> files</span>
      </div>
    </main>
  </div>
</template>


<script>
import InfoBox from '../components/InfoBox.vue';
export default {
  components: {
    InfoBox
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
};
</script>