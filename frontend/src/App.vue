<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDockerStore } from './stores/docker'
import apiService from './services/api'
import Environment from './utils/environment'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'

const dockerStore = useDockerStore()

onMounted(() => {
  // Log environment information
  Environment.info('Application started', {
    mode: Environment.mode,
    apiUrl: Environment.config.apiBaseUrl,
    debug: Environment.config.debug
  })

  // Fetch initial data
  dockerStore.fetchAll()

  // Setup real-time listeners
  apiService.onContainerStateChanged(() => {
    dockerStore.fetchContainers()
  })

  apiService.onContainerRemoved(() => {
    dockerStore.fetchContainers()
  })

  apiService.onImageRemoved(() => {
    dockerStore.fetchImages()
  })

  apiService.onVolumeRemoved(() => {
    dockerStore.fetchVolumes()
  })

  apiService.onNetworkRemoved(() => {
    dockerStore.fetchNetworks()
  })
})

onUnmounted(() => {
  apiService.disconnect()
})
</script>

<template>
  <div class="app">
    <Navbar />
    <div class="container-fluid">
      <div class="row">
        <Sidebar class="col-md-3 col-lg-2" />
        <main class="col-md-9 col-lg-10 px-md-4">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--bs-app-bg);
  color: var(--bs-body-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

main {
  padding-top: 20px;
  background-color: var(--bs-body-bg);
  transition: background-color 0.3s ease;
}
</style>
