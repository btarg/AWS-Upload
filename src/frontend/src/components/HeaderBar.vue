<template>
    <div>
        <div v-if="hasNotificationContent && this.showNotification"
            class="bg-indigo-500 text-white text-center py-2 relative">
            {{ notificationContent }}
            <button id="inline-close" @click="closeNotification">
                Close <i class="fas fa-times"></i>
            </button>
        </div>
        <header class="flex items-center justify-between py-6 px-6 sm:px-6 text-xs sm:text-1xl">
            <div class="flex items-center">
                <!-- <span class="site-logo text-indigo-500 text-sm sm:text-2lg md:text-3xl lg:text-4xl xl:text-4xl">ByteReserve</span> -->
            </div>
            <nav class="flex space-x-2 sm:space-x-6 px-2 sm:px-6">
                <!-- Navigation links -->
                <a class="text-sm sm:text-base" href="#">Privacy</a>
                <a class="text-sm sm:text-base" href="#">Pricing</a>
                <a class="text-sm sm:text-base" href="#">About</a>
                <a class="text-sm sm:text-base" href="#">Contact</a>
            </nav>
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
export default {
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