import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import UploadPage from './pages/UploadPage.vue';
import NotFound from './pages/NotFound.vue';
import PricingPage from './pages/PricingPage.vue';
import FolderViewPage from './pages/FolderViewPage.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/upload', component: UploadPage },
    { path: '/folders', component: FolderViewPage },
    { path: '/pricing', component: PricingPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;