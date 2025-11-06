<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="mb-2">
              <i class="bi bi-terminal me-3"></i>
              Docker Commands Reference
            </h2>
            <p class="text-muted mb-0">Comprehensive reference for Docker CLI commands</p>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="form-control" 
                  placeholder="Search commands..." 
                  @input="debouncedSearch"
                >
                <button 
                  v-if="searchQuery" 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  @click="clearSearch"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="text-muted small align-self-center">
              {{ totalFilteredCommands }} command(s) found
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Introduction -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title"><i class="bi bi-info-circle me-2"></i>About Docker Commands</h5>
        <p class="card-text">
          This page provides a comprehensive reference of the most commonly used Docker commands. 
          These commands will help you manage containers, images, volumes, networks, and more from the command line.
        </p>
        <div class="d-flex gap-3 mt-3">
          <div class="d-flex align-items-center">
            <span class="badge bg-success me-2">Safe</span>
            <small class="text-muted">Information and listing commands</small>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge bg-warning text-dark me-2">Disruptive</span>
            <small class="text-muted">Changes state but reversible</small>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge bg-danger me-2">Destructive</span>
            <small class="text-muted">Permanent changes - data deletion</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Command Categories -->
    <div class="row">
      <!-- Container Commands -->
      <div v-if="filteredContainerCommands.length > 0" class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-box me-2"></i>
              Container Commands ({{ filteredContainerCommands.length }})
            </h5>
          </div>
          <div class="card-body">
            <div class="command-item" v-for="cmd in filteredContainerCommands" :key="cmd.command">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    :class="getButtonClass(cmd.risk)" 
                    @click="executeCommand(cmd.command)" 
                    :title="getButtonTitle(cmd.risk)"
                  >
                    <i class="bi bi-play-fill"></i>
                    <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="copyCommand(cmd.command)" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
              <div class="command-desc-wrapper">
                <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
                <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
                  <i :class="'bi ' + getRiskBadge(cmd.risk).icon + ' me-1'"></i>{{ getRiskBadge(cmd.risk).text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Commands -->
      <div v-if="filteredImageCommands.length > 0" class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-disc me-2"></i>
              Image Commands ({{ filteredImageCommands.length }})
            </h5>
          </div>
          <div class="card-body">
            <div class="command-item" v-for="cmd in filteredImageCommands" :key="cmd.command">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    :class="getButtonClass(cmd.risk)" 
                    @click="executeCommand(cmd.command)" 
                    :title="getButtonTitle(cmd.risk)"
                  >
                    <i class="bi bi-play-fill"></i>
                    <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="copyCommand(cmd.command)" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
              <div class="command-desc-wrapper">
                <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
                <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
                  <i :class="'bi ' + getRiskBadge(cmd.risk).icon + ' me-1'"></i>{{ getRiskBadge(cmd.risk).text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Volume Commands -->
      <div v-if="filteredVolumeCommands.length > 0" class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">
              <i class="bi bi-hdd me-2"></i>
              Volume Commands ({{ filteredVolumeCommands.length }})
            </h5>
          </div>
          <div class="card-body">
            <div class="command-item" v-for="cmd in filteredVolumeCommands" :key="cmd.command">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    :class="getButtonClass(cmd.risk)" 
                    @click="executeCommand(cmd.command)" 
                    :title="getButtonTitle(cmd.risk)"
                  >
                    <i class="bi bi-play-fill"></i>
                    <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="copyCommand(cmd.command)" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
              <div class="command-desc-wrapper">
                <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
                <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
                  <i :class="'bi ' + getRiskBadge(cmd.risk).icon + ' me-1'"></i>{{ getRiskBadge(cmd.risk).text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Network Commands -->
      <div v-if="filteredNetworkCommands.length > 0" class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">
              <i class="bi bi-diagram-3 me-2"></i>
              Network Commands ({{ filteredNetworkCommands.length }})
            </h5>
          </div>
          <div class="card-body">
            <div class="command-item" v-for="cmd in filteredNetworkCommands" :key="cmd.command">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    :class="getButtonClass(cmd.risk)" 
                    @click="executeCommand(cmd.command)" 
                    :title="getButtonTitle(cmd.risk)"
                  >
                    <i class="bi bi-play-fill"></i>
                    <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="copyCommand(cmd.command)" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
              <div class="command-desc-wrapper">
                <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
                <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
                  <i :class="'bi ' + getRiskBadge(cmd.risk).icon + ' me-1'"></i>{{ getRiskBadge(cmd.risk).text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Commands -->
      <div v-if="filteredSystemCommands.length > 0" class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">
              <i class="bi bi-gear me-2"></i>
              System Commands ({{ filteredSystemCommands.length }})
            </h5>
          </div>
          <div class="card-body">
            <div class="command-item" v-for="cmd in filteredSystemCommands" :key="cmd.command">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    :class="getButtonClass(cmd.risk)" 
                    @click="executeCommand(cmd.command)" 
                    :title="getButtonTitle(cmd.risk)"
                  >
                    <i class="bi bi-play-fill"></i>
                    <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="copyCommand(cmd.command)" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
              <div class="command-desc-wrapper">
                <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
                <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
                  <i :class="'bi ' + getRiskBadge(cmd.risk).icon + ' me-1'"></i>{{ getRiskBadge(cmd.risk).text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Docker Compose Commands -->
      <div v-if="filteredComposeCommands.length > 0" class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
              <i class="bi bi-layers me-2"></i>
              Docker Compose Commands ({{ filteredComposeCommands.length }})
            </h5>
          </div>
          <div class="card-body">
            <div class="command-item" v-for="cmd in filteredComposeCommands" :key="cmd.command">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    :class="getButtonClass(cmd.risk)" 
                    @click="executeCommand(cmd.command)" 
                    :title="getButtonTitle(cmd.risk)"
                  >
                    <i class="bi bi-play-fill"></i>
                    <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="copyCommand(cmd.command)" title="Copy command">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
              <div class="command-desc-wrapper">
                <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
                <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
                  <i :class="'bi ' + getRiskBadge(cmd.risk).icon + ' me-1'"></i>{{ getRiskBadge(cmd.risk).text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="totalFilteredCommands === 0" class="text-center py-5">
      <i class="bi bi-search display-4 text-muted"></i>
      <h4 class="mt-3 text-muted">No commands found</h4>
      <p class="text-muted">Try adjusting your search query</p>
      <button class="btn btn-outline-primary" @click="clearSearch">
        <i class="bi bi-arrow-clockwise me-2"></i>Show All Commands
      </button>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmationModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="confirmationData.icon + ' me-2'"></i>
              {{ confirmationData.title }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>{{ confirmationData.message }}</p>
            <div class="bg-light p-3 rounded">
              <strong>Command:</strong>
              <code class="d-block mt-1" v-html="displayCommand"></code>
            </div>
            <div v-if="confirmationData.warning" class="alert alert-warning mt-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ confirmationData.warning }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x me-2"></i>Cancel
            </button>
            <button 
              type="button" 
              :class="confirmationData.buttonClass"
              @click="confirmExecution"
              data-bs-dismiss="modal"
            >
              <i :class="confirmationData.buttonIcon + ' me-2'"></i>
              {{ confirmationData.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Execution Modal -->
    <div class="modal fade" id="executionModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-terminal me-2"></i>Command Execution
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <strong>Command:</strong>
              <code class="d-block mt-1 p-2 bg-light rounded" v-html="displayCommand"></code>
            </div>
            
            <!-- Parameter Selection -->
            <div v-if="!isExecuting && !executionResult" class="mb-4">
              <h6 class="mb-3">Parameters:</h6>
              
              <!-- Container Selection -->
              <div v-if="commandToExecute.includes('<container>')" class="mb-3">
                <label class="form-label">
                  <i class="bi bi-box me-1"></i>Select Container:
                </label>
                <select 
                  class="form-select" 
                  v-model="persistentSelections.container"
                  @change="loadContainersForDropdown"
                  :disabled="loadingContainers"
                >
                  <option value="">Choose a container...</option>
                  <option 
                    v-for="container in availableContainers" 
                    :key="container.Id" 
                    :value="container.Names[0]"
                  >
                    {{ container.Names[0] }} ({{ container.Image }}) - {{ container.State }}
                  </option>
                </select>
                <div v-if="loadingContainers" class="text-muted small mt-1">
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
                  v-model="persistentSelections.image"
                  @change="loadImagesForDropdown"
                  :disabled="loadingImages"
                >
                  <option value="">Choose an image...</option>
                  <option 
                    v-for="image in availableImages" 
                    :key="image.Id" 
                    :value="image.RepoTags?.[0] || image.Id"
                  >
                    {{ image.RepoTags?.[0] || 'Untagged' }} ({{ formatBytes(image.Size) }})
                  </option>
                </select>
                <div v-if="loadingImages" class="text-muted small mt-1">
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
                  v-model="persistentSelections.volume"
                  @change="loadVolumesForDropdown"
                  :disabled="loadingVolumes"
                >
                  <option value="">Choose a volume...</option>
                  <option 
                    v-for="volume in availableVolumes" 
                    :key="volume.Name" 
                    :value="volume.Name"
                  >
                    {{ volume.Name }} ({{ volume.Driver }})
                  </option>
                </select>
                <div v-if="loadingVolumes" class="text-muted small mt-1">
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
                  v-model="persistentSelections.network"
                  @change="loadNetworksForDropdown"
                  :disabled="loadingNetworks"
                >
                  <option value="">Choose a network...</option>
                  <option 
                    v-for="network in availableNetworks" 
                    :key="network.Id" 
                    :value="network.Name"
                  >
                    {{ network.Name }} ({{ network.Driver }})
                  </option>
                </select>
                <div v-if="loadingNetworks" class="text-muted small mt-1">
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
                  v-model="persistentSelections.service"
                  @change="loadServicesForDropdown"
                  :disabled="loadingServices"
                >
                  <option value="">Choose a service...</option>
                  <option 
                    v-for="service in availableServices" 
                    :key="service.Name" 
                    :value="service.Name"
                  >
                    {{ service.Name }} ({{ service.Image }})
                  </option>
                </select>
                <div v-if="loadingServices" class="text-muted small mt-1">
                  <i class="bi bi-arrow-clockwise spin me-1"></i>Loading services...
                </div>
              </div>
            </div>
            
            <!-- Loading state -->
            <div v-if="isExecuting" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Executing...</span>
              </div>
              <p class="mt-2 text-muted">Executing command...</p>
            </div>
            
            <!-- Results -->
            <div v-else-if="executionResult">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Output:</strong>
                <span :class="executionResult.success ? 'badge bg-success' : 'badge bg-danger'">
                  {{ executionResult.success ? 'Success' : 'Error' }}
                </span>
              </div>
              <pre class="bg-dark text-light p-3 rounded" style="max-height: 300px; overflow-y: auto;">{{ executionResult.output || 'No output' }}</pre>
              
              <div v-if="executionResult.error" class="alert alert-danger mt-3">
                <strong>Error:</strong>
                <div>{{ executionResult.error }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x me-2"></i>Close
            </button>
            <button 
              v-if="!isExecuting && !executionResult" 
              type="button" 
              class="btn btn-primary" 
              @click="executeCurrentCommand"
              :disabled="!canExecuteCommand"
            >
              <i class="bi bi-play-fill me-2"></i>Execute Command
            </button>
            <button 
              v-if="executionResult && !isExecuting" 
              type="button" 
              class="btn btn-outline-primary" 
              @click="copyOutput"
            >
              <i class="bi bi-clipboard me-2"></i>Copy Output
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as bootstrap from 'bootstrap'

// Reactive data
const searchQuery = ref('')
const isExecuting = ref(false)
const executionResult = ref(null)
const commandToExecute = ref('')
const loadingContainers = ref(false)
const loadingImages = ref(false)
const loadingVolumes = ref(false)
const loadingNetworks = ref(false)
const loadingServices = ref(false)
const availableContainers = ref([])
const availableImages = ref([])
const availableVolumes = ref([])
const availableNetworks = ref([])
const availableServices = ref([])
const confirmationData = ref({})

// Persistent selections
const persistentSelections = ref({
  container: '',
  image: '',
  volume: '',
  network: '',
  service: ''
})

// Container Commands
const containerCommands = ref([
  { command: 'docker ps', description: 'List running containers', risk: 'safe' },
  { command: 'docker ps -a', description: 'List all containers (including stopped)', risk: 'safe' },
  { command: 'docker run -d <image>', description: 'Run container in detached mode', risk: 'safe' },
  { command: 'docker run -it <image> bash', description: 'Run container with interactive terminal', risk: 'safe' },
  { command: 'docker start <container>', description: 'Start a stopped container', risk: 'disruptive' },
  { command: 'docker stop <container>', description: 'Stop a running container', risk: 'disruptive' },
  { command: 'docker restart <container>', description: 'Restart a container', risk: 'disruptive' },
  { command: 'docker rm <container>', description: 'Remove a container', risk: 'destructive' },
  { command: 'docker rm $(docker ps -aq)', description: 'Remove all containers', risk: 'destructive' },
  { command: 'docker exec -it <container> bash', description: 'Execute command in running container', risk: 'safe' },
  { command: 'docker logs <container>', description: 'View container logs', risk: 'safe' },
  { command: 'docker inspect <container>', description: 'Get detailed container information', risk: 'safe' }
])

// Image Commands
const imageCommands = ref([
  { command: 'docker images', description: 'List all images', risk: 'safe' },
  { command: 'docker pull <image>', description: 'Download an image from registry', risk: 'safe' },
  { command: 'docker build -t <name> .', description: 'Build image from Dockerfile', risk: 'safe' },
  { command: 'docker push <image>', description: 'Upload image to registry', risk: 'safe' },
  { command: 'docker rmi <image>', description: 'Remove an image', risk: 'destructive' },
  { command: 'docker rmi $(docker images -q)', description: 'Remove all images', risk: 'destructive' },
  { command: 'docker tag <image> <new-tag>', description: 'Tag an image', risk: 'safe' },
  { command: 'docker history <image>', description: 'Show image history', risk: 'safe' },
  { command: 'docker save -o <file.tar> <image>', description: 'Save image to tar file', risk: 'safe' },
  { command: 'docker load -i <file.tar>', description: 'Load image from tar file', risk: 'safe' }
])

// Volume Commands
const volumeCommands = ref([
  { command: 'docker volume ls', description: 'List all volumes', risk: 'safe' },
  { command: 'docker volume create <name>', description: 'Create a volume', risk: 'safe' },
  { command: 'docker volume rm <name>', description: 'Remove a volume', risk: 'destructive' },
  { command: 'docker volume inspect <name>', description: 'Get detailed volume information', risk: 'safe' },
  { command: 'docker volume prune', description: 'Remove all unused volumes', risk: 'destructive' },
  { command: 'docker run -v <volume>:<path> <image>', description: 'Mount volume to container', risk: 'safe' },
  { command: 'docker run -v $(pwd):<path> <image>', description: 'Mount current directory to container', risk: 'safe' }
])

// Network Commands
const networkCommands = ref([
  { command: 'docker network ls', description: 'List all networks', risk: 'safe' },
  { command: 'docker network create <name>', description: 'Create a network', risk: 'safe' },
  { command: 'docker network rm <name>', description: 'Remove a network', risk: 'destructive' },
  { command: 'docker network inspect <name>', description: 'Get detailed network information', risk: 'safe' },
  { command: 'docker network connect <network> <container>', description: 'Connect container to network', risk: 'disruptive' },
  { command: 'docker network disconnect <network> <container>', description: 'Disconnect container from network', risk: 'disruptive' },
  { command: 'docker network prune', description: 'Remove all unused networks', risk: 'destructive' }
])

// System Commands
const systemCommands = ref([
  { command: 'docker info', description: 'Display system-wide information', risk: 'safe' },
  { command: 'docker version', description: 'Show Docker version', risk: 'safe' },
  { command: 'docker system df', description: 'Show Docker disk usage', risk: 'safe' },
  { command: 'docker system prune', description: 'Remove unused data', risk: 'destructive' },
  { command: 'docker system prune -a', description: 'Remove all unused data including images', risk: 'destructive' },
  { command: 'docker stats', description: 'Display live resource usage statistics', risk: 'safe' },
  { command: 'docker events', description: 'Get real-time events from server', risk: 'safe' }
])

// Docker Compose Commands
const composeCommands = ref([
  { command: 'docker-compose up', description: 'Create and start containers', risk: 'safe' },
  { command: 'docker-compose up -d', description: 'Create and start containers in detached mode', risk: 'safe' },
  { command: 'docker-compose down', description: 'Stop and remove containers', risk: 'disruptive' },
  { command: 'docker-compose ps', description: 'List containers', risk: 'safe' },
  { command: 'docker-compose logs', description: 'View output from containers', risk: 'safe' },
  { command: 'docker-compose build', description: 'Build or rebuild services', risk: 'safe' },
  { command: 'docker-compose pull', description: 'Pull service images', risk: 'safe' },
  { command: 'docker-compose restart', description: 'Restart services', risk: 'disruptive' },
  { command: 'docker-compose exec <service> <command>', description: 'Execute command in running container', risk: 'safe' }
])

// Helper functions for risk-based styling
const getButtonClass = (risk) => {
  switch (risk) {
    case 'destructive':
      return 'btn btn-outline-danger'
    case 'disruptive':
      return 'btn btn-outline-warning'
    case 'safe':
    default:
      return 'btn btn-outline-primary'
  }
}

const getRiskBadge = (risk) => {
  switch (risk) {
    case 'destructive':
      return { text: 'Destructive', class: 'badge bg-danger', icon: 'bi-exclamation-triangle' }
    case 'disruptive':
      return { text: 'Disruptive', class: 'badge bg-warning text-dark', icon: 'bi-exclamation-circle' }
    default:
      return null
  }
}

const getButtonTitle = (risk) => {
  switch (risk) {
    case 'destructive':
      return 'Execute destructive command (permanent changes - requires confirmation)'
    case 'disruptive':
      return 'Execute disruptive command (changes state - requires confirmation)'
    case 'safe':
    default:
      return 'Execute command'
  }
}

// Filter function
const filterCommands = (commands) => {
  if (!searchQuery.value) return commands.value

  const query = searchQuery.value.toLowerCase()
  return commands.value.filter(cmd =>
    cmd.command.toLowerCase().includes(query) ||
    cmd.description.toLowerCase().includes(query)
  )
}

// Computed properties for filtered commands
const filteredContainerCommands = computed(() => filterCommands(containerCommands))
const filteredImageCommands = computed(() => filterCommands(imageCommands))
const filteredVolumeCommands = computed(() => filterCommands(volumeCommands))
const filteredNetworkCommands = computed(() => filterCommands(networkCommands))
const filteredSystemCommands = computed(() => filterCommands(systemCommands))
const filteredComposeCommands = computed(() => filterCommands(composeCommands))

const totalFilteredCommands = computed(() => {
  return filteredContainerCommands.value.length +
    filteredImageCommands.value.length +
    filteredVolumeCommands.value.length +
    filteredNetworkCommands.value.length +
    filteredSystemCommands.value.length +
    filteredComposeCommands.value.length
})

// Computed property to show command with current selections
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

// Computed property to check if command can be executed
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
const formatDate = (timestamp) => {
  if (!timestamp || timestamp === 0) return 'Unknown'
  try {
    return new Date(timestamp * 1000).toLocaleDateString()
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatVolumeDate = (dateString) => {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Search functionality
const clearSearch = () => {
  searchQuery.value = ''
}

const highlightSearch = (text) => {
  // First, highlight placeholders like <container>, <image>, etc.
  let styledText = text.replace(/<(container|image|volume|network|service|stack|tag|port|path|name|id)>/g,
    '<span class="placeholder-highlight">&lt;$1&gt;</span>')

  // Then, highlight search terms if any
  if (!searchQuery.value) return styledText

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return styledText.replace(regex, '<mark>$1</mark>')
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
    // For safe commands, show execution modal immediately
    await showExecutionModal()
  }
}

const showConfirmationModal = async (risk) => {
  const data = {
    destructive: {
      title: 'Destructive Command Warning',
      message: 'This command will permanently delete data and cannot be undone.',
      warning: 'This action is irreversible. Make sure you have backups if needed.',
      buttonText: 'Execute Anyway',
      buttonClass: 'btn btn-danger',
      buttonIcon: 'bi-exclamation-triangle',
      icon: 'bi-exclamation-triangle-fill text-danger'
    },
    disruptive: {
      title: 'Disruptive Command Confirmation',
      message: 'This command will change the state of your Docker resources.',
      warning: 'This will affect running containers or services.',
      buttonText: 'Proceed',
      buttonClass: 'btn btn-warning',
      buttonIcon: 'bi-exclamation-circle',
      icon: 'bi-exclamation-circle-fill text-warning'
    }
  }

  confirmationData.value = data[risk]

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
  availableContainers.value = []
  availableImages.value = []
  availableVolumes.value = []
  availableNetworks.value = []
  availableServices.value = []

  // Reset loading states
  loadingContainers.value = false
  loadingImages.value = false
  loadingVolumes.value = false
  loadingNetworks.value = false
  loadingServices.value = false

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

const loadContainersForDropdown = async () => {
  loadingContainers.value = true
  try {
    const response = await fetch('http://localhost:3000/api/containers')
    const containers = await response.json()
    availableContainers.value = containers
  } catch (error) {
    console.error('Failed to load containers:', error)
    availableContainers.value = []
  } finally {
    loadingContainers.value = false
  }
}

const loadImagesForDropdown = async () => {
  loadingImages.value = true
  try {
    const response = await fetch('http://localhost:3000/api/images')
    const images = await response.json()
    availableImages.value = images
  } catch (error) {
    console.error('Failed to load images:', error)
    availableImages.value = []
  } finally {
    loadingImages.value = false
  }
}

const loadVolumesForDropdown = async () => {
  loadingVolumes.value = true
  try {
    const response = await fetch('http://localhost:3000/api/volumes')
    const volumes = await response.json()
    availableVolumes.value = volumes
  } catch (error) {
    console.error('Failed to load volumes:', error)
    availableVolumes.value = []
  } finally {
    loadingVolumes.value = false
  }
}

const loadNetworksForDropdown = async () => {
  loadingNetworks.value = true
  try {
    const response = await fetch('http://localhost:3000/api/networks')
    const networks = await response.json()
    availableNetworks.value = networks
  } catch (error) {
    console.error('Failed to load networks:', error)
    availableNetworks.value = []
  } finally {
    loadingNetworks.value = false
  }
}

const loadServicesForDropdown = async () => {
  loadingServices.value = true
  try {
    const response = await fetch('http://localhost:3000/api/services')
    const services = await response.json()
    availableServices.value = services
  } catch (error) {
    console.error('Failed to load services:', error)
    availableServices.value = []
  } finally {
    loadingServices.value = false
  }
}

const processPlaceholdersAndExecute = async () => {
  // Process placeholders first (this will show dropdown modals if needed)
  const processedCommand = await processPlaceholders(commandToExecute.value)

  // Show the execution modal with the original command (with placeholders)
  const modal = new bootstrap.Modal(document.getElementById('executionModal'))
  modal.show()

  // Start execution with the processed command
  await performExecution(processedCommand)
}

const performExecution = async (processedCommand) => {
  isExecuting.value = true
  executionResult.value = null

  try {
    const response = await fetch('http://localhost:3000/api/commands/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: processedCommand })
    })

    const result = await response.json()

    executionResult.value = {
      success: result.success,
      output: result.output,
      error: result.error
    }
  } catch (error) {
    executionResult.value = {
      success: false,
      output: '',
      error: `Failed to execute command: ${error.message}`
    }
  } finally {
    isExecuting.value = false
  }
}

const copyCommand = async (command) => {
  try {
    const processedCommand = await processPlaceholders(command)
    await navigator.clipboard.writeText(processedCommand)

    // Show a brief success indication
    const button = event.target.closest('button')
    const originalIcon = button.querySelector('i').className
    button.querySelector('i').className = 'bi bi-check'
    setTimeout(() => {
      if (button.querySelector('i')) {
        button.querySelector('i').className = originalIcon
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to copy command:', error)
  }
}

const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(executionResult.value.output)
  } catch (error) {
    console.error('Failed to copy output:', error)
  }
}

// Placeholder processing
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

onMounted(() => {
  // Component mounted
})
</script>

<style scoped>
.search-box {
  min-width: 300px;
}

.command-item {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 0;
}

.command-item:last-child {
  border-bottom: none;
}

.command-code {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  flex-grow: 1;
  margin-right: 1rem;
  word-break: break-all;
}

.placeholder-highlight {
  background: #e7f3ff;
  color: #0066cc;
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  border: 1px solid #b3d9ff;
}

.command-desc {
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.command-desc-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-group-sm .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.card-header h5 {
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .search-box {
    min-width: 250px;
  }

  .command-item .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .command-code {
    margin-right: 0;
    word-break: break-all;
  }
}

/* Custom scrollbar for pre elements */
pre {
  scrollbar-width: thin;
  scrollbar-color: #6c757d #f8f9fa;
}

pre::-webkit-scrollbar {
  width: 8px;
}

pre::-webkit-scrollbar-track {
  background: #f8f9fa;
}

pre::-webkit-scrollbar-thumb {
  background: #6c757d;
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #495057;
}

/* Highlight search terms */
mark {
  background: #fff3cd;
  padding: 0.1rem 0.2rem;
  border-radius: 0.2rem;
}

/* Modal improvements */
.modal-lg {
  max-width: 800px;
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1.5rem;
}

/* Form improvements */
.form-check-label {
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Loading spinner */
.spinner-border {
  width: 2rem;
  height: 2rem;
}

/* Alert styling */
.alert {
  border-radius: 0.5rem;
  border: none;
}

.alert-warning {
  background-color: #fff3cd;
  color: #664d03;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

/* Button improvements */
.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-warning:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
