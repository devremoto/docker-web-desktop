import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import routes
import routes from './router/routes'

// Import stores
import './stores'

const router = createRouter({
    history: createWebHistory(),
    routes
})

const pinia = createPinia()

createApp(App)
    .use(pinia)
    .use(router)
    .mount('#app')
