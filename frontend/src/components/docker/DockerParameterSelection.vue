<template>
  <div class="mb-4">
    <h6 class="mb-3">Parameters:</h6>
    
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
      <label class="form-label">
        <i class="bi bi-disc me-1"></i>Select Image:
      </label>
      <select 
        class="form-select" 
        :value="persistentSelections.image"
        @change="updateSelection('image', $event.target.value)"
        :disabled="loadingStates.images"
      >
        <option value="">Choose an image...</option>
        <option 
          v-for="image in availableOptions.images" 
          :key="image.Id" 
          :value="image.RepoTags?.[0] || image.Id"
        >
          {{ image.RepoTags?.[0] || 'Untagged' }} ({{ formatBytes(image.Size) }})
        </option>
      </select>
      <div v-if="loadingStates.images" class="text-muted small mt-1">
        <i class="bi bi-arrow-clockwise spin me-1"></i>Loading images...
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

const updateSelection = (type, value) => {
    const newSelections = { ...props.persistentSelections }
    newSelections[type] = value
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
</style>