<template>
  <div class="images">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-layers me-2"></i>Images</h2>
      <button 
        class="btn btn-outline-primary" 
        @click="refreshImages"
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
                        :title="container.Names[0]"
                      >
                        {{ container.Names[0].replace('/', '') }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDockerStore } from '../stores/docker'
import { Modal } from 'bootstrap'

const dockerStore = useDockerStore()
const confirmationData = ref({
  title: '',
  message: '',
  icon: '',
  type: '',
  buttonText: '',
  buttonClass: '',
  action: null
})

const refreshImages = () => {
  dockerStore.fetchImages()
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
  return new Date(timestamp * 1000).toLocaleString()
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