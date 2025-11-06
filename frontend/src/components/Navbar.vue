<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-box-seam me-2"></i>
        Docker Web Desktop
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <span class="navbar-text me-3">
              <i class="bi bi-circle-fill text-success me-1"></i>
              Docker Connected
            </span>
          </li>
          <li class="nav-item dropdown" ref="dropdownContainer">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              id="navbarDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
              aria-expanded="false"
              @click.prevent="toggleDropdown"
            >
              <i class="bi bi-gear-fill"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: dropdownOpen }">
              <li>
                <router-link class="dropdown-item" to="/about" @click="closeDropdown">
                  <i class="bi bi-person-circle me-2"></i>About
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/installation" @click="closeDropdown">
                  <i class="bi bi-download me-2"></i>Installation Guide
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/resources" @click="closeDropdown">
                  <i class="bi bi-book me-2"></i>Docker Resources
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="https://github.com/devremoto/docker-web-desktop" target="_blank" rel="noopener noreferrer" @click="closeDropdown">
                  <i class="bi bi-github me-2"></i>GitHub Repository
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="https://github.com/devremoto/docker-web-desktop/issues" target="_blank" rel="noopener noreferrer" @click="closeDropdown">
                  <i class="bi bi-bug me-2"></i>Report Issue
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const dropdownOpen = ref(false)
const dropdownContainer = ref(null)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar-brand {
  font-weight: 600;
}

.navbar-text {
  font-size: 0.9rem;
}

.dropdown-toggle::after {
  display: none;
}

.dropdown-menu {
  min-width: 220px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  display: none;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-divider {
  margin: 0.5rem 0;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}

/* Gear icon hover effect */
.nav-link:hover .bi-gear-fill {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}
</style>