<template>
  <div class="containers">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-box me-2"></i>Containers</h2>
      <div class="d-flex gap-2">
        <button 
          v-if="hasGroups"
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
    <div v-else-if="!hasContainers" class="text-center py-5">
      <i class="bi bi-box display-1 text-muted mb-3"></i>
      <h4 class="text-muted">No containers found</h4>
      <p class="text-muted">
        {{ showAll ? 'No containers exist on this system' : 'No running containers found' }}
      </p>
    </div>

    <!-- Containers Table -->
    <ContainerTable
      v-else
      :containers="filteredContainers"
      :expanded-groups="expandedGroups"
      @toggleGroup="toggleGroup"
      @startGroup="startGroup"
      @stopGroup="stopGroup"
      @restartGroup="restartGroup"
      @removeGroup="removeGroup"
      @viewComposeFile="viewComposeFile"
      @navigate="goToContainerDetails"
      @start="startContainer"
      @stop="stopContainer"
      @logs="showLogs"
      @remove="removeContainer"
    />

    <!-- Modals -->
    <LogsModal ref="logsModal" />
    <ConfirmationModal ref="confirmationModal" />
    <ComposeModal ref="composeModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDockerStore } from '../stores/docker'
import ContainerTable from '../components/docker/ContainerTable.vue'
import LogsModal from '../components/docker/LogsModal.vue'
import ConfirmationModal from '../components/docker/ConfirmationModal.vue'
import ComposeModal from '../components/docker/ComposeModal.vue'

const router = useRouter()
const dockerStore = useDockerStore()
const showAll = ref(true)
const expandedGroups = ref(new Set())

// Component refs
const logsModal = ref(null)
const confirmationModal = ref(null)
const composeModal = ref(null)

const filteredContainers = computed(() => {
  if (showAll.value) {
    return dockerStore.containers
  }
  return dockerStore.runningContainers
})

const hasContainers = computed(() => {
  return filteredContainers.value.length > 0
})

const hasGroups = computed(() => {
  // This will be calculated by ContainerTable component
  return filteredContainers.value.some(container => {
    return container.Labels?.['com.docker.compose.project'] ||
      (container.NetworkSettings?.Networks &&
        Object.keys(container.NetworkSettings.Networks).some(net =>
          !['bridge', 'host', 'none'].includes(net) && !net.startsWith('br-')
        ))
  })
})

const allGroupsExpanded = computed(() => {
  // Check if all non-collapsed groups are expanded
  const collapsedCount = Array.from(expandedGroups.value).filter(key => key.startsWith('collapsed:')).length
  const expandedCount = Array.from(expandedGroups.value).filter(key => !key.startsWith('collapsed:')).length
  return expandedCount > collapsedCount
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

const toggleExpandAll = () => {
  // Toggle all groups
  const shouldExpand = !allGroupsExpanded.value

  // Clear all existing states
  expandedGroups.value.clear()

  // Get all container groups and set their state
  if (hasGroups.value) {
    if (shouldExpand) {
      // Will be handled by ContainerTable component's auto-expand logic
    } else {
      // Mark all as collapsed
      filteredContainers.value.forEach(container => {
        let groupKey = null
        if (container.Labels?.['com.docker.compose.project']) {
          groupKey = `compose:${container.Labels['com.docker.compose.project']}`
        } else if (container.NetworkSettings?.Networks) {
          const networks = Object.keys(container.NetworkSettings.Networks)
          const customNetworks = networks.filter(net =>
            !['bridge', 'host', 'none'].includes(net) && !net.startsWith('br-')
          )
          if (customNetworks.length > 0) {
            groupKey = `network:${customNetworks[0]}`
          }
        }
        if (groupKey) {
          expandedGroups.value.add(`collapsed:${groupKey}`)
        }
      })
    }
  }
}

const startGroup = async (group) => {
  const stoppedContainers = group.containers.filter(container => container.State === 'exited')
  if (stoppedContainers.length === 0) return

  confirmationModal.value.showConfirmation(
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

  confirmationModal.value.showConfirmation(
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
  confirmationModal.value.showConfirmation(
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
  confirmationModal.value.showConfirmation(
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

const viewComposeFile = async (group) => {
  composeModal.value.viewComposeFile(group)
}

// All helper functions moved to their respective components

const startContainer = (id) => {
  dockerStore.startContainer(id)
}

const stopContainer = (id) => {
  dockerStore.stopContainer(id)
}

const removeContainer = (id, force) => {
  const containerName = dockerStore.containers.find(c => c.Id === id)?.Names?.[0]?.replace('/', '') || id.slice(0, 12)

  confirmationModal.value.showConfirmation(
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
  logsModal.value.showLogs(container)
}

// Initialize containers on component mount
onMounted(() => {
  dockerStore.fetchContainers()
})
</script>

<style scoped>
/* Minimal styles - most styling moved to components */
</style>