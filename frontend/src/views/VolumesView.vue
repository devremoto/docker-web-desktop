<template>
  <div class="volumes">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-hdd me-2"></i>Volumes</h2>
      <button 
        class="btn btn-outline-primary" 
        @click="refreshVolumes"
        :disabled="dockerStore.loading"
      >
        <i class="bi bi-arrow-clockwise me-1"></i>
        Refresh
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="dockerStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ dockerStore.error }}
      <button type="button" class="btn-close" @click="dockerStore.setError(null)"></button>
    </div>

    <!-- Loading -->
    <div v-if="dockerStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading volumes...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="dockerStore.volumes.length === 0" class="text-center py-5">
      <i class="bi bi-hdd display-1 text-muted mb-3"></i>
      <h4 class="text-muted">No volumes found</h4>
      <p class="text-muted">No Docker volumes exist on this system</p>
    </div>

    <!-- Volumes Grouped by Usage -->
    <div v-else>
      <!-- Used Volumes -->
      <div v-if="dockerStore.groupedVolumes.used.length > 0" class="card mb-4">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">
            <i class="bi bi-check-circle me-2"></i>
            Volumes in Use ({{ dockerStore.groupedVolumes.used.length }})
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Volume Name</th>
                  <th>Driver</th>
                  <th>Used by Containers</th>
                  <th>Mount Point</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="volume in dockerStore.groupedVolumes.used" :key="volume.Name">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-hdd me-2 text-success"></i>
                      <div>
                        <div class="fw-medium">{{ volume.Name }}</div>
                        <small v-if="volume.Labels" class="text-muted">
                          {{ Object.keys(volume.Labels).length }} label(s)
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ volume.Driver }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span 
                        v-for="container in volume.containers" 
                        :key="container.Id"
                        class="badge bg-primary"
                        :title="container.Names[0]"
                      >
                        {{ container.Names[0].replace('/', '') }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <code class="text-muted">{{ volume.Mountpoint }}</code>
                  </td>
                  <td>
                    <small>{{ formatDate(volume.CreatedAt) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeVolume(volume.Name)"
                        title="Remove Volume"
                        :disabled="volume.containers.length > 0"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Orphaned Volumes -->
      <div v-if="dockerStore.groupedVolumes.orphaned.length > 0" class="card">
        <div class="card-header bg-warning text-dark">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Orphaned Volumes ({{ dockerStore.groupedVolumes.orphaned.length }})
            </h5>
            <button 
              class="btn btn-danger btn-sm"
              @click="removeAllOrphanedVolumes"
              title="Remove All Orphaned Volumes"
            >
              <i class="bi bi-trash me-1"></i>
              Remove All
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Volume Name</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Mount Point</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="volume in dockerStore.groupedVolumes.orphaned" :key="volume.Name">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-hdd me-2 text-warning"></i>
                      <div>
                        <div class="fw-medium">{{ volume.Name }}</div>
                        <small v-if="volume.Labels" class="text-muted">
                          {{ Object.keys(volume.Labels).length }} label(s)
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ volume.Driver }}</span>
                  </td>
                  <td>
                    <span class="badge bg-warning text-dark">
                      <i class="bi bi-exclamation-triangle me-1"></i>
                      Not in use
                    </span>
                  </td>
                  <td>
                    <code class="text-muted">{{ volume.Mountpoint }}</code>
                  </td>
                  <td>
                    <small>{{ formatDate(volume.CreatedAt) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeVolume(volume.Name)"
                        title="Remove Volume"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- No Volumes State -->
      <div v-if="dockerStore.groupedVolumes.used.length === 0 && dockerStore.groupedVolumes.orphaned.length === 0" class="text-center py-5">
        <i class="bi bi-hdd display-1 text-muted mb-3"></i>
        <h4 class="text-muted">No volumes found</h4>
        <p class="text-muted">No Docker volumes exist on this system</p>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmationModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="`bi me-2 ${confirmationData.icon}`"></i>
              {{ confirmationData.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>{{ confirmationData.message }}</p>
            <div v-if="confirmationData.type === 'danger'" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn" 
              :class="confirmationData.buttonClass"
              @click="confirmAction"
              data-bs-dismiss="modal"
            >
              {{ confirmationData.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Modal } from 'bootstrap'
import { useDockerStore } from '../stores/docker'

const dockerStore = useDockerStore()
const confirmationData = ref({})
const pendingAction = ref(null)

const showConfirmation = (title, message, type, icon, buttonText, buttonClass, action) => {
    confirmationData.value = {
        title,
        message,
        type,
        icon,
        buttonText,
        buttonClass
    }
    pendingAction.value = action

    const modal = new Modal(document.getElementById('confirmationModal'))
    modal.show()
}

const confirmAction = () => {
    if (pendingAction.value) {
        pendingAction.value()
        pendingAction.value = null
    }
}

const refreshVolumes = () => {
    dockerStore.fetchVolumes()
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
}

const removeVolume = (name) => {
    showConfirmation(
        'Remove Volume',
        `Are you sure you want to remove volume "${name}"?`,
        'danger',
        'bi-trash',
        'Remove',
        'btn-danger',
        () => dockerStore.removeVolume(name)
    )
}

const removeAllOrphanedVolumes = () => {
    const orphanedCount = dockerStore.groupedVolumes.orphaned.length

    showConfirmation(
        'Remove All Orphaned Volumes',
        `Remove all ${orphanedCount} orphaned volumes? This will permanently delete all unused volume data.`,
        'danger',
        'bi-trash',
        'Remove All',
        'btn-danger',
        () => {
            dockerStore.groupedVolumes.orphaned.forEach(volume => {
                dockerStore.removeVolume(volume.Name)
            })
        }
    )
}
</script>

<style scoped>
.card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
    border-top: none;
    font-weight: 600;
}

.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
}

code {
    font-size: 0.875rem;
    background-color: #f8f9fa;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
}
</style>