<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useDockerStore } from './stores/docker'
import apiService from './services/api'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'

const dockerStore = useDockerStore()

onMounted(() => {
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
  background-color: #f8f9fa;
}

main {
  padding-top: 20px;
}
</style>
