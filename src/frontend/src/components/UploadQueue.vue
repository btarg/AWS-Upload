<template>
    <div>
        <h2>Upload Queue</h2>
        <ul>
            <li v-for="(entry, index) in Array.from(queue.entries())" :key="index">
                Hash: {{ entry[0] }}, File Name: {{ entry[1].name }}, File Size: {{ entry[1].size }} bytes
                <button @click="removeFromQueue(entry[0])">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: ['queue'],
    methods: {
        removeFromQueue(hash) {
            this.$emit('remove', hash);
        },
    },
};
</script>