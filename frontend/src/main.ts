import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import custom dark theme CSS
import './assets/dark-theme.css'

// Import routes
import routes from './router/routes'

// Import stores
import './stores'

const router = createRouter({
    history: createWebHistory(),
    routes
})

const pinia = createPinia()

// Initialize theme on page load
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-bs-theme', theme)
}

initTheme()

createApp(App)
    .use(pinia)
    .use(router)
    .mount('#app')
