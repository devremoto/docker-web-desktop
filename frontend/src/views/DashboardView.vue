<template>
  <div class="dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-speedometer2 me-2"></i>Dashboard</h2>
      <button 
        class="btn btn-outline-primary" 
        @click="refreshAll"
        :disabled="dockerStore.loading"
      >
        <i class="bi bi-arrow-clockwise me-1"></i>
        Refresh
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div 
          class="card bg-primary text-white cursor-pointer" 
          @click="navigateToContainers"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ dockerStore.totalContainers }}</h4>
                <p class="mb-0">Containers</p>
              </div>
              <div class="align-self-center">
                <i class="bi bi-box fs-1"></i>
              </div>
            </div>
            <div class="mt-2">
              <small>{{ dockerStore.runningContainers.length }} running</small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div 
          class="card bg-secondary text-white cursor-pointer" 
          @click="navigateToImages"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ dockerStore.totalImages }}</h4>
                <p class="mb-0">Images</p>
              </div>
              <div class="align-self-center">
                <i class="bi bi-layers fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div 
          class="card bg-info text-white cursor-pointer" 
          @click="navigateToVolumes"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ dockerStore.totalVolumes }}</h4>
                <p class="mb-0">Volumes</p>
              </div>
              <div class="align-self-center">
                <i class="bi bi-hdd fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div 
          class="card bg-warning text-white cursor-pointer" 
          @click="navigateToNetworks"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="mb-0">{{ dockerStore.totalNetworks }}</h4>
                <p class="mb-0">Networks</p>
              </div>
              <div class="align-self-center">
                <i class="bi bi-diagram-3 fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Containers -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Containers</h5>
            <router-link to="/containers" class="btn btn-sm btn-outline-primary">
              View All
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="dockerStore.loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="dockerStore.containers.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-box display-4 mb-3"></i>
              <p>No containers found</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="container in recentContainers" :key="container.Id">
                    <td>
                      <i class="bi bi-box me-2"></i>
                      {{ getContainerName(container) }}
                    </td>
                    <td>{{ container.Image }}</td>
                    <td>
                      <span 
                        class="badge" 
                        :class="getStatusBadgeClass(container.State)"
                      >
                        {{ container.State }}
                      </span>
                    </td>
                    <td>{{ formatDate(container.Created) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDockerStore } from '../stores/docker'

const router = useRouter()
const dockerStore = useDockerStore()

const recentContainers = computed(() => {
  return dockerStore.containers.slice(0, 5)
})

const refreshAll = () => {
  dockerStore.fetchAll()
}

const navigateToContainers = () => {
  router.push('/containers')
}

const navigateToImages = () => {
  router.push('/images')
}

const navigateToVolumes = () => {
  router.push('/volumes')
}

const navigateToNetworks = () => {
  router.push('/networks')
}

const getContainerName = (container) => {
  return container.Names?.[0]?.replace('/', '') || container.Id.slice(0, 12)
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'running':
      return 'bg-success'
    case 'exited':
      return 'bg-secondary'
    case 'paused':
      return 'bg-warning'
    default:
      return 'bg-secondary'
  }
}

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

// Initialize all data on component mount (redundant with App.vue but ensures data is loaded)
onMounted(() => {
  if (dockerStore.totalVolumes === 0 || dockerStore.totalImages === 0 || dockerStore.totalNetworks === 0) {
    dockerStore.fetchAll()
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  min-height: 130px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
</style>