<template>
  <div class="containers">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-box me-2"></i>Containers</h2>
      <div class="d-flex gap-2">
        <button 
          v-if="groupedContainers.groups.length > 0"
          class="btn btn-outline-secondary"
          @click="toggleExpandAll"
        >
          <i :class="`bi me-1 ${allGroupsExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`"></i>
          {{ allGroupsExpanded ? 'Collapse All' : 'Expand All' }}
        </button>
        <button 
          class="btn btn-outline-secondary"
          @click="toggleShowAll"
        >
          <i class="bi bi-eye me-1"></i>
          {{ showAll ? 'Show Running' : 'Show All' }}
        </button>
        <button 
          class="btn btn-outline-primary" 
          @click="refreshContainers"
          :disabled="dockerStore.loading"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
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
      <p class="mt-2">Loading containers...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="groupedContainers.groups.length === 0 && groupedContainers.ungrouped.length === 0" class="text-center py-5">
      <i class="bi bi-box display-1 text-muted mb-3"></i>
      <h4 class="text-muted">No containers found</h4>
      <p class="text-muted">
        {{ showAll ? 'No containers exist on this system' : 'No running containers found' }}
      </p>
    </div>

    <!-- Containers Table -->
    <div v-else class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 table-fixed">
            <thead class="table-light">
              <tr>
                <th style="width: 25%;">Container</th>
                <th style="width: 20%;">Image</th>
                <th style="width: 12%;">Status</th>
                <th style="width: 18%;">Ports</th>
                <th style="width: 12%;">Created</th>
                <th style="width: 13%;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Grouped Containers -->
              <template v-for="group in groupedContainers.groups" :key="group.key">
                <!-- Group Header Row -->
                <tr class="group-header table-secondary cursor-pointer" @click="toggleGroup(group.key)">
                  <td colspan="6" class="py-2">
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <button 
                          class="btn btn-sm btn-link p-0 me-2"
                          @click.stop="toggleGroup(group.key)"
                          type="button"
                        >
                          <i class="bi" :class="isGroupExpanded(group.key) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                        </button>
                        <i class="bi me-2" :class="group.type === 'compose' ? 'bi-stack' : 'bi-diagram-3'"></i>
                        <strong>
                          {{ group.type === 'compose' ? 'Docker Compose' : 'Network' }}: {{ group.name }}
                        </strong>
                        <span class="badge bg-info ms-2">{{ group.containers.length }} containers</span>
                      </div>
                      
                      <!-- Group Action Buttons -->
                      <div class="btn-group btn-group-sm" role="group" @click.stop>
                        <button 
                          v-if="getGroupRunningCount(group) < group.containers.length"
                          class="btn btn-outline-success"
                          @click.stop="startGroup(group)"
                          title="Start All Containers in Group"
                        >
                          <i class="bi bi-play-fill"></i>
                          <span class="d-none d-md-inline ms-1">Start All</span>
                        </button>
                        <button 
                          v-if="getGroupRunningCount(group) > 0"
                          class="btn btn-outline-warning"
                          @click.stop="stopGroup(group)"
                          title="Stop All Containers in Group"
                        >
                          <i class="bi bi-stop-fill"></i>
                          <span class="d-none d-md-inline ms-1">Stop All</span>
                        </button>
                        <button 
                          class="btn btn-outline-info"
                          @click.stop="restartGroup(group)"
                          title="Restart All Containers in Group"
                        >
                          <i class="bi bi-arrow-clockwise"></i>
                          <span class="d-none d-md-inline ms-1">Restart All</span>
                        </button>
                        <button 
                          class="btn btn-outline-danger"
                          @click.stop="removeGroup(group)"
                          title="Remove All Containers in Group"
                        >
                          <i class="bi bi-trash"></i>
                          <span class="d-none d-md-inline ms-1">Remove All</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <!-- Group Container Rows (collapsible) -->
                <template v-if="isGroupExpanded(group.key)">
                  <tr 
                    v-for="container in group.containers" 
                    :key="container.Id"
                    class="cursor-pointer group-container"
                    @click="goToContainerDetails(container.Id)"
                  >
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="ms-3 me-2" style="width: 20px;"></div>
                        <i class="bi bi-box me-2 text-primary"></i>
                        <div>
                          <div class="fw-medium">{{ getContainerName(container) }}</div>
                          <small class="text-muted">{{ container.Id.slice(0, 12) }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark">{{ container.Image }}</span>
                    </td>
                    <td>
                      <span 
                        class="badge" 
                        :class="getStatusBadgeClass(container.State)"
                      >
                        <i :class="getStatusIcon(container.State)" class="me-1"></i>
                        {{ container.State }}
                      </span>
                    </td>
                    <td>
                      <ContainerPorts :ports="container.Ports" :max-display="2" :container-name="getContainerName(container)" />
                    </td>
                    <td>
                      <small>{{ formatDate(container.Created) }}</small>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm" role="group">
                        <button 
                          v-if="container.State === 'exited'"
                          class="btn btn-outline-success"
                          @click.stop="startContainer(container.Id)"
                          title="Start"
                        >
                          <i class="bi bi-play-fill"></i>
                        </button>
                        <button 
                          v-if="container.State === 'running'"
                          class="btn btn-outline-warning"
                          @click.stop="stopContainer(container.Id)"
                          title="Stop"
                        >
                          <i class="bi bi-stop-fill"></i>
                        </button>
                        <button 
                          class="btn btn-outline-info"
                          @click.stop="showLogs(container)"
                          title="View Logs"
                        >
                          <i class="bi bi-file-text"></i>
                        </button>
                        <button 
                          class="btn btn-outline-danger"
                          @click.stop="removeContainer(container.Id, container.State === 'running')"
                          title="Remove"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>

              <!-- Ungrouped Containers -->
              <tr 
                v-for="container in groupedContainers.ungrouped" 
                :key="container.Id"
                class="cursor-pointer"
                @click="goToContainerDetails(container.Id)"
              >
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-box me-2 text-primary"></i>
                    <div>
                      <div class="fw-medium">{{ getContainerName(container) }}</div>
                      <small class="text-muted">{{ container.Id.slice(0, 12) }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark">{{ container.Image }}</span>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="getStatusBadgeClass(container.State)"
                  >
                    <i :class="getStatusIcon(container.State)" class="me-1"></i>
                    {{ container.State }}
                  </span>
                </td>
                <td>
                  <ContainerPorts :ports="container.Ports" :max-display="2" :container-name="getContainerName(container)" />
                </td>
                <td>
                  <small>{{ formatDate(container.Created) }}</small>
                </td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      v-if="container.State === 'exited'"
                      class="btn btn-outline-success"
                      @click.stop="startContainer(container.Id)"
                      title="Start"
                    >
                      <i class="bi bi-play-fill"></i>
                    </button>
                    <button 
                      v-if="container.State === 'running'"
                      class="btn btn-outline-warning"
                      @click.stop="stopContainer(container.Id)"
                      title="Stop"
                    >
                      <i class="bi bi-stop-fill"></i>
                    </button>
                    <button 
                      class="btn btn-outline-info"
                      @click.stop="showLogs(container)"
                      title="View Logs"
                    >
                      <i class="bi bi-file-text"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger"
                      @click.stop="removeContainer(container.Id, container.State === 'running')"
                      title="Remove"
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

    <!-- Logs Modal -->
    <div class="modal fade" id="logsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-file-text me-2"></i>
              Container Logs: {{ selectedContainer?.name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingLogs" class="text-center py-3">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2">Loading logs...</p>
            </div>
            <div v-else-if="containerLogs" class="logs-container">{{ containerLogs }}</div>
            <div v-else class="text-center py-3 text-muted">
              <p>No logs available</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDockerStore } from '../stores/docker'
import apiService from '../services/api'
import { Modal } from 'bootstrap'
import ContainerPorts from '../components/docker/ContainerPorts.vue'

const router = useRouter()
const dockerStore = useDockerStore()
const showAll = ref(true)
const selectedContainer = ref(null)
const containerLogs = ref('')
const loadingLogs = ref(false)
const expandedGroups = ref(new Set())
const confirmationData = ref({
    title: '',
    message: '',
    icon: '',
    type: '',
    buttonText: '',
    buttonClass: '',
    action: null
})

const filteredContainers = computed(() => {
    if (showAll.value) {
        return dockerStore.containers
    }
    return dockerStore.runningContainers
})

const groupedContainers = computed(() => {
    const containers = filteredContainers.value
    const groups = new Map()
    const ungrouped = []

    containers.forEach(container => {
        let groupKey = null

        // Try to get docker-compose project name from labels
        if (container.Labels) {
            const composeProject = container.Labels['com.docker.compose.project']
            if (composeProject) {
                groupKey = `compose:${composeProject}`
            }
        }

        // If no compose project, try to group by network (exclude default networks)
        if (!groupKey && container.NetworkSettings?.Networks) {
            const networks = Object.keys(container.NetworkSettings.Networks)
            const customNetworks = networks.filter(net =>
                !['bridge', 'host', 'none'].includes(net) && !net.startsWith('br-')
            )
            if (customNetworks.length > 0) {
                groupKey = `network:${customNetworks[0]}`
            }
        }

        if (groupKey) {
            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    key: groupKey,
                    name: groupKey.split(':')[1],
                    type: groupKey.split(':')[0],
                    containers: []
                })
            }
            groups.get(groupKey).containers.push(container)
        } else {
            ungrouped.push(container)
        }
    })

    // Filter out groups with only one container
    const validGroups = Array.from(groups.values()).filter(group => group.containers.length > 1)

    // Add single containers from filtered groups back to ungrouped
    groups.forEach(group => {
        if (group.containers.length === 1) {
            ungrouped.push(group.containers[0])
        }
    })

    return {
        groups: validGroups,
        ungrouped: ungrouped
    }
})

const allGroupsExpanded = computed(() => {
    const groups = groupedContainers.value.groups
    if (groups.length === 0) return false
    return groups.every(group => isGroupExpanded(group.key))
})

const toggleShowAll = () => {
    showAll.value = !showAll.value
}

const refreshContainers = () => {
    dockerStore.fetchContainers()
}

const goToContainerDetails = (containerId) => {
    router.push(`/containers/${containerId}`)
}

const toggleGroup = (groupKey) => {
    if (expandedGroups.value.has(groupKey)) {
        expandedGroups.value.delete(groupKey)
        expandedGroups.value.add(`collapsed:${groupKey}`)
    } else {
        expandedGroups.value.add(groupKey)
        expandedGroups.value.delete(`collapsed:${groupKey}`)
    }
}

const isGroupExpanded = (groupKey) => {
    // Auto-expand groups by default if not explicitly collapsed
    if (!expandedGroups.value.has(groupKey) && !expandedGroups.value.has(`collapsed:${groupKey}`)) {
        expandedGroups.value.add(groupKey)
    }
    return expandedGroups.value.has(groupKey)
}

const toggleExpandAll = () => {
    const groups = groupedContainers.value.groups
    const shouldExpand = !allGroupsExpanded.value

    groups.forEach(group => {
        if (shouldExpand) {
            expandedGroups.value.add(group.key)
            expandedGroups.value.delete(`collapsed:${group.key}`)
        } else {
            expandedGroups.value.delete(group.key)
            expandedGroups.value.add(`collapsed:${group.key}`)
        }
    })
}

const getGroupRunningCount = (group) => {
    return group.containers.filter(container => container.State === 'running').length
}

const startGroup = async (group) => {
    const stoppedContainers = group.containers.filter(container => container.State === 'exited')
    if (stoppedContainers.length === 0) return

    showConfirmation(
        'Start Group',
        `Start all stopped containers in ${group.name}? (${stoppedContainers.length} containers)`,
        'bi-play-fill',
        'success',
        'Start All',
        'btn-success',
        async () => {
            for (const container of stoppedContainers) {
                try {
                    await dockerStore.startContainer(container.Id)
                } catch (error) {
                    console.error(`Failed to start container ${container.Id}:`, error)
                }
            }
        }
    )
}

const stopGroup = async (group) => {
    const runningContainers = group.containers.filter(container => container.State === 'running')
    if (runningContainers.length === 0) return

    showConfirmation(
        'Stop Group',
        `Stop all running containers in ${group.name}? (${runningContainers.length} containers)`,
        'bi-stop-fill',
        'warning',
        'Stop All',
        'btn-warning',
        async () => {
            for (const container of runningContainers) {
                try {
                    await dockerStore.stopContainer(container.Id)
                } catch (error) {
                    console.error(`Failed to stop container ${container.Id}:`, error)
                }
            }
        }
    )
}

const restartGroup = async (group) => {
    showConfirmation(
        'Restart Group',
        `Restart all containers in ${group.name}? (${group.containers.length} containers)`,
        'bi-arrow-clockwise',
        'info',
        'Restart All',
        'btn-info',
        async () => {
            for (const container of group.containers) {
                try {
                    if (container.State === 'running') {
                        await dockerStore.stopContainer(container.Id)
                        // Small delay to ensure container stops before restart
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                    await dockerStore.startContainer(container.Id)
                } catch (error) {
                    console.error(`Failed to restart container ${container.Id}:`, error)
                }
            }
        }
    )
}

const removeGroup = async (group) => {
    showConfirmation(
        'Remove Group',
        `Remove all containers in ${group.name}? (${group.containers.length} containers)`,
        'bi-trash',
        'danger',
        'Remove All',
        'btn-danger',
        async () => {
            for (const container of group.containers) {
                try {
                    const force = container.State === 'running'
                    await dockerStore.removeContainer(container.Id, force)
                } catch (error) {
                    console.error(`Failed to remove container ${container.Id}:`, error)
                }
            }
        }
    )
}

const showConfirmation = (title, message, icon, type, buttonText, buttonClass, action) => {
    confirmationData.value = {
        title,
        message,
        icon,
        type,
        buttonText,
        buttonClass,
        action
    }

    const modalElement = document.getElementById('confirmationModal')
    if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
    }
}

const confirmAction = () => {
    if (confirmationData.value.action) {
        confirmationData.value.action()
    }
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
        case 'restarting':
            return 'bg-info'
        default:
            return 'bg-secondary'
    }
}

const getStatusIcon = (status) => {
    switch (status) {
        case 'running':
            return 'bi-play-fill'
        case 'exited':
            return 'bi-stop-fill'
        case 'paused':
            return 'bi-pause-fill'
        case 'restarting':
            return 'bi-arrow-clockwise'
        default:
            return 'bi-question-circle'
    }
}

const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString()
}

const startContainer = (id) => {
    dockerStore.startContainer(id)
}

const stopContainer = (id) => {
    dockerStore.stopContainer(id)
}

const removeContainer = (id, force) => {
    const containerName = dockerStore.containers.find(c => c.Id === id)?.Names?.[0]?.replace('/', '') || id.slice(0, 12)

    showConfirmation(
        'Remove Container',
        `Remove container "${containerName}"?`,
        'bi-trash',
        'danger',
        'Remove',
        'btn-danger',
        () => {
            dockerStore.removeContainer(id, force)
        }
    )
}

const showLogs = async (container) => {
    selectedContainer.value = {
        id: container.Id,
        name: getContainerName(container)
    }

    loadingLogs.value = true
    containerLogs.value = ''

    try {
        const response = await apiService.getContainerLogs(container.Id, 100)
        containerLogs.value = response.logs || 'No logs available'
    } catch (error) {
        console.error('Error loading logs:', error)
        containerLogs.value = `Error loading logs: ${error.message || 'Unknown error'}`
    } finally {
        loadingLogs.value = false
    }

    // Show modal using Bootstrap
    const modalElement = document.getElementById('logsModal')
    if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
    }
}

// Initialize containers on component mount
onMounted(() => {
    dockerStore.fetchContainers()
})
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
    user-select: none;
}

.cursor-pointer:hover {
    background-color: #f8f9fa;
}

.group-header {
    background-color: #f8f9fa !important;
    border-top: 2px solid #dee2e6;
    transition: background-color 0.15s ease-in-out;
}

.group-header:hover {
    background-color: #e9ecef !important;
}

.group-header.cursor-pointer:hover {
    background-color: #dee2e6 !important;
}

.group-container {
    background-color: #fafafa;
}

.group-container:hover {
    background-color: #f0f0f0 !important;
}

.btn-link {
    color: #6c757d;
    text-decoration: none;
}

.btn-link:hover {
    color: #495057;
}

.logs-container {
    background-color: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 0.375rem;
    max-height: 400px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
}

.card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-fixed {
    table-layout: fixed;
    width: 100%;
    min-width: 800px;
}

.table-fixed th,
.table-fixed td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
}

.table-fixed td:first-child,
.table-fixed th:first-child {
    white-space: normal;
}

.table-fixed td:nth-child(4) {
    white-space: normal;
    overflow: visible;
}

.table th {
    border-top: none;
    font-weight: 600;
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    z-index: 10;
}

.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
}
</style>