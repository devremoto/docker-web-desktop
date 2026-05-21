<template>
  <GenericModal
    :modal-id="modalId"
    :title="modalTitle"
    icon="bi-sliders2"
    dialog-class="modal-lg"
    ref="modalRef"
  >
    <template #body>
      <div class="vstack gap-3">
        <div class="alert alert-warning mb-0">
          <div class="fw-semibold mb-1">Two ways to apply the variable</div>
          <div>Save Variable writes to a shell profile inside the running container for future shell sessions. Recreate Container replaces the container with the same configuration and adds the variable to the actual container environment.</div>
        </div>

        <div v-if="isComposeManaged" class="alert alert-secondary mb-0">
          This container has Docker Compose labels. Recreating it here updates the live container, but it does not update the compose file.
        </div>

        <div v-if="errorMessage" class="alert alert-danger mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success mb-0">
          <i class="bi bi-check-circle me-2"></i>
          <pre class="mb-0 success-output">{{ successMessage }}</pre>
        </div>

        <div class="row g-3">
          <div class="col-md-5">
            <label for="envVarKey" class="form-label">Variable name</label>
            <input
              id="envVarKey"
              v-model.trim="form.key"
              type="text"
              class="form-control"
              placeholder="APP_ENV"
              :disabled="isBusy"
              @keyup.enter="saveToShellProfile"
            />
            <div class="form-text">Use letters, numbers, and underscores. The name must not start with a number.</div>
          </div>

          <div class="col-md-7">
            <label for="envVarValue" class="form-label">Value</label>
            <input
              id="envVarValue"
              v-model="form.value"
              type="text"
              class="form-control"
              placeholder="production"
              :disabled="isBusy"
              @keyup.enter="saveToShellProfile"
            />
          </div>
        </div>

        <div class="bg-light border rounded p-3">
          <div class="text-muted small mb-1">Target</div>
          <div class="fw-medium">{{ containerName }}</div>
          <div class="text-muted small">{{ containerImage }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isBusy">Close</button>
      <button type="button" class="btn btn-outline-primary" :disabled="!canSaveToShellProfile" @click="saveToShellProfile">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <i v-else class="bi bi-terminal me-2"></i>
        Save Variable
      </button>
      <button type="button" class="btn btn-primary" :disabled="!canRecreateContainer" @click="recreateContainer">
        <span v-if="isRecreating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <i v-else class="bi bi-arrow-repeat me-2"></i>
        Recreate Container
      </button>
    </template>
  </GenericModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import GenericModal from './GenericModal.vue'
import apiService from '../../services/api'
import { useDockerStore } from '../../stores/docker'

const props = defineProps({
    modalId: {
        type: String,
        default: 'setEnvironmentVariableModal'
    }
})

const dockerStore = useDockerStore()
const modalRef = ref(null)
const container = ref(null)
const isSubmitting = ref(false)
const isRecreating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = ref({
    key: '',
    value: ''
})

const emit = defineEmits(['saved', 'recreated'])

const envVarNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/

const containerName = computed(() => {
    return container.value?.Names?.[0]?.replace('/', '') || container.value?.Id?.slice(0, 12) || 'Container'
})

const containerImage = computed(() => {
    return container.value?.Image || 'Unknown image'
})

const modalTitle = computed(() => {
    return `Set Environment Variable: ${containerName.value}`
})

const isBusy = computed(() => isSubmitting.value || isRecreating.value)

const isComposeManaged = computed(() => {
    return Boolean(container.value?.Labels?.['com.docker.compose.project'])
})

const canSaveToShellProfile = computed(() => {
    return Boolean(
        container.value?.Id &&
        container.value?.State === 'running' &&
        form.value.key &&
        envVarNamePattern.test(form.value.key) &&
        !isBusy.value
    )
})

const canRecreateContainer = computed(() => {
    return Boolean(
        container.value?.Id &&
        form.value.key &&
        envVarNamePattern.test(form.value.key) &&
        !isBusy.value
    )
})

const resetState = () => {
    form.value = {
        key: '',
        value: ''
    }
    isSubmitting.value = false
    isRecreating.value = false
    errorMessage.value = ''
    successMessage.value = ''
}

const showForContainer = (containerData) => {
    container.value = containerData
    resetState()
    modalRef.value?.show()
}

const saveToShellProfile = async () => {
    if (!container.value?.Id) {
        errorMessage.value = 'No container selected.'
        return
    }

    if (container.value.State !== 'running') {
        errorMessage.value = 'The container must be running before you can set a variable inside it.'
        return
    }

    if (!envVarNamePattern.test(form.value.key)) {
        errorMessage.value = 'Enter a valid environment variable name.'
        return
    }

    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await apiService.setContainerEnvironmentVariableInShellProfile(
            container.value.Id,
            form.value.key,
            form.value.value,
            dockerStore.containerSource
        )

        successMessage.value = response || 'Environment variable saved for future shell sessions.'
        emit('saved', {
            containerId: container.value.Id,
            key: form.value.key,
            value: form.value.value
        })
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Failed to save the environment variable.'
    } finally {
        isSubmitting.value = false
    }
}

const recreateContainer = async () => {
    if (!container.value?.Id) {
        errorMessage.value = 'No container selected.'
        return
    }

    if (!envVarNamePattern.test(form.value.key)) {
        errorMessage.value = 'Enter a valid environment variable name.'
        return
    }

    isRecreating.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await apiService.recreateContainerWithEnvironmentVariable(
            container.value.Id,
            form.value.key,
            form.value.value,
            dockerStore.containerSource
        )

        await dockerStore.fetchContainers(dockerStore.containerSource)
        successMessage.value = response?.message || 'Container recreated with the updated environment variable.'
        emit('recreated', response)
        container.value = dockerStore.containers.find(item => item.Id === response.newId) || container.value
        modalRef.value?.hide()
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Failed to recreate the container.'
    } finally {
        isRecreating.value = false
    }
}

defineExpose({
    showForContainer
})
</script>

<style scoped>
.success-output {
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
}
</style>