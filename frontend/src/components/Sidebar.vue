<template>
  <nav class="sidebar bg-light border-end">
    <div class="sidebar-header p-3 border-bottom">
      <h5 class="mb-0">Docker Management</h5>
    </div>
    
    <ul class="nav nav-pills flex-column p-2">
      <li class="nav-item">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ active: $route.name === 'Dashboard' }"
        >
          <i class="bi bi-speedometer2 me-2"></i>
          Dashboard
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/containers" 
          class="nav-link"
          :class="{ active: $route.name === 'Containers' }"
        >
          <i class="bi bi-box me-2"></i>
          Containers
          <span class="badge bg-primary ms-auto">{{ dockerStore.totalContainers }}</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/images" 
          class="nav-link"
          :class="{ active: $route.name === 'Images' }"
        >
          <i class="bi bi-layers me-2"></i>
          Images
          <span class="badge bg-secondary ms-auto">{{ dockerStore.totalImages }}</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/volumes" 
          class="nav-link"
          :class="{ active: $route.name === 'Volumes' }"
        >
          <i class="bi bi-hdd me-2"></i>
          Volumes
          <span class="badge bg-info ms-auto">{{ dockerStore.totalVolumes }}</span>
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/networks" 
          class="nav-link"
          :class="{ active: $route.name === 'Networks' }"
        >
          <i class="bi bi-diagram-3 me-2"></i>
          Networks
          <span class="badge bg-warning ms-auto">{{ dockerStore.totalNetworks }}</span>
        </router-link>
      </li>
      
      <!-- Separator -->
      <li class="nav-item my-2">
        <hr class="nav-separator">
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/commands" 
          class="nav-link"
          :class="{ active: $route.name === 'DockerCommands' }"
        >
          <i class="bi bi-terminal me-2"></i>
          Docker Commands
        </router-link>
      </li>
      
      <!-- Additional Resources -->
      <li class="nav-item my-2">
        <hr class="nav-separator">
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/resources" 
          class="nav-link"
          :class="{ active: $route.name === 'Resources' }"
        >
          <i class="bi bi-book me-2"></i>
          Docker Resources
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/installation" 
          class="nav-link"
          :class="{ active: $route.name === 'Installation' }"
        >
          <i class="bi bi-download me-2"></i>
          Installation Guide
        </router-link>
      </li>
      
      <li class="nav-item">
        <router-link 
          to="/about" 
          class="nav-link"
          :class="{ active: $route.name === 'About' }"
        >
          <i class="bi bi-person-circle me-2"></i>
          About
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useDockerStore } from '../stores/docker'

const dockerStore = useDockerStore()
</script>

<style scoped>
.sidebar {
  min-height: calc(100vh - 56px);
  /* Adjust for navbar height */
  position: sticky;
  top: 0;
}

.sidebar-header {
  background-color: #e9ecef;
}

.nav-link {
  color: #495057;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
}

.nav-link:hover {
  background-color: #e9ecef;
  color: #495057;
}

.nav-link.active {
  background-color: #0d6efd;
  color: white;
}

.badge {
  font-size: 0.7rem;
}

.nav-separator {
  margin: 0.5rem 1rem;
  border-color: #dee2e6;
  opacity: 0.5;
}
</style>