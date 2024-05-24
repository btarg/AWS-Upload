import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import UploadPage from './pages/UploadPage.vue';
import NotFound from './pages/NotFound.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/upload', component: UploadPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;