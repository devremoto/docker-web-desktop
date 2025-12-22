<template>
  <div class="mb-4">
    <!-- WSL Distro Dropdown: Only show if source is wsl2 -->

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">Parameters:</h6>
      <button 
        type="button" 
        class="btn btn-sm btn-outline-secondary"
        @click="resetForm"
        :disabled="!hasAnySelection"
      >
        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
      </button>
    </div>
    
    <!-- Container Selection -->
    <div v-if="commandToExecute.includes('<container>')" class="mb-3">
      <label class="form-label">
        <i class="bi bi-box me-1"></i>Select Container:
      </label>
      <select 
        class="form-select" 
        :value="persistentSelections.container"
        @change="updateSelection('container', $event.target.value)"
        :disabled="loadingStates.containers"
      >
        <option value="">Choose a container...</option>
        <option 
          v-for="container in availableOptions.containers" 
          :key="container.Id" 
          :value="container.Names[0]"
        >
          {{ container.Names[0] }} ({{ container.Image }}) - {{ container.State }}
        </option>
      </select>
      <div v-if="loadingStates.containers" class="text-muted small mt-1">
        <i class="bi bi-arrow-clockwise spin me-1"></i>Loading containers...
      </div>
    </div>

    <!-- Image Selection -->
    <div v-if="commandToExecute.includes('<image>')" class="mb-3">
      <div class="d-flex align-items-center mb-2">
        <label class="form-label mb-0 me-3">
          <i class="bi bi-disc me-1"></i>Select Image:
        </label>
        
        <!-- Official Images Only Checkbox (right beside label) -->
        <div class="d-flex align-items-center">
          <input 
            class="form-check-input me-2" 
            type="checkbox" 
            id="officialOnlyCheck"
            v-model="officialOnly"
            @change="handleSearchInput"
          >
          <label class="form-check-label mb-0" for="officialOnlyCheck">
            <i class="bi bi-shield-check me-1"></i>Official images only
          </label>
        </div>
      </div>
      
      <!-- Docker Hub Search with Dropdown Overlay -->
      <div class="position-relative">
        <div class="input-group mb-2">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search Docker Hub (min 2 chars)..."
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="showSearchResults = searchQuery.length >= 2 && searchResults.length > 0"
            autocomplete="off"
          />
        </div>
        
        <!-- Docker Hub Search Results Dropdown Overlay -->
        <div 
          v-if="showSearchResults && searchResults.length > 0" 
          class="dropdown-overlay"
        >
          <div class="dropdown-menu show w-100">
            <button 
              v-for="(result, idx) in searchResults" 
              :key="idx"
              type="button"
              class="dropdown-item text-start"
              @click="selectSearchResult(result)"
            >
              <div class="d-flex justify-content-between align-items-start w-100">
                <div class="flex-grow-1">
                  <strong>{{ result.name }}</strong>
                  <div class="text-muted small" v-if="result.description">
                    {{ result.description.substring(0, 50) }}
                  </div>
                </div>
                <div class="text-muted small text-end ms-2">
                  <div>⭐ {{ result.star_count }}</div>
                  <div v-if="result.is_official" class="badge bg-primary">Official</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div v-if="isSearching" class="text-muted small mt-2">
          <i class="bi bi-arrow-clockwise spin me-1"></i>Searching Docker Hub...
        </div>
      </div>

      <!-- Selected Image Display -->
      <div v-if="persistentSelections.image" class="alert alert-info mt-2 mb-3">
        <i class="bi bi-check-circle me-2"></i>
        Selected: <strong>{{ persistentSelections.image }}</strong>
        <button 
          type="button" 
          class="btn-close float-end"
          @click="clearImageSelection"
        ></button>
      </div>

      <!-- Tag Selection for Docker Hub images (show right after image selection) -->
      <div v-if="shouldShowTagDropdown" class="mb-3">
        <label class="form-label">
          <i class="bi bi-tag me-1"></i>{{ needsTagTextInput ? 'Enter Tag:' : 'Select Tag:' }}
        </label>
        
        <!-- Text input for commands that need custom tags -->
        <input 
          v-if="needsTagTextInput"
          type="text"
          class="form-control" 
          placeholder="Enter tag name (e.g., myapp:latest, v1.0.0)..."
          :value="persistentSelections.tag"
          @input="updateSelection('tag', $event.target.value)"
        />
        
        <!-- Dropdown for commands that select from Docker Hub tags -->
        <select 
          v-else
          class="form-select" 
          :value="persistentSelections.tag"
          @change="updateSelection('tag', $event.target.value)"
          :disabled="tagsLoading || availableTags.length === 0"
        >
          <option value="">Choose a tag...</option>
          <option 
            v-for="tag in availableTags" 
            :key="tag.name" 
            :value="tag.name"
          >
            {{ tag.name }}
            <span v-if="tag.last_updated" class="text-muted"> ({{ formatDate(tag.last_updated) }})</span>
          </option>
        </select>
        <div v-if="!needsTagTextInput && tagsLoading" class="text-muted small mt-1">
          <i class="bi bi-arrow-clockwise spin me-1"></i>Loading tags...
        </div>
        <div v-else-if="!needsTagTextInput && availableTags.length === 0 && !tagsLoading" class="text-muted small mt-1">
          No tags found for this image
        </div>
        <div v-if="needsTagTextInput" class="text-muted small mt-1">
          <i class="bi bi-info-circle me-1"></i>Enter a custom tag name for this command
        </div>
      </div>

      <!-- Local Images Dropdown (only show if no image is selected) -->
      <div v-if="!persistentSelections.image" class="mt-3">
        <label class="form-label form-label-sm text-muted">
          <i class="bi bi-collection me-1"></i>Or choose from local images:
        </label>
        <select 
          class="form-select" 
          :value="persistentSelections.image"
          @change="updateSelection('image', $event.target.value)"
          :disabled="loadingStates.images"
        >
          <option value="">Choose a local image...</option>
          <option 
            v-for="image in availableOptions.images" 
            :key="image.Id" 
            :value="image.Id"
          >
            {{ image.RepoTags?.[0] || 'Untagged' }} (ID: {{ image.Id.substring(0, 12) }})
          </option>
        </select>
        <div v-if="loadingStates.images" class="text-muted small mt-1">
          <i class="bi bi-arrow-clockwise spin me-1"></i>Loading local images...
        </div>
      </div>
    </div>

    <!-- Volume Selection -->
    <div v-if="commandToExecute.includes('<volume>')" class="mb-3">
      <label class="form-label">
        <i class="bi bi-hdd me-1"></i>Select Volume:
      </label>
      <select 
        class="form-select" 
        :value="persistentSelections.volume"
        @change="updateSelection('volume', $event.target.value)"
        :disabled="loadingStates.volumes"
      >
        <option value="">Choose a volume...</option>
        <option 
          v-for="volume in availableOptions.volumes" 
          :key="volume.Name" 
          :value="volume.Name"
        >
          {{ volume.Name }} ({{ volume.Driver }})
        </option>
      </select>
      <div v-if="loadingStates.volumes" class="text-muted small mt-1">
        <i class="bi bi-arrow-clockwise spin me-1"></i>Loading volumes...
      </div>
    </div>

    <!-- Network Selection -->
    <div v-if="commandToExecute.includes('<network>')" class="mb-3">
      <label class="form-label">
        <i class="bi bi-diagram-3 me-1"></i>Select Network:
      </label>
      <select 
        class="form-select" 
        :value="persistentSelections.network"
        @change="updateSelection('network', $event.target.value)"
        :disabled="loadingStates.networks"
      >
        <option value="">Choose a network...</option>
        <option 
          v-for="network in availableOptions.networks" 
          :key="network.Id" 
          :value="network.Name"
        >
          {{ network.Name }} ({{ network.Driver }})
        </option>
      </select>
      <div v-if="loadingStates.networks" class="text-muted small mt-1">
        <i class="bi bi-arrow-clockwise spin me-1"></i>Loading networks...
      </div>
    </div>

    <!-- Service Selection -->
    <div v-if="commandToExecute.includes('<service>')" class="mb-3">
      <label class="form-label">
        <i class="bi bi-gear me-1"></i>Select Service:
      </label>
      <select 
        class="form-select" 
        :value="persistentSelections.service"
        @change="updateSelection('service', $event.target.value)"
        :disabled="loadingStates.services"
      >
        <option value="">Choose a service...</option>
        <option 
          v-for="service in availableOptions.services" 
          :key="service.Name" 
          :value="service.Name"
        >
          {{ service.Name }} ({{ service.Image }})
        </option>
      </select>
      <div v-if="loadingStates.services" class="text-muted small mt-1">
        <i class="bi bi-arrow-clockwise spin me-1"></i>Loading services...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import serviceApi from '@/services/api'
import { useDockerStore } from '@/stores/docker'
// Docker source from store
const dockerStore = useDockerStore()
const containerSource = computed(() => dockerStore.containerSource)

// WSL Distro logic
const wslDistros = ref([])
const selectedWslDistro = ref(localStorage.getItem('wslDistro') || '')

const fetchWslDistros = async () => {
  try {
    const response = await serviceApi.api.get('/wsl')
    wslDistros.value = response.data || []
    // Default to first if none selected
    if (!selectedWslDistro.value && wslDistros.value.length > 0) {
      selectedWslDistro.value = wslDistros.value[0]
      localStorage.setItem('wslDistro', selectedWslDistro.value)
    }
  } catch (e) {
    wslDistros.value = []
  }
}

const onWslDistroChange = () => {
  localStorage.setItem('wslDistro', selectedWslDistro.value)
  // Optionally, emit event or call a refresh method here
  window.location.reload() // Simple way to refresh app state/UI
}

// Fetch distros when wsl2 is selected
watch(containerSource, (val) => {
  if (val === 'wsl2') fetchWslDistros()
})
onMounted(() => {
  if (containerSource.value === 'wsl2') fetchWslDistros()
})

const props = defineProps({
  commandToExecute: {
    type: String,
    required: true
  },
  persistentSelections: {
    type: Object,
    required: true
  },
  loadingStates: {
    type: Object,
    required: true
  },
  availableOptions: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:persistentSelections', 'loadDropdownData'])

// Docker Hub search
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const isSearching = ref(false)
const officialOnly = ref(true) // Default to official images only
let searchTimeout = null

// Tag selection
const availableTags = ref([])
const tagsLoading = ref(false)
const isLocalImageSelected = ref(false) // Track if image selected from local images

// Computed property to check if command needs text input for tag (not dropdown)
const needsTagTextInput = computed(() => {
  const cmd = props.commandToExecute.toLowerCase()
  // Commands that need custom tag input: docker tag, docker build
  return cmd.includes('docker tag ') || cmd.includes('docker build ')
})

// Computed property to determine if tag dropdown should be hidden
const shouldHideTagDropdown = computed(() => {
  return isLocalImageSelected.value
})

// Computed property to determine if tag dropdown should be shown
const shouldShowTagDropdown = computed(() => {
  const hasImage = !!props.persistentSelections.image
  const commandNeedsTag = props.commandToExecute.includes('<tag>') || props.commandToExecute.includes(':<tag>')
  const isDockerHubImage = !isLocalImageSelected.value

  console.log('shouldShowTagDropdown check:', {
    hasImage,
    commandNeedsTag,
    isDockerHubImage,
    result: hasImage && commandNeedsTag && isDockerHubImage
  })

  return hasImage && commandNeedsTag && isDockerHubImage
})

// Computed property to check if any selection has been made
const hasAnySelection = computed(() => {
  return !!(
    props.persistentSelections.container ||
    props.persistentSelections.image ||
    props.persistentSelections.tag ||
    props.persistentSelections.volume ||
    props.persistentSelections.network ||
    props.persistentSelections.service
  )
})

const handleSearchInput = async () => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.length < 2) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  // Debounce search - wait 500ms after user stops typing
  searchTimeout = setTimeout(async () => {
    isSearching.value = true
    try {
      const response = await serviceApi.searchDockerHubImages(searchQuery.value, officialOnly.value)
      searchResults.value = response.results || []
      showSearchResults.value = searchResults.value.length > 0
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 500)
}

const selectSearchResult = (result) => {
  // Use the image name from Docker Hub and close dropdown but keep results in state
  console.log('Selecting Docker Hub image:', result.name)
  isLocalImageSelected.value = false // Mark as Docker Hub image BEFORE updating selection
  console.log('isLocalImageSelected set to:', isLocalImageSelected.value)

  // Update the selection directly without using updateSelection to avoid setting isLocalImageSelected to true
  const newSelections = { ...props.persistentSelections }
  newSelections.image = result.name
  newSelections.tag = ''
  emit('update:persistentSelections', newSelections)
  console.log('Fetching tags for:', result.name)
  fetchImageTags(result.name)
  // Close the typeahead results overlay, but keep results in state
  showSearchResults.value = false
}


const clearImageSelection = () => {
  const newSelections = { ...props.persistentSelections }
  newSelections.image = ''
  newSelections.tag = ''
  isLocalImageSelected.value = false
  emit('update:persistentSelections', newSelections)
  availableTags.value = []
}

const resetForm = () => {
  // Reset all selections
  const newSelections = {
    container: '',
    image: '',
    tag: '',
    volume: '',
    network: '',
    service: ''
  }
  emit('update:persistentSelections', newSelections)

  // Reset search and local state
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  availableTags.value = []
  isLocalImageSelected.value = false
  tagsLoading.value = false
  isSearching.value = false
}

const fetchImageTags = async (imageName) => {
  console.log('fetchImageTags called with:', imageName)
  if (!imageName || imageName.length === 0) {
    availableTags.value = []
    return
  }

  tagsLoading.value = true
  try {
    console.log('Calling API to fetch tags for:', imageName)
    const response = await serviceApi.searchDockerHubImageTags(imageName)
    availableTags.value = response.results || []
    console.log('Tags fetched:', availableTags.value.length, 'tags')
  } catch (error) {
    console.error('Error fetching tags:', error)
    availableTags.value = []
  } finally {
    tagsLoading.value = false
  }
}

// Watch for image selection changes
watch(
  () => props.persistentSelections.image,
  (newImage) => {
    if (newImage && !isLocalImageSelected.value) {
      // Only fetch tags if this is a Docker Hub image (not local)
      fetchImageTags(newImage)
      // Reset tag selection
      const newSelections = { ...props.persistentSelections }
      newSelections.tag = ''
      emit('update:persistentSelections', newSelections)
    } else if (isLocalImageSelected.value) {
      // Local image selected - tag is already set in updateSelection
      availableTags.value = []
    } else {
      availableTags.value = []
    }
  }
)

// Update the loadingStates to include tags
watch(
  () => props.loadingStates,
  () => {
    // Pass through the loading states
  },
  { deep: true }
)

const updateSelection = (type, value) => {
  const newSelections = { ...props.persistentSelections }

  if (type === 'image') {
    // Image IDs don't have colons, so just use them directly
    newSelections.image = value
    newSelections.tag = ''
    isLocalImageSelected.value = true
  } else {
    newSelections[type] = value
  }

  emit('update:persistentSelections', newSelections)
  emit('loadDropdownData', type)
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.position-relative {
  position: relative;
}

.dropdown-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 0.25rem;
}

.dropdown-menu {
  position: static;
  display: block;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  clear: both;
  text-align: inherit;
  white-space: normal;
  background-color: transparent;
  border: 0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: #f8f9fa;
  color: inherit;
  text-decoration: none;
}

.dropdown-item:active {
  background-color: #e9ecef;
  color: inherit;
}

.form-label-sm {
  font-size: 0.875rem;
}
</style>