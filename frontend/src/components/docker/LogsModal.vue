<template>
  <GenericModal
    :modal-id="modalId"
    :title="`Container Logs: ${selectedContainer?.name || ''}`"
    icon="bi-file-text"
    dialog-class="modal-lg"
    content-class="code-container"
    loading-text="Loading logs..."
    empty-message="No logs available"
    ref="genericModal"
  /></template>

<script setup>
import { ref } from 'vue'
import GenericModal from './GenericModal.vue'
import apiService from '../../services/api'

const props = defineProps({
    modalId: {
        type: String,
        default: 'logsModal'
    }
})

const selectedContainer = ref(null)
const genericModal = ref(null)

const showLogs = async (container) => {
    selectedContainer.value = {
        id: container.Id,
        name: getContainerName(container)
    }

    genericModal.value.setLoading(true)
    genericModal.value.setContent('')

    try {
        const response = await apiService.getContainerLogs(container.Id, 100)
        const logs = response || 'No logs available'
        genericModal.value.setContent(logs)
    } catch (error) {
        console.error('Error loading logs:', error)
        genericModal.value.setContent(`Error loading logs: ${error.message || 'Unknown error'}`)
    } finally {
        genericModal.value.setLoading(false)
    }

    genericModal.value.show()
}

const getContainerName = (container) => {
    return container.Names?.[0]?.replace('/', '') || container.Id.slice(0, 12)
}

defineExpose({
    showLogs
})
</script><style scoped>
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