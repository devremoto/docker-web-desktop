<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <DockerCommandHeader
      v-model:search-query="searchQuery"
      :total-filtered-commands="totalFilteredCommands"
      @search="debouncedSearch"
      @clear-search="clearSearch"
    />

    <!-- Introduction -->
    <DockerCommandIntro />

    <!-- Command Categories -->
    <div class="row">
      <DockerCommandCard
        v-for="category in commandCategories"
        :key="category.key"
        :title="category.title"
        :icon-class="category.iconClass"
        :header-class="category.headerClass"
        :commands="category.filteredCommands"
        :search-query="searchQuery"
        @execute-command="executeCommand"
        @copy-command="copyCommand"
      />
    </div>

    <!-- No Results -->
    <DockerNoResults
      v-if="searchQuery && totalFilteredCommands === 0"
      :search-query="searchQuery"
    />

    <!-- Confirmation Modal -->
    <DockerConfirmationModal
      :confirmation-data="confirmationData"
      :display-command="displayCommand"
      @confirm-execution="confirmExecution"
    />

    <!-- Execution Modal -->
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
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as bootstrap from 'bootstrap'
import DockerCommandHeader from '@/components/docker/DockerCommandHeader.vue'
import DockerCommandIntro from '@/components/docker/DockerCommandIntro.vue'
import DockerCommandCard from '@/components/docker/DockerCommandCard.vue'
import DockerNoResults from '@/components/docker/DockerNoResults.vue'
import DockerConfirmationModal from '@/components/docker/DockerConfirmationModal.vue'
import DockerExecutionModal from '@/components/docker/DockerExecutionModal.vue'
import serviceApi from '@/services/api'

// Reactive variables
const searchQuery = ref('')
const isExecuting = ref(false)
const executionResult = ref(null)
const commandToExecute = ref('')

const persistentSelections = ref({
    container: '',
    image: '',
    volume: '',
    network: '',
    service: ''
})

// Loading states
const loadingStates = ref({
    containers: false,
    images: false,
    volumes: false,
    networks: false,
    services: false
})

// Available options
const availableOptions = ref({
    containers: [],
    images: [],
    volumes: [],
    networks: [],
    services: []
})

const confirmationData = ref({})

// Command data (same as before)
const containerCommands = ref([
    { command: 'docker ps', description: 'List running containers', risk: 'safe' },
    { command: 'docker ps -a', description: 'List all containers (including stopped)', risk: 'safe' },
    { command: 'docker start <container>', description: 'Start a stopped container', risk: 'disruptive' },
    { command: 'docker stop <container>', description: 'Stop a running container', risk: 'disruptive' },
    { command: 'docker restart <container>', description: 'Restart a container', risk: 'disruptive' },
    { command: 'docker rm <container>', description: 'Remove a container', risk: 'destructive' },
    { command: 'docker rm -f <container>', description: 'Force remove a running container', risk: 'destructive' },
    { command: 'docker exec -it <container> bash', description: 'Execute command in running container', risk: 'safe' },
    { command: 'docker logs <container>', description: 'View container logs', risk: 'safe' },
    { command: 'docker inspect <container>', description: 'Get detailed container information', risk: 'safe' },
    { command: 'docker run -v <volume>:/data -it <image> bash', description: 'Run interactive container with volume mount', risk: 'disruptive' },
    { command: 'docker run -d -v <volume>:/app <image>', description: 'Run container in background with volume', risk: 'disruptive' },
    { command: 'docker exec -it <container> ls /data', description: 'List files in container volume mount', risk: 'safe' }
])

const imageCommands = ref([
    { command: 'docker images', description: 'List all images', risk: 'safe' },
    { command: 'docker pull <image>', description: 'Download an image', risk: 'safe' },
    { command: 'docker rmi <image>', description: 'Remove an image', risk: 'destructive' },
    { command: 'docker build -t <tag> .', description: 'Build an image from Dockerfile', risk: 'safe' },
    { command: 'docker tag <image> <tag>', description: 'Tag an image', risk: 'safe' },
    { command: 'docker push <image>', description: 'Push image to registry', risk: 'safe' },
    { command: 'docker save -o <path> <image>', description: 'Save image to tar file', risk: 'safe' },
    { command: 'docker load -i <path>', description: 'Load image from tar file', risk: 'safe' },
    { command: 'docker history <image>', description: 'Show image history', risk: 'safe' }
])

const volumeCommands = ref([
    { command: 'docker volume ls', description: 'List all volumes', risk: 'safe' },
    { command: 'docker volume create <volume>', description: 'Create a volume', risk: 'safe' },
    { command: 'docker volume rm <volume>', description: 'Remove a volume', risk: 'destructive' },
    { command: 'docker volume inspect <volume>', description: 'Get detailed volume information', risk: 'safe' },
    { command: 'docker volume prune', description: 'Remove unused volumes', risk: 'destructive' },
    { command: 'docker run -v <volume>:/data <image>', description: 'Run container with volume mount', risk: 'disruptive' },
    { command: 'docker run -v <volume>:/app <image> sh', description: 'Run interactive container with volume', risk: 'disruptive' },
    { command: 'docker cp <container>:/path <volume>', description: 'Copy files from container to volume', risk: 'disruptive' }
])

const networkCommands = ref([
    { command: 'docker network ls', description: 'List all networks', risk: 'safe' },
    { command: 'docker network create <network>', description: 'Create a network', risk: 'safe' },
    { command: 'docker network rm <network>', description: 'Remove a network', risk: 'destructive' },
    { command: 'docker network inspect <network>', description: 'Get detailed network information', risk: 'safe' },
    { command: 'docker network connect <network> <container>', description: 'Connect container to network', risk: 'disruptive' },
    { command: 'docker network disconnect <network> <container>', description: 'Disconnect container from network', risk: 'disruptive' },
    { command: 'docker network prune', description: 'Remove unused networks', risk: 'destructive' }
])

const systemCommands = ref([
    { command: 'docker system df', description: 'Show docker disk usage', risk: 'safe' },
    { command: 'docker system prune', description: 'Remove unused data', risk: 'destructive' },
    { command: 'docker system prune -a', description: 'Remove all unused data including images', risk: 'destructive' },
    { command: 'docker version', description: 'Show Docker version', risk: 'safe' },
    { command: 'docker info', description: 'Show system information', risk: 'safe' },
    { command: 'docker stats', description: 'Show container resource usage', risk: 'safe' }
])

const dataCommands = ref([
    { command: 'docker run --rm -v <volume>:/backup -v /var/lib/docker/volumes:/volumes alpine tar czf /backup/backup.tar.gz /volumes/<volume>', description: 'Backup volume to tar file', risk: 'safe' },
    { command: 'docker run --rm -v <volume>:/data alpine ls -la /data', description: 'List volume contents', risk: 'safe' },
    { command: 'docker run --rm -v <volume>:/data alpine du -sh /data', description: 'Check volume size', risk: 'safe' },
    { command: 'docker run --rm -v <volume>:/source -v <volume>:/dest alpine cp -a /source/. /dest/', description: 'Copy volume data', risk: 'disruptive' },
    { command: 'docker run --rm -v <volume>:/data alpine find /data -type f -name "*.log" -delete', description: 'Clean volume log files', risk: 'destructive' },
    { command: 'docker run --rm -v <volume>:/data alpine sh -c "cd /data && tar czf backup.tar.gz ."', description: 'Create archive in volume', risk: 'safe' }
])

const composeCommands = ref([
    { command: 'docker-compose up', description: 'Start services', risk: 'disruptive' },
    { command: 'docker-compose up -d', description: 'Start services in background', risk: 'disruptive' },
    { command: 'docker-compose down', description: 'Stop and remove containers', risk: 'destructive' },
    { command: 'docker-compose down -v', description: 'Stop and remove containers with volumes', risk: 'destructive' },
    { command: 'docker-compose ps', description: 'List running services', risk: 'safe' },
    { command: 'docker-compose logs', description: 'View service logs', risk: 'safe' },
    { command: 'docker-compose exec <service> <command>', description: 'Execute command in running container', risk: 'safe' },
    { command: 'docker-compose build', description: 'Build services', risk: 'safe' },
    { command: 'docker-compose pull', description: 'Pull service images', risk: 'safe' },
    { command: 'docker-compose run --rm -v <volume>:/data <service> bash', description: 'Run service with volume mount', risk: 'disruptive' }
])

// Computed properties for filtered commands
const filteredContainerCommands = computed(() => {
    return filterCommands(containerCommands.value)
})

const filteredImageCommands = computed(() => {
    return filterCommands(imageCommands.value)
})

const filteredVolumeCommands = computed(() => {
    return filterCommands(volumeCommands.value)
})

const filteredNetworkCommands = computed(() => {
    return filterCommands(networkCommands.value)
})

const filteredSystemCommands = computed(() => {
    return filterCommands(systemCommands.value)
})

const filteredDataCommands = computed(() => {
    return filterCommands(dataCommands.value)
})

const filteredComposeCommands = computed(() => {
    return filterCommands(composeCommands.value)
})

const totalFilteredCommands = computed(() => {
    return filteredContainerCommands.value.length +
        filteredImageCommands.value.length +
        filteredVolumeCommands.value.length +
        filteredNetworkCommands.value.length +
        filteredSystemCommands.value.length +
        filteredDataCommands.value.length +
        filteredComposeCommands.value.length
})

const commandCategories = computed(() => [
    {
        key: 'container',
        title: 'Container Commands',
        iconClass: 'bi bi-box',
        headerClass: 'bg-primary text-white',
        filteredCommands: filteredContainerCommands.value
    },
    {
        key: 'image',
        title: 'Image Commands',
        iconClass: 'bi bi-disc',
        headerClass: 'bg-success text-white',
        filteredCommands: filteredImageCommands.value
    },
    {
        key: 'volume',
        title: 'Volume Commands',
        iconClass: 'bi bi-hdd',
        headerClass: 'bg-info text-white',
        filteredCommands: filteredVolumeCommands.value
    },
    {
        key: 'network',
        title: 'Network Commands',
        iconClass: 'bi bi-diagram-3',
        headerClass: 'bg-warning text-dark',
        filteredCommands: filteredNetworkCommands.value
    },
    {
        key: 'system',
        title: 'System Commands',
        iconClass: 'bi bi-gear',
        headerClass: 'bg-secondary text-white',
        filteredCommands: filteredSystemCommands.value
    },
    {
        key: 'data',
        title: 'Data & Backup Commands',
        iconClass: 'bi bi-archive',
        headerClass: 'bg-orange text-white',
        filteredCommands: filteredDataCommands.value
    },
    {
        key: 'compose',
        title: 'Docker Compose Commands',
        iconClass: 'bi bi-layers',
        headerClass: 'bg-dark text-white',
        filteredCommands: filteredComposeCommands.value
    }
])

const displayCommand = computed(() => {
    if (!commandToExecute.value) return ''

    let displayCmd = commandToExecute.value

    // Replace placeholders with selected values if available
    if (persistentSelections.value.container) {
        displayCmd = displayCmd.replace(/<container>/g, `<strong>${persistentSelections.value.container}</strong>`)
    }
    if (persistentSelections.value.image) {
        displayCmd = displayCmd.replace(/<image>/g, `<strong>${persistentSelections.value.image}</strong>`)
    }
    if (persistentSelections.value.volume) {
        displayCmd = displayCmd.replace(/<volume>/g, `<strong>${persistentSelections.value.volume}</strong>`)
    }
    if (persistentSelections.value.network) {
        displayCmd = displayCmd.replace(/<network>/g, `<strong>${persistentSelections.value.network}</strong>`)
    }
    if (persistentSelections.value.service) {
        displayCmd = displayCmd.replace(/<service>/g, `<strong>${persistentSelections.value.service}</strong>`)
    }

    // Apply placeholder highlighting to any remaining unselected placeholders
    displayCmd = displayCmd.replace(/<(container|image|volume|network|service|stack|tag|port|path|name|id)>/g,
        '<span class="placeholder-highlight">&lt;$1&gt;</span>')

    return displayCmd
})

const canExecuteCommand = computed(() => {
    if (!commandToExecute.value) return false

    // Check if all required placeholders have been filled
    if (commandToExecute.value.includes('<container>') && !persistentSelections.value.container) {
        return false
    }
    if (commandToExecute.value.includes('<image>') && !persistentSelections.value.image) {
        return false
    }
    if (commandToExecute.value.includes('<volume>') && !persistentSelections.value.volume) {
        return false
    }
    if (commandToExecute.value.includes('<network>') && !persistentSelections.value.network) {
        return false
    }
    if (commandToExecute.value.includes('<service>') && !persistentSelections.value.service) {
        return false
    }

    return true
})

// Utility functions
const filterCommands = (commands) => {
    if (!searchQuery.value) return commands

    const query = searchQuery.value.toLowerCase()
    return commands.filter(cmd =>
        cmd.command.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    )
}

const clearSearch = () => {
    searchQuery.value = ''
}

const debouncedSearch = (() => {
    let timeout
    return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            // Search is already reactive through computed properties
        }, 300)
    }
})()

// Command execution functions
const executeCommand = async (command) => {
    // Store the original command with placeholders for display
    commandToExecute.value = command

    // Clear any previous selections that don't apply to this command
    if (!command.includes('<container>')) {
        persistentSelections.value.container = ''
    }
    if (!command.includes('<image>')) {
        persistentSelections.value.image = ''
    }
    if (!command.includes('<volume>')) {
        persistentSelections.value.volume = ''
    }
    if (!command.includes('<network>')) {
        persistentSelections.value.network = ''
    }
    if (!command.includes('<service>')) {
        persistentSelections.value.service = ''
    }

    // Check if this is a risky command that needs confirmation
    const allCommands = [
        ...containerCommands.value,
        ...imageCommands.value,
        ...volumeCommands.value,
        ...networkCommands.value,
        ...systemCommands.value,
        ...composeCommands.value
    ]

    const commandObj = allCommands.find(cmd => cmd.command === command)

    if (commandObj && commandObj.risk !== 'safe') {
        await showConfirmationModal(commandObj.risk)
    } else {
        // Safe command - check if it needs parameters
        const hasPlaceholders = command.includes('<container>') ||
            command.includes('<image>') ||
            command.includes('<volume>') ||
            command.includes('<network>') ||
            command.includes('<service>')

        if (hasPlaceholders) {
            // Safe command with placeholders - show execution modal for parameter selection
            await showExecutionModal()
        } else {
            // Safe command without placeholders - execute immediately
            await executeDirectly(command)
        }
    }
}

const executeDirectly = async (command) => {
    // Execute safe command without placeholders immediately
    isExecuting.value = true
    executionResult.value = null

    try {
        const response = await fetch('http://localhost:3000/api/commands/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: command })
        })

        const result = await response.json()
        executionResult.value = result

        // Show execution modal with results
        await showExecutionModal()
    } catch (error) {
        console.error('Command execution failed:', error)
        executionResult.value = {
            success: false,
            error: error.message,
            output: null
        }

        // Show execution modal with error
        await showExecutionModal()
    } finally {
        isExecuting.value = false
    }
}

const showConfirmationModal = async (riskLevel) => {
    // Set confirmation data based on risk level
    switch (riskLevel) {
        case 'disruptive':
            confirmationData.value = {
                message: 'This command may change the state of your Docker environment. Do you want to continue?',
                warning: 'This action may disrupt running services or change container states.',
                buttonClass: 'btn btn-warning',
                buttonIcon: 'bi bi-exclamation-triangle',
                buttonText: 'Continue'
            }
            break
        case 'destructive':
            confirmationData.value = {
                message: 'This command may permanently delete data. This action cannot be undone!',
                warning: 'WARNING: This action may result in permanent data loss. Please ensure you have backups.',
                buttonClass: 'btn btn-danger',
                buttonIcon: 'bi bi-trash',
                buttonText: 'Delete'
            }
            break
    }

    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'))
    modal.show()
}

const confirmExecution = async () => {
    await showExecutionModal()
}

const showExecutionModal = async () => {
    // Reset execution state
    isExecuting.value = false
    executionResult.value = null

    // Clear dropdown data to force fresh loading
    availableOptions.value = {
        containers: [],
        images: [],
        volumes: [],
        networks: [],
        services: []
    }

    // Reset loading states
    loadingStates.value = {
        containers: false,
        images: false,
        volumes: false,
        networks: false,
        services: false
    }

    // Load dropdown data for any placeholders
    await loadRequiredDropdownData()

    // Show the execution modal
    const modal = new bootstrap.Modal(document.getElementById('executionModal'))
    modal.show()
}

const loadRequiredDropdownData = async () => {
    if (commandToExecute.value.includes('<container>')) {
        await loadContainersForDropdown()
    }
    if (commandToExecute.value.includes('<image>')) {
        await loadImagesForDropdown()
    }
    if (commandToExecute.value.includes('<volume>')) {
        await loadVolumesForDropdown()
    }
    if (commandToExecute.value.includes('<network>')) {
        await loadNetworksForDropdown()
    }
    if (commandToExecute.value.includes('<service>')) {
        await loadServicesForDropdown()
    }
}

const executeCurrentCommand = async () => {
    // Process placeholders with current selections
    const processedCommand = await processPlaceholders(commandToExecute.value)

    // Start execution
    await performExecution(processedCommand)
}

// Dropdown loading functions
const loadContainersForDropdown = async () => {
    loadingStates.value.containers = true
    try {
        availableOptions.value.containers = await serviceApi.getContainers()
    } catch (error) {
        console.error('Failed to load containers:', error)
        availableOptions.value.containers = []
    } finally {
        loadingStates.value.containers = false
    }
}

const loadImagesForDropdown = async () => {
    loadingStates.value.images = true
    try {
        availableOptions.value.images = await serviceApi.getImages()
    } catch (error) {
        console.error('Failed to load images:', error)
        availableOptions.value.images = []
    } finally {
        loadingStates.value.images = false
    }
}

const loadVolumesForDropdown = async () => {
    loadingStates.value.volumes = true
    try {
        availableOptions.value.volumes = await serviceApi.getVolumes()
    } catch (error) {
        console.error('Failed to load volumes:', error)
        availableOptions.value.volumes = []
    } finally {
        loadingStates.value.volumes = false
    }
}

const loadNetworksForDropdown = async () => {
    loadingStates.value.networks = true
    try {
        availableOptions.value.networks = await serviceApi.getNetworks()
    } catch (error) {
        console.error('Failed to load networks:', error)
        availableOptions.value.networks = []
    } finally {
        loadingStates.value.networks = false
    }
}

const loadServicesForDropdown = async () => {
    loadingStates.value.services = true
    try {
        const services = await serviceApi.getServices()
        availableOptions.value.services = services
    } catch (error) {
        console.error('Failed to load services:', error)
        availableOptions.value.services = []
    } finally {
        loadingStates.value.services = false
    }
}

const loadDropdownData = (type) => {
    switch (type) {
        case 'container':
            loadContainersForDropdown()
            break
        case 'image':
            loadImagesForDropdown()
            break
        case 'volume':
            loadVolumesForDropdown()
            break
        case 'network':
            loadNetworksForDropdown()
            break
        case 'service':
            loadServicesForDropdown()
            break
    }
}

const processPlaceholders = async (command) => {
    let processedCommand = command

    // Replace placeholders with selected values (they should already be selected from dropdowns)
    if (processedCommand.includes('<container>')) {
        if (!persistentSelections.value.container) {
            throw new Error('Container selection is required')
        }
        processedCommand = processedCommand.replace(/<container>/g, persistentSelections.value.container)
    }

    if (processedCommand.includes('<image>')) {
        if (!persistentSelections.value.image) {
            throw new Error('Image selection is required')
        }
        processedCommand = processedCommand.replace(/<image>/g, persistentSelections.value.image)
    }

    if (processedCommand.includes('<volume>')) {
        if (!persistentSelections.value.volume) {
            throw new Error('Volume selection is required')
        }
        processedCommand = processedCommand.replace(/<volume>/g, persistentSelections.value.volume)
    }

    if (processedCommand.includes('<network>')) {
        if (!persistentSelections.value.network) {
            throw new Error('Network selection is required')
        }
        processedCommand = processedCommand.replace(/<network>/g, persistentSelections.value.network)
    }

    if (processedCommand.includes('<service>')) {
        if (!persistentSelections.value.service) {
            throw new Error('Service selection is required')
        }
        processedCommand = processedCommand.replace(/<service>/g, persistentSelections.value.service)
    }

    return processedCommand
}

const performOpenCommand = async () => {
    isExecuting.value = true
    executionResult.value = null
    try {
        const processedCommand = await processPlaceholders(commandToExecute.value)
        await serviceApi.openCommand(processedCommand)
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

const performExecution = async (processedCommand) => {
    isExecuting.value = true
    executionResult.value = null

    try {
        const result = await serviceApi.executeCommand(processedCommand)
        executionResult.value = result
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

const copyCommand = async (command) => {
    try {
        await navigator.clipboard.writeText(command)
        // You could add a toast notification here
        console.log('Command copied to clipboard:', command)
    } catch (error) {
        console.error('Failed to copy command:', error)
    }
}

onMounted(() => {
    // Component mounted
})
</script>

<style scoped>
.placeholder-highlight {
    background: #e7f3ff;
    color: #0066cc;
    font-weight: 600;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    border: 1px solid #b3d9ff;
}

.bg-orange {
    background-color: #fd7e14 !important;
}
</style>