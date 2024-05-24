<template>
    <div>
        <div v-if="hasNotificationContent && this.showNotification"
            class="bg-indigo-500 text-white text-center py-2 relative">
            {{ notificationContent }}
            <button id="inline-close" @click="closeNotification">
                Close <i class="fas fa-times"></i>
            </button>
        </div>
        <header class="flex justify-between items-center p-6">
            <div class="flex items-center space-x-4">
                <!-- <div class="text-2xl font-bold text-indigo-500">ByteReserve</div> -->
                <nav class="flex space-x-6 text-white">
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
<style>
button#inline-close {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    background-color: transparent;
    border: none;
    padding: 0.5rem;
    font-size: 1rem;
    color: whitesmoke;
    transition: color 0.3s ease;
}

button#inline-close:hover {
    color: #bf88ff;
}
</style>
<script>
import LoginButton from './LoginButton.vue';

export default {
    components: {
        LoginButton,
    },
    data() {
        return {
            notificationContent: '',
            showNotification: false,
        };
    },
    computed: {
        hasNotificationContent() {
            return this.notificationContent !== '';
        }
    },
    methods: {
        closeNotification() {
            this.showNotification = false;
        },
        fetchContent() {
            fetch('/banner')
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (!response.ok || !contentType || !contentType.includes('text/plain')) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    this.notificationContent = data;
                    this.showNotification = true;
                })
                .catch(error => {
                    console.error(error);
                    this.notificationContent = '';
                });
        },
    },
    created() {
        this.fetchContent();
    },
}
</script>