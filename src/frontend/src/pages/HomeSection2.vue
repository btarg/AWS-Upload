<template>
    <main class="pt-28 flex flex-col items-center justify-center text-center mx-auto mb-10">
        <!-- Header box -->
        <div class="text-white bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg max-w-1xl p-4 mt-4">
            <h1 class="text-4xl font-extrabold">We never touch your data.</h1>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-w-3xl p-2">
            <InfoBoxWithButton iconClass="fas fa-user-shield" buttonText="Customer Privacy">
                We don't store any sensitive user data in our database, or transfer any data to third parties.
            </InfoBoxWithButton>

            <InfoBoxWithButton href="https://google.com" iconClass="fas fa-lock" buttonText="Encryption Info">
                All files are stored encrypted at rest. With Plus, you can also encrypt your files with AES-GCM when
                uploading, done entirely client-side.
            </InfoBoxWithButton>

        </div>

    </main>
</template>

<script>
import InfoBox from '../components/InfoBox.vue';
import InfoBoxWithButton from '../components/InfoBoxWithButton.vue';
import IconButton from '../components/IconButton.vue';


export default {
    components: {
        IconButton,
        InfoBox,
        InfoBoxWithButton,
    },
};
</script>