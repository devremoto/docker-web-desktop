<template>
    <!-- Group Header Row -->
    <tr class="group-header table-secondary cursor-pointer" @click="toggleGroup">
      <td colspan="6" class="py-2">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <button 
              class="btn btn-sm btn-link p-0 me-2"
              @click.stop="toggleGroup"
              type="button"
            >
              <i class="bi" :class="isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
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
              v-if="runningCount < group.containers.length"
              class="btn btn-outline-success"
              @click.stop="$emit('startGroup', group)"
              title="Start All Containers in Group"
            >
              <i class="bi bi-play-fill"></i>
              <span class="d-none d-md-inline ms-1">Start All</span>
            </button>
            <button 
              v-if="runningCount > 0"
              class="btn btn-outline-warning"
              @click.stop="$emit('stopGroup', group)"
              title="Stop All Containers in Group"
            >
              <i class="bi bi-stop-fill"></i>
              <span class="d-none d-md-inline ms-1">Stop All</span>
            </button>
            <button 
              class="btn btn-outline-info"
              @click.stop="$emit('restartGroup', group)"
              title="Restart All Containers in Group"
            >
              <i class="bi bi-arrow-clockwise"></i>
              <span class="d-none d-md-inline ms-1">Restart All</span>
            </button>
            <button 
              class="btn btn-outline-danger"
              @click.stop="$emit('removeGroup', group)"
              title="Remove All Containers in Group"
            >
              <i class="bi bi-trash"></i>
              <span class="d-none d-md-inline ms-1">Remove All</span>
            </button>
            
            <!-- View Docker Compose File Button (only for compose groups) -->
            <button 
              v-if="group.type === 'compose'"
              class="btn btn-outline-secondary"
              @click.stop="$emit('viewComposeFile', group)"
              title="View Docker Compose File"
            >
              <i class="bi bi-file-earmark-code"></i>
              <span class="d-none d-lg-inline ms-1">View Compose</span>
            </button>
          </div>
        </div>
      </td>
    </tr>
    
    <!-- Group Container Rows (collapsible) -->
    <ContainerRow
      v-for="container in group.containers" 
      v-show="isExpanded"
      :key="container.Id"
      :container="container"
      :is-grouped="true"
      @navigate="$emit('navigate', $event)"
      @start="$emit('start', $event)"
      @stop="$emit('stop', $event)"
      @logs="$emit('logs', $event)"
      @remove="$emit('remove', $event)"
    />
</template>

<script setup>
import { computed } from 'vue'
import ContainerRow from './ContainerRow.vue'

const props = defineProps({
    group: {
        type: Object,
        required: true
    },
    isExpanded: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits([
    'toggleGroup',
    'startGroup',
    'stopGroup',
    'restartGroup',
    'removeGroup',
    'viewComposeFile',
    'navigate',
    'start',
    'stop',
    'logs',
    'remove'
])

const runningCount = computed(() => {
    return props.group.containers.filter(container => container.State === 'running').length
})

const toggleGroup = () => {
    emit('toggleGroup', props.group.key)
}
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
    user-select: none;
}

.cursor-pointer:hover {
    background-color: #f8f9fa;
}

[data-bs-theme="light"] .group-header {
    background-color: #f8f9fa;
    border-top: 2px solid #dee2e6;
    transition: background-color 0.15s ease-in-out;
}

[data-bs-theme="light"].group-header:hover {
    background-color: #e9ecef;
}

[data-bs-theme="light"].group-header.cursor-pointer:hover {
    background-color: #dee2e6;
}

.btn-link {
    color: #6c757d;
    text-decoration: none;
}

.btn-link:hover {
    color: #495057;
}
</style>