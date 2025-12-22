<template>
  <div class="images">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-layers me-2"></i>Images</h2>
      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-success" 
          @click="openPullModal"
          title="Pull a new image from Docker Hub"
        >
          <i class="bi bi-cloud-download me-1"></i>
          Pull Image
        </button>
        <button 
          class="btn btn-outline-primary" 
          @click="refreshImages"
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
      <p class="mt-2">Loading images...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="dockerStore.images.length === 0" class="text-center py-5">
      <i class="bi bi-layers display-1 text-muted mb-3"></i>
      <h4 class="text-muted">No images found</h4>
      <p class="text-muted">No Docker images exist on this system</p>
    </div>

    <!-- Images Grouped by Usage -->
    <div v-else>
      <!-- Used Images -->
      <div v-if="dockerStore.groupedImages.used.length > 0" class="card mb-4">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">
            <i class="bi bi-check-circle me-2"></i>
            Images in Use ({{ dockerStore.groupedImages.used.length }})
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Repository</th>
                  <th>Tag</th>
                  <th>Image ID</th>
                  <th>Used by Containers</th>
                  <th>Created</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="image in dockerStore.groupedImages.used" :key="image.Id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-layers me-2 text-success"></i>
                      <div>
                        <div class="fw-medium">{{ getRepository(image) }}</div>
                        <small v-if="image.RepoDigests && image.RepoDigests.length > 0" class="text-muted">
                          {{ image.RepoDigests[0].split('@')[1]?.slice(0, 12) }}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ getTag(image) }}</span>
                  </td>
                  <td>
                    <code class="text-muted">{{ image.Id.replace('sha256:', '').slice(0, 12) }}</code>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span 
                        v-for="container in image.containers" 
                        :key="container.Id"
                        class="badge bg-primary"
                        :title="container.Names?.[0] || 'Unknown'"
                      >
                        {{ (container.Names?.[0] || 'Unknown').replace('/', '') }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <small>{{ formatDate(image.Created) }}</small>
                  </td>
                  <td>
                    <span class="badge bg-info text-white">{{ formatSize(image.Size) }}</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeImage(image.Id)"
                        title="Remove Image"
                        :disabled="image.containers.length > 0"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                      <button
                        class="btn btn-outline-success"
                        @click="openRunContainerModal(image)"
                        title="Run container from this image"
                      >
                        <i class="bi bi-play-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Orphaned Images -->
      <div v-if="dockerStore.groupedImages.orphaned.length > 0" class="card">
        <div class="card-header bg-warning text-dark">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Orphaned Images ({{ dockerStore.groupedImages.orphaned.length }})
            </h5>
            <button 
              class="btn btn-danger btn-sm"
              @click="removeAllOrphanedImages"
              title="Remove All Orphaned Images"
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
                  <th>Repository</th>
                  <th>Tag</th>
                  <th>Image ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="image in dockerStore.groupedImages.orphaned" :key="image.Id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-layers me-2 text-warning"></i>
                      <div>
                        <div class="fw-medium">{{ getRepository(image) }}</div>
                        <small v-if="image.RepoDigests && image.RepoDigests.length > 0" class="text-muted">
                          {{ image.RepoDigests[0].split('@')[1]?.slice(0, 12) }}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ getTag(image) }}</span>
                  </td>
                  <td>
                    <code class="text-muted">{{ image.Id.replace('sha256:', '').slice(0, 12) }}</code>
                  </td>
                  <td>
                    <span class="badge bg-warning text-dark">
                      <i class="bi bi-exclamation-triangle me-1"></i>
                      Not in use
                    </span>
                  </td>
                  <td>
                    <small>{{ formatDate(image.Created) }}</small>
                  </td>
                  <td>
                    <span class="badge bg-info text-white">{{ formatSize(image.Size) }}</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        class="btn btn-outline-danger"
                        @click="removeImage(image.Id)"
                        title="Remove Image"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                      <button
                        class="btn btn-outline-success"
                        @click="openRunContainerModal(image)"
                        title="Run container from this image"
                      >
                        <i class="bi bi-play-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- No Images State -->
      <div v-if="dockerStore.groupedImages.used.length === 0 && dockerStore.groupedImages.orphaned.length === 0" class="text-center py-5">
        <i class="bi bi-layers display-1 text-muted mb-3"></i>
        <h4 class="text-muted">No images found</h4>
        <p class="text-muted">No Docker images exist on this system</p>
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

    <!-- Docker Pull Modal -->
    <DockerExecutionModal
      :command-to-execute="commandToExecute"
      :display-command="displayCommand"
      :is-executing="isExecuting"
      :execution-result="executionResult"
      :can-execute-command="canExecuteCommand"
      :persistent-selections="persistentSelections"
      :loading-states="loadingStates"
      :available-options="availableOptions"
      @execute-open-current-command="performOpenCommand"
      @execute-current-command="executeCurrentCommand"
      @update:persistent-selections="persistentSelections = $event"
      @load-dropdown-data="loadDropdownData"
      @reset-execution="resetExecution"
    />

    <!-- Run Container Modal -->
    <RunContainerModal
      ref="runContainerModal"
      @run="executeRunCommand"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDockerStore } from '../stores/docker'
import { Modal } from 'bootstrap'
import DockerExecutionModal from '@/components/docker/DockerExecutionModal.vue'
import RunContainerModal from '@/components/docker/RunContainerModal.vue'
import serviceApi from '@/services/api'

const dockerStore = useDockerStore()
const router = useRouter()
const confirmationData = ref({
  title: '',
  message: '',
  icon: '',
  type: '',
  buttonText: '',
  buttonClass: '',
  action: null
})

// Docker pull modal state
const commandToExecute = ref('')
const persistentSelections = ref({
  container: '',
  image: '',
  tag: '',
  volume: '',
  network: '',
  service: ''
})
const isExecuting = ref(false)
const executionResult = ref(null)
const loadingStates = ref({
  containers: false,
  images: false,
  tags: false,
  volumes: false,
  networks: false,
  services: false
})
const availableOptions = ref({
  containers: [],
  images: [],
  tags: [],
  volumes: [],
  networks: [],
  services: []
})

const displayCommand = computed(() => {
  // Use HTML-escaped placeholders because the modal renders with v-html
  const esc = (s) => s.replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  if (persistentSelections.value.image && persistentSelections.value.image.trim() !== '') {
    let cmd = `docker pull ${persistentSelections.value.image}`
    if (persistentSelections.value.tag && persistentSelections.value.tag.trim() !== '') {
      cmd += `:${persistentSelections.value.tag}`
    } else {
      cmd += `:${esc('<tag>')}`
    }
    return cmd
  }
  return `docker pull ${esc('<image>')}:${esc('<tag>')}`
})

const canExecuteCommand = computed(() => {
  // Only require image, tag is optional
  return persistentSelections.value.image !== ''
})

const refreshImages = () => {
  dockerStore.fetchImages()
}
const runContainerModal = ref(null)
const openRunContainerModal = (image) => {
  const repo = getRepository(image)
  const tag = getTag(image)
  runContainerModal.value?.showForImage(repo, tag)
}

const executeRunCommand = async (command) => {
  // Execute docker run command coming from modal
  isExecuting.value = true
  executionResult.value = null
  try {
    const response = await serviceApi.executeCommand(
      { command },
      dockerStore.containerSource
    )
    executionResult.value = response

    // If successful, show feedback, reset form, and close modal
    if (response && response.success !== false) {
      runContainerModal.value?.showSuccess('Container started successfully!')
      runContainerModal.value?.resetForm?.()

      // Close modal after showing success message
      setTimeout(() => {
        runContainerModal.value?.hide?.()
      }, 2000)
    }

    // Refresh containers list after running
    setTimeout(() => {
      dockerStore.fetchContainers?.()
    }, 1000)
  } catch (error) {
    console.error('Run command failed:', error)
    executionResult.value = {
      success: false,
      error: error.message,
      output: null
    }
  } finally {
    isExecuting.value = false
  }
}

const openPullModal = async () => {
  commandToExecute.value = 'docker pull <image>:<tag>'
  persistentSelections.value = {
    container: '',
    image: '',
    tag: '',
    volume: '',
    network: '',
    service: ''
  }

  await nextTick()

  const modalElement = document.getElementById('executionModal')
  if (modalElement) {
    const modal = new Modal(modalElement)
    modal.show()
  }
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

const getRepository = (image) => {
  if (image.RepoTags && image.RepoTags.length > 0) {
    return image.RepoTags[0].split(':')[0] || '<none>'
  }
  return '<none>'
}

const getTag = (image) => {
  if (image.RepoTags && image.RepoTags.length > 0) {
    return image.RepoTags[0].split(':')[1] || '<none>'
  }
  return '<none>'
}

const formatDate = (timestamp) => {
  // Handle string date format from backend: "2025-12-19 17:03:30 +0000 GMT"
  if (typeof timestamp === 'string') {
    try {
      // Remove "+0000 GMT" suffix and parse the date
      const dateStr = timestamp.replace(/\s+\+\d+\s+\w+$/, '');
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    } catch (e) {
      // Fall through to default behavior
    }
  }
  // Handle numeric timestamp (seconds since epoch)
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toLocaleString();
  }
  return 'Invalid Date';
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeImage = (id) => {
  const image = dockerStore.images.find(img => img.Id === id)
  const imageName = getRepository(image) + ':' + getTag(image)

  showConfirmation(
    'Remove Image',
    `Remove image "${imageName}"?`,
    'bi-trash',
    'danger',
    'Remove',
    'btn-danger',
    () => {
      dockerStore.removeImage(id)
    }
  )
}

const removeAllOrphanedImages = () => {
  const orphanedCount = dockerStore.groupedImages.orphaned.length

  showConfirmation(
    'Remove All Orphaned Images',
    `Remove all ${orphanedCount} orphaned images? This will free up disk space.`,
    'bi-trash',
    'danger',
    'Remove All',
    'btn-danger',
    () => {
      dockerStore.groupedImages.orphaned.forEach(image => {
        dockerStore.removeImage(image.Id)
      })
    }
  )
}

const loadDropdownData = async (dataType) => {
  // Handle loading dropdown data for images and tags
  if (dataType === 'images') {
    loadingStates.value.images = true
    try {
      const response = await serviceApi.searchImage('')
      availableOptions.value.images = response.results || []
    } catch (error) {
      console.error('Failed to load images:', error)
    } finally {
      loadingStates.value.images = false
    }
  }
}

const performOpenCommand = async () => {
  isExecuting.value = true
  executionResult.value = null
  try {
   
        let processedCommand = `docker pull ${persistentSelections.value.image}`;
    if (persistentSelections.value.tag && persistentSelections.value.tag.trim() !== '') {
      processedCommand += `:${persistentSelections.value.tag}`
    }
    await serviceApi.openCommand(
      { command: processedCommand },
      dockerStore.containerSource
    )
  } catch (error) {
    console.error('Command execution failed:', error)
    executionResult.value = {
      success: false,
      error: error.message,
      output: null
    }
  } finally {
    isExecuting.value = false
  }
}

const executeCurrentCommand = async () => {
  // Execute docker pull command
  isExecuting.value = true
  executionResult.value = null

  try {
    let command = `docker pull ${persistentSelections.value.image}`;
    if (persistentSelections.value.tag && persistentSelections.value.tag.trim() !== '') {
      command += `:${persistentSelections.value.tag}`
    }

    const response = await serviceApi.executeCommand(
      { command },
      dockerStore.containerSource
    )
    executionResult.value = response

    // If run container executed successfully, show feedback and reset form
    if (response && response.success && runContainerModal.value?.showSuccess) {
      runContainerModal.value.showSuccess('Container started successfully')
      runContainerModal.value.resetForm?.()
    }

    // Refresh images after pull
    setTimeout(() => {
      dockerStore.fetchImages()
    }, 1000)
  } catch (error) {
    console.error('Command execution failed:', error)
    executionResult.value = {
      success: false,
      error: error.message,
      output: null
    }
  } finally {
    isExecuting.value = false
  }
}

const resetExecution = () => {
  // Clear selections and results, restore default command
  persistentSelections.value = {
    container: '',
    image: '',
    tag: '',
    volume: '',
    network: '',
    service: ''
  }
  executionResult.value = null
  isExecuting.value = false
  commandToExecute.value = 'docker pull <image>:<tag>'
  // Clear available options & loading states
  availableOptions.value = {
    containers: [],
    images: [],
    tags: [],
    volumes: [],
    networks: [],
    services: []
  }
  loadingStates.value = {
    containers: false,
    images: false,
    tags: false,
    volumes: false,
    networks: false,
    services: false
  }
}

// Initialize images on component mount
onMounted(() => {
  dockerStore.fetchImages()
})
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