<template>
  <tr 
    class="cursor-pointer"
    :class="{ 'group-container': isGrouped }"
    @click="$emit('navigate', container.Id)"
  >
    <td>
      <div class="d-flex align-items-center">
        <div v-if="isGrouped" class="ms-3 me-2" style="width: 20px;"></div>
        <i class="bi bi-box me-2 text-primary"></i>
        <div>
          <div class="fw-medium">{{ containerName }}</div>
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
        :class="statusBadgeClass"
      >
        <i :class="statusIcon" class="me-1"></i>
        {{ container.State }}
      </span>
    </td>
    <td>
      <ContainerPorts :ports="container.Ports" :max-display="2" :container-name="containerName" />
    </td>
    <td>
      <small>{{ formattedDate }}</small>
    </td>
    <td class="py-2 text-center">
      <div class="btn-group btn-group-sm" role="group">
        <button 
          v-if="container.State === 'exited'"
          class="btn btn-outline-success"
          @click.stop="$emit('start', container.Id)"
          title="Start"
        >
          <i class="bi bi-play-fill"></i>
        </button>
        <button 
          v-if="container.State === 'running'"
          class="btn btn-outline-warning"
          @click.stop="$emit('stop', container.Id)"
          title="Stop"
        >
          <i class="bi bi-stop-fill"></i>
        </button>
        <button 
          class="btn btn-outline-info"
          @click.stop="$emit('logs', container)"
          title="View Logs"
        >
          <i class="bi bi-file-text"></i>
        </button>
        <button 
          class="btn btn-outline-danger"
          @click.stop="$emit('remove', container.Id, container.State === 'running')"
          title="Remove"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import ContainerPorts from './ContainerPorts.vue'

const props = defineProps({
    container: {
        type: Object,
        required: true
    },
    isGrouped: {
        type: Boolean,
        default: false
    }
})

defineEmits(['navigate', 'start', 'stop', 'logs', 'remove'])

const containerName = computed(() => {
    return props.container.Names?.[0]?.replace('/', '') || props.container.Id.slice(0, 12)
})

const statusBadgeClass = computed(() => {
    switch (props.container.State) {
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
})

const statusIcon = computed(() => {
    switch (props.container.State) {
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
})

const formattedDate = computed(() => {
    return new Date(props.container.Created * 1000).toLocaleString()
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

.group-container {
    background-color: #fafafa;
}

.group-container:hover {
    background-color: #f0f0f0;
}
</style>