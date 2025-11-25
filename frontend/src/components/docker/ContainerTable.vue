<template>
  <div class="card">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0 table-fixed">
          <thead class="table-light">
            <tr>
              <th style="width: 25%;">Container</th>
              <th style="width: 20%;">Image</th>
              <th style="width: 12%;">Status</th>
              <th style="width: 18%;">Ports</th>
              <th style="width: 12%;">Created</th>
              <th style="width: 13%;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Grouped Containers -->
            <ContainerGroup
              v-for="group in groupedContainers.groups" 
              :key="group.key"
              :group="group"
              :is-expanded="isGroupExpanded(group.key)"
              @toggleGroup="toggleGroup"
              @startGroup="$emit('startGroup', $event)"
              @stopGroup="$emit('stopGroup', $event)"
              @restartGroup="$emit('restartGroup', $event)"
              @removeGroup="$emit('removeGroup', $event)"
              @viewComposeFile="$emit('viewComposeFile', $event)"
              @navigate="$emit('navigate', $event)"
              @start="$emit('start', $event)"
              @stop="$emit('stop', $event)"
              @logs="$emit('logs', $event)"
              @remove="$emit('remove', $event)"
            />

            <!-- Ungrouped Containers -->
            <ContainerRow
              v-for="container in groupedContainers.ungrouped" 
              :key="container.Id"
              :container="container"
              @navigate="$emit('navigate', $event)"
              @start="$emit('start', $event)"
              @stop="$emit('stop', $event)"
              @logs="$emit('logs', $event)"
              @remove="$emit('remove', $event)"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ContainerGroup from './ContainerGroup.vue'
import ContainerRow from './ContainerRow.vue'

const props = defineProps({
    containers: {
        type: Array,
        required: true
    },
    expandedGroups: {
        type: Set,
        required: true
    }
})

defineEmits([
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

const groupedContainers = computed(() => {
    const containers = props.containers
    const groups = new Map()
    const ungrouped = []

    containers.forEach(container => {
        let groupKey = null

        // Try to get docker-compose project name from labels
        if (container.Labels) {
            const composeProject = container.Labels['com.docker.compose.project']
            if (composeProject) {
                groupKey = `compose:${composeProject}`
            }
        }

        // If no compose project, try to group by network (exclude default networks)
        if (!groupKey && container.NetworkSettings?.Networks) {
            const networks = Object.keys(container.NetworkSettings.Networks)
            const customNetworks = networks.filter(net =>
                !['bridge', 'host', 'none'].includes(net) && !net.startsWith('br-')
            )
            if (customNetworks.length > 0) {
                groupKey = `network:${customNetworks[0]}`
            }
        }

        if (groupKey) {
            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    key: groupKey,
                    name: groupKey.split(':')[1],
                    type: groupKey.split(':')[0],
                    containers: []
                })
            }
            groups.get(groupKey).containers.push(container)
        } else {
            ungrouped.push(container)
        }
    })

    // Filter out groups with only one container
    const validGroups = Array.from(groups.values()).filter(group => group.containers.length > 1)

    // Add single containers from filtered groups back to ungrouped
    groups.forEach(group => {
        if (group.containers.length === 1) {
            ungrouped.push(group.containers[0])
        }
    })

    return {
        groups: validGroups,
        ungrouped: ungrouped
    }
})

const isGroupExpanded = (groupKey) => {
    // Auto-expand groups by default if not explicitly collapsed
    if (!props.expandedGroups.has(groupKey) && !props.expandedGroups.has(`collapsed:${groupKey}`)) {
        props.expandedGroups.add(groupKey)
    }
    return props.expandedGroups.has(groupKey)
}

const toggleGroup = (groupKey) => {
    if (props.expandedGroups.has(groupKey)) {
        props.expandedGroups.delete(groupKey)
        props.expandedGroups.add(`collapsed:${groupKey}`)
    } else {
        props.expandedGroups.add(groupKey)
        props.expandedGroups.delete(`collapsed:${groupKey}`)
    }
}
</script>

<style scoped>
.card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-fixed {
    table-layout: fixed;
    width: 100%;
    min-width: 800px;
}

.table-fixed th,
.table-fixed td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
}

.table-fixed td:first-child,
.table-fixed th:first-child {
    white-space: normal;
}

.table-fixed td:nth-child(4) {
    white-space: normal;
    overflow: visible;
}

.table th {
    border-top: none;
    font-weight: 600;
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    z-index: 10;
}

.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
}
</style>