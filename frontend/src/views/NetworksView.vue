<template>
  <div class="networks">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-diagram-3 me-2"></i>Networks</h2>
      <button 
        class="btn btn-outline-primary" 
        @click="refreshNetworks"
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
      <p class="mt-2">Loading networks...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="dockerStore.networks.length === 0" class="text-center py-5">
      <i class="bi bi-diagram-3 display-1 text-muted mb-3"></i>
      <h4 class="text-muted">No networks found</h4>
      <p class="text-muted">No Docker networks exist on this system</p>
    </div>

    <!-- Networks Grouped by Usage -->
    <div v-else>
      <!-- Used Networks -->
      <div v-if="dockerStore.groupedNetworks.used.length > 0" class="card mb-4">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">
            <i class="bi bi-check-circle me-2"></i>
            Networks in Use ({{ dockerStore.groupedNetworks.used.length }})
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Network Name</th>
                  <th>Network ID</th>
                  <th>Driver</th>
                  <th>Used by Containers</th>
                  <th>Scope</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="network in dockerStore.groupedNetworks.used" :key="network.Id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-diagram-3 me-2" :class="network.isSystem ? 'text-info' : 'text-success'"></i>
                      <div>
                        <div class="fw-medium">
                          {{ network.Name }}
                          <span v-if="network.isSystem" class="badge bg-info ms-2">System</span>
                        </div>
                        <small v-if="network.Labels" class="text-muted">
                          {{ Object.keys(network.Labels).length }} label(s)
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code class="text-muted">{{ network.Id.slice(0, 12) }}</code>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ network.Driver }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span 
                        v-for="container in network.containers" 
                        :key="container.Id"
                        class="badge bg-primary"
                        :title="container.Names[0]"
                      >
                        {{ container.Names[0].replace('/', '') }}
                      </span>
                      <span v-if="network.containers.length === 0 && network.isSystem" class="badge bg-info">
                        System network
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getScopeBadgeClass(network.Scope)">
                      {{ network.Scope }}
                    </span>
                  </td>
                  <td>
                    <small>{{ formatDate(network.Created) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeNetwork(network.Id, network.Name)"
                        :disabled="isSystemNetwork(network.Name) || network.containers.length > 0"
                        :title="getRemoveTitle(network)"
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

      <!-- Orphaned Networks -->
      <div v-if="dockerStore.groupedNetworks.orphaned.length > 0" class="card">
        <div class="card-header bg-warning text-dark">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Orphaned Networks ({{ dockerStore.groupedNetworks.orphaned.length }})
            </h5>
            <button 
              class="btn btn-danger btn-sm"
              @click="removeAllOrphanedNetworks"
              title="Remove All Orphaned Networks"
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
                  <th>Network Name</th>
                  <th>Network ID</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Scope</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="network in dockerStore.groupedNetworks.orphaned" :key="network.Id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-diagram-3 me-2 text-warning"></i>
                      <div>
                        <div class="fw-medium">{{ network.Name }}</div>
                        <small v-if="network.Labels" class="text-muted">
                          {{ Object.keys(network.Labels).length }} label(s)
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code class="text-muted">{{ network.Id.slice(0, 12) }}</code>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ network.Driver }}</span>
                  </td>
                  <td>
                    <span class="badge bg-warning text-dark">
                      <i class="bi bi-exclamation-triangle me-1"></i>
                      Not in use
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="getScopeBadgeClass(network.Scope)">
                      {{ network.Scope }}
                    </span>
                  </td>
                  <td>
                    <small>{{ formatDate(network.Created) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeNetwork(network.Id, network.Name)"
                        title="Remove Network"
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

      <!-- No Networks State -->
      <div v-if="dockerStore.groupedNetworks.used.length === 0 && dockerStore.groupedNetworks.orphaned.length === 0" class="text-center py-5">
        <i class="bi bi-diagram-3 display-1 text-muted mb-3"></i>
        <h4 class="text-muted">No networks found</h4>
        <p class="text-muted">No Docker networks exist on this system</p>
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
            <div v-if="confirmationData.type === 'warning'" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ confirmationData.warningMessage }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ confirmationData.type === 'info' ? 'OK' : 'Cancel' }}
            </button>
            <button 
              v-if="confirmationData.type !== 'info'"
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

const showConfirmation = (title, message, type, icon, buttonText, buttonClass, action, warningMessage = null) => {
    confirmationData.value = {
        title,
        message,
        type,
        icon,
        buttonText,
        buttonClass,
        warningMessage
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

const refreshNetworks = () => {
    dockerStore.fetchNetworks()
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
}

const getScopeBadgeClass = (scope) => {
    switch (scope) {
        case 'global':
            return 'bg-success'
        case 'local':
            return 'bg-primary'
        default:
            return 'bg-secondary'
    }
}

const isSystemNetwork = (name) => {
    const systemNetworks = ['bridge', 'host', 'none']
    return systemNetworks.includes(name)
}

const getRemoveTitle = (network) => {
    if (network.isSystem) {
        return 'Cannot remove system network'
    }
    if (network.containers.length > 0) {
        return 'Cannot remove network with active containers'
    }
    return 'Remove Network'
}

const removeNetwork = (id, name) => {
    if (isSystemNetwork(name)) {
        showConfirmation(
            'System Network',
            `Cannot remove system network "${name}".`,
            'info',
            'bi-info-circle',
            null,
            null,
            null,
            'System networks (bridge, host, none) are required for Docker operation and cannot be removed.'
        )
        return
    }

    showConfirmation(
        'Remove Network',
        `Are you sure you want to remove network "${name}"?`,
        'danger',
        'bi-trash',
        'Remove',
        'btn-danger',
        () => dockerStore.removeNetwork(id)
    )
}

const removeAllOrphanedNetworks = () => {
    const orphanedCount = dockerStore.groupedNetworks.orphaned.length

    showConfirmation(
        'Remove All Orphaned Networks',
        `Remove all ${orphanedCount} orphaned networks? This will clean up unused network configurations.`,
        'danger',
        'bi-trash',
        'Remove All',
        'btn-danger',
        () => {
            dockerStore.groupedNetworks.orphaned.forEach(network => {
                dockerStore.removeNetwork(network.Id)
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

.btn:disabled {
    opacity: 0.3;
}

code {
    font-size: 0.875rem;
    background-color: #f8f9fa;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
}
</style>