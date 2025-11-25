<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
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
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Loading logs...</p>
          </div>
          <div v-else-if="logs" class="logs-container">{{ logs }}</div>
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
</template>

<script setup>
import { ref } from 'vue'
import { Modal } from 'bootstrap'
import apiService from '../../services/api'

const props = defineProps({
    modalId: {
        type: String,
        default: 'logsModal'
    }
})

const selectedContainer = ref(null)
const logs = ref('')
const loading = ref(false)

const showLogs = async (container) => {
    selectedContainer.value = {
        id: container.Id,
        name: getContainerName(container)
    }

    loading.value = true
    logs.value = ''

    try {
        const response = await apiService.getContainerLogs(container.Id, 100)
        logs.value = response || 'No logs available'
    } catch (error) {
        console.error('Error loading logs:', error)
        logs.value = `Error loading logs: ${error.message || 'Unknown error'}`
    } finally {
        loading.value = false
    }

    // Show modal using Bootstrap
    const modalElement = document.getElementById(props.modalId)
    if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
    }
}

const getContainerName = (container) => {
    return container.Names?.[0]?.replace('/', '') || container.Id.slice(0, 12)
}

defineExpose({
    showLogs
})
</script>

<style scoped>
.logs-container {
    background-color: #212529;
    color: #adb5bd;
    padding: 1rem;
    border-radius: 0.375rem;
    max-height: 400px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
    border: 1px solid #495057;
}
</style>