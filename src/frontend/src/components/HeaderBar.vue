<template>
    <div>
        <header class="flex justify-between items-center p-6">
            <div class="flex items-center space-x-4">
                <!-- <div class="text-2xl font-bold text-indigo-500">ByteReserve</div> -->
                <nav class="flex space-x-6 text-white">
                    <a href="/" class="text-sm sm:text-base">Home</a>
                    <a href="#" class="text-sm sm:text-base">Privacy</a>
                    <a href="/pricing" class="text-sm sm:text-base">Pricing</a>
                    <a href="#" class="text-sm sm:text-base">About</a>
                    <a href="#" class="text-sm sm:text-base">Contact</a>
                </nav>
            </div>
            <div class="flex items-center space-x-4">
                <LoginButton>Log in</LoginButton>
            </div>
        </header>
    </div>
</template>

<script>
import LoginButton from './Buttons/LoginButton.vue';

export default {
    components: {
        LoginButton,
    },
}
</script>