<template>
    <div class="not-found">
        <h1>404</h1>
        <p>Sorry, the page you were looking for was not found.</p>
        <router-link to="/">Go to Home</router-link>
    </div>
</template>

<script>
export default {
    name: 'NotFound'
}
</script>

<style scoped>
.not-found {
    text-align: center;
    margin-top: 50px;
}
</style>