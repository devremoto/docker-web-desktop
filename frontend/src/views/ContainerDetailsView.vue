<template>
  <div class="container-details">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-decoration-none">Dashboard</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/containers" class="text-decoration-none">Containers</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ containerName }}
            </li>
          </ol>
        </nav>
        
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <i class="bi bi-box-seam me-2"></i>
              {{ containerName }}
            </h2>
            <span class="badge" :class="statusBadgeClass">{{ containerStatus }}</span>
          </div>
          <div class="btn-group">
            <button 
              class="btn btn-success" 
              @click="startContainer" 
              :disabled="isRunning || loading"
              v-if="!isRunning"
            >
              <i class="bi bi-play-fill"></i> Start
            </button>
            <button 
              class="btn btn-warning" 
              @click="stopContainer" 
              :disabled="!isRunning || loading"
              v-if="isRunning"
            >
              <i class="bi bi-stop-fill"></i> Stop
            </button>
            <button 
              class="btn btn-danger" 
              @click="restartContainer" 
              :disabled="loading"
            >
              <i class="bi bi-arrow-clockwise"></i> Restart
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs" id="containerTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link active" 
          id="logs-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#logs" 
          type="button" 
          role="tab"
        >
          <i class="bi bi-journal-text me-1"></i>Logs
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          id="inspect-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#inspect" 
          type="button" 
          role="tab"
        >
          <i class="bi bi-search me-1"></i>Inspect
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          id="exec-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#exec" 
          type="button" 
          role="tab"
        >
          <i class="bi bi-terminal me-1"></i>Exec
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          id="files-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#files" 
          type="button" 
          role="tab"
        >
          <i class="bi bi-folder me-1"></i>Files
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          id="mounts-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#mounts" 
          type="button" 
          role="tab"
        >
          <i class="bi bi-hdd me-1"></i>Bind Mounts
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          id="stats-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#stats" 
          type="button" 
          role="tab"
        >
          <i class="bi bi-bar-chart me-1"></i>Stats
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content" id="containerTabContent">
      <!-- Logs Tab -->
      <div 
        class="tab-pane fade show active" 
        id="logs" 
        role="tabpanel" 
        aria-labelledby="logs-tab"
      >
        <div class="card mt-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Container Logs</h5>
            <div>
              <button class="btn btn-sm btn-outline-secondary me-2" @click="clearLogs">
                <i class="bi bi-trash"></i> Clear
              </button>
              <button class="btn btn-sm btn-outline-primary" @click="refreshLogs">
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <pre class="logs-container m-0 p-3" ref="logsContainer">{{ logs }}</pre>
          </div>
        </div>
      </div>

      <!-- Inspect Tab -->
      <div 
        class="tab-pane fade" 
        id="inspect" 
        role="tabpanel" 
        aria-labelledby="inspect-tab"
      >
        <div class="card mt-3">
          <div class="card-header">
            <h5 class="mb-0">Container Inspection</h5>
          </div>
          <div class="card-body">
            <div class="inspect-container inspect-json" v-html="highlightedInspectData"></div>
          </div>
        </div>
      </div>

      <!-- Exec Tab -->
      <div 
        class="tab-pane fade" 
        id="exec" 
        role="tabpanel" 
        aria-labelledby="exec-tab"
      >
        <div class="card mt-3">
          <div class="card-header">
            <h5 class="mb-0">Execute Commands</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="execCommand" class="form-label">Command</label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  id="execCommand"
                  v-model="execCommand"
                  placeholder="Enter command to execute..."
                  @keyup.enter="executeCommand"
                >
                <button class="btn btn-primary" type="button" @click="executeCommand">
                  <i class="bi bi-play-fill"></i> Execute
                </button>
              </div>
            </div>
            <div class="terminal-output">
              <pre class="bg-dark text-light p-3 rounded">{{ execOutput }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Files Tab -->
      <div 
        class="tab-pane fade" 
        id="files" 
        role="tabpanel" 
        aria-labelledby="files-tab"
      >
        <div class="card mt-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">File Browser</h5>
            <div class="d-flex align-items-center">
              <span class="me-3">Path: {{ currentPath }}</span>
              <button class="btn btn-sm btn-outline-primary" @click="refreshFiles">
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="currentPath !== '/'" @click="navigateUp" class="cursor-pointer">
                    <td>
                      <i class="bi bi-arrow-up-circle me-2"></i>..
                    </td>
                    <td>Directory</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                  <tr 
                    v-for="file in files" 
                    :key="file.name"
                    @click="navigateToFile(file)"
                    class="cursor-pointer"
                  >
                    <td>
                      <i :class="getFileIcon(file)" class="me-2"></i>
                      {{ file.name }}
                    </td>
                    <td>{{ file.type }}</td>
                    <td>{{ formatFileSize(file.size) }}</td>
                    <td>{{ formatDate(file.modified) }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-primary me-1"
                        @click.stop="downloadFile(file)"
                        v-if="file.type === 'file'"
                      >
                        <i class="bi bi-download"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Bind Mounts Tab -->
      <div 
        class="tab-pane fade" 
        id="mounts" 
        role="tabpanel" 
        aria-labelledby="mounts-tab"
      >
        <div class="card mt-3">
          <div class="card-header">
            <h5 class="mb-0">Bind Mounts & Volumes</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive" v-if="mounts.length > 0">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Mode</th>
                    <th>RW</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mount in mounts" :key="mount.Destination">
                    <td>
                      <span class="badge bg-info">{{ mount.Type }}</span>
                    </td>
                    <td>{{ mount.Source || 'N/A' }}</td>
                    <td>{{ mount.Destination }}</td>
                    <td>{{ mount.Mode || 'Default' }}</td>
                    <td>
                      <span :class="mount.RW ? 'text-success' : 'text-danger'">
                        <i :class="mount.RW ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                        {{ mount.RW ? 'Read/Write' : 'Read Only' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center text-muted py-4">
              <i class="bi bi-hdd display-4"></i>
              <p class="mt-2">No bind mounts or volumes found</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Tab -->
      <div 
        class="tab-pane fade" 
        id="stats" 
        role="tabpanel" 
        aria-labelledby="stats-tab"
      >
        <div class="row mt-3">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">CPU Usage</h6>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="display-6">{{ stats.cpuPercentage }}%</span>
                  <div class="progress flex-grow-1 ms-3" style="height: 10px;">
                    <div 
                      class="progress-bar" 
                      :style="`width: ${stats.cpuPercentage}%`"
                      :class="getCpuProgressClass(stats.cpuPercentage)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Memory Usage</h6>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="display-6">{{ stats.memoryPercentage }}%</span>
                  <div class="progress flex-grow-1 ms-3" style="height: 10px;">
                    <div 
                      class="progress-bar" 
                      :style="`width: ${stats.memoryPercentage}%`"
                      :class="getMemoryProgressClass(stats.memoryPercentage)"
                    ></div>
                  </div>
                </div>
                <small class="text-muted">
                  {{ formatBytes(stats.memoryUsage) }} / {{ formatBytes(stats.memoryLimit) }}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row mt-3">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Network I/O</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-6">
                    <div class="text-center">
                      <i class="bi bi-arrow-down-circle text-success display-6"></i>
                      <h6 class="mt-2">RX</h6>
                      <span>{{ formatBytes(stats.networkRx) }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center">
                      <i class="bi bi-arrow-up-circle text-primary display-6"></i>
                      <h6 class="mt-2">TX</h6>
                      <span>{{ formatBytes(stats.networkTx) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Block I/O</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-6">
                    <div class="text-center">
                      <i class="bi bi-hdd text-info display-6"></i>
                      <h6 class="mt-2">Read</h6>
                      <span>{{ formatBytes(stats.blockRead) }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center">
                      <i class="bi bi-hdd-fill text-warning display-6"></i>
                      <h6 class="mt-2">Write</h6>
                      <span>{{ formatBytes(stats.blockWrite) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import apiService from '../services/api'
import { useDockerStore } from '../stores/docker'

export default {
  name: 'ContainerDetailsView',
  setup() {
    const route = useRoute()
    const containerId = computed(() => route.params.id)
    const dockerStore = useDockerStore()

    // Reactive data
    const container = ref({})
    const logs = ref('')
    const inspectData = ref('')
    // Highlighted JSON for inspect tab
    const highlightedInspectData = computed(() => {

      if (!inspectData.value) return ''
      return syntaxHighlightJson(inspectData.value)
    })
    const loading = ref(false)
    const execCommand = ref('')
    const execOutput = ref('')
    const currentPath = ref('/')
    const files = ref([])
    const mounts = ref([])
    const stats = ref({
      cpuPercentage: 0,
      memoryPercentage: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      networkRx: 0,
      networkTx: 0,
      blockRead: 0,
      blockWrite: 0
    })

    // Computed properties
    const containerName = computed(() => {
      return container.value.Names?.[0]?.replace('/', '') || containerId.value
    })

    const containerStatus = computed(() => {
      return container.value.State || 'Unknown'
    })

    const statusBadgeClass = computed(() => {
      const state = container.value.State
      if (state === 'running') return 'bg-success'
      if (state === 'exited') return 'bg-danger'
      if (state === 'paused') return 'bg-warning'
      return 'bg-secondary'
    })

    const isRunning = computed(() => {
      return container.value.State === 'running'
    })

    // Intervals for real-time updates
    let statsInterval = null
    let logsInterval = null

    // Methods
    // JSON syntax highlighter
    function syntaxHighlightJson(jsonString) {
      if (!jsonString) return ''

      let result = jsonString

      // Step 1: Highlight property keys (quoted strings followed by colon)
      result = result.replace(/"([^"]+)"\s*:/g, '<span class="json-key">"$1"</span>:')

      // Step 2: Highlight string values after colons (property values) - must not be inside spans
      result = result.replace(/:\s*"([^"]*)"/g, function (match) {
        if (match.includes('<span')) return match
        return match.replace(/"([^"]*)"/, '<span class="json-string">"$1"</span>')
      })

      // Step 3: Highlight string values in arrays - must not be inside spans
      result = result.replace(/\[\s*"([^"]*)"/g, function (match) {
        if (match.includes('<span')) return match
        return match.replace(/"([^"]*)"/, '<span class="json-string">"$1"</span>')
      })
      result = result.replace(/,\s*"([^"]*)"/g, function (match) {
        if (match.includes('<span')) return match
        return match.replace(/"([^"]*)"/, '<span class="json-string">"$1"</span>')
      })

      // Step 4: Highlight standalone numbers (not inside quoted strings)
      result = result.replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=\s*[,\}\]])/g, ': <span class="json-number">$1</span>')
      result = result.replace(/\[\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=\s*[,\]])/g, '[<span class="json-number">$1</span>')
      result = result.replace(/,\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=\s*[,\}\]])/g, ', <span class="json-number">$1</span>')

      // Step 5: Highlight booleans (not inside quoted strings or spans)
      result = result.replace(/:\s*(true|false)(?=\s*[,\}\]])/g, ': <span class="json-boolean">$1</span>')
      result = result.replace(/\[\s*(true|false)(?=\s*[,\]])/g, '[<span class="json-boolean">$1</span>')
      result = result.replace(/,\s*(true|false)(?=\s*[,\}\]])/g, ', <span class="json-boolean">$1</span>')

      // Step 6: Highlight null (not inside quoted strings or spans)
      result = result.replace(/:\s*(null)(?=\s*[,\}\]])/g, ': <span class="json-null">$1</span>')
      result = result.replace(/\[\s*(null)(?=\s*[,\]])/g, '[<span class="json-null">$1</span>')
      result = result.replace(/,\s*(null)(?=\s*[,\}\]])/g, ', <span class="json-null">$1</span>')

      return result
    }
    const loadContainer = async () => {
      try {
        const containers = await apiService.getContainers(true, dockerStore.containerSource)
        container.value = containers.find(c => c.Id === containerId.value) || {}
      } catch (error) {
        console.error('Error loading container:', error)
      }
    }

    const loadLogs = async () => {
      try {
        const response = await apiService.getContainerLogs(containerId.value, 100, dockerStore.containerSource)
        logs.value = response
      } catch (error) {
        console.error('Error loading logs:', error)
        logs.value = 'Error loading logs: ' + error.message
      }
    }

    const loadInspect = async () => {
      try {
        const response = await apiService.inspectContainer(containerId.value, dockerStore.containerSource)
        inspectData.value = JSON.stringify(response, null, 2)
        // Extract mounts information
        if (response.Mounts) {
          mounts.value = response.Mounts
        }
      } catch (error) {
        console.error('Error inspecting container:', error)
        inspectData.value = 'Error inspecting container: ' + error.message
      }
    }

    const loadStats = async () => {
      try {
        const response = await apiService.getContainerStats(containerId.value, dockerStore.containerSource)
        if (response) {
          stats.value = {
            cpuPercentage: parseFloat(response.cpuPercentage || 0).toFixed(1),
            memoryPercentage: parseFloat(response.memoryPercentage || 0).toFixed(1),
            memoryUsage: response.memoryUsage || 0,
            memoryLimit: response.memoryLimit || 0,
            networkRx: response.networkRx || 0,
            networkTx: response.networkTx || 0,
            blockRead: response.blockRead || 0,
            blockWrite: response.blockWrite || 0
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    const loadFiles = async (path = '/') => {
      try {
        const response = await apiService.getContainerFiles(containerId.value, path, dockerStore.containerSource)
        files.value = response || []
        currentPath.value = path
      } catch (error) {
        console.error('Error loading files:', error)
        files.value = []
      }
    }

    const startContainer = async () => {
      loading.value = true
      try {
        await apiService.startContainer(containerId.value, dockerStore.containerSource)
        await loadContainer()
      } catch (error) {
        console.error('Error starting container:', error)
      } finally {
        loading.value = false
      }
    }

    const stopContainer = async () => {
      loading.value = true
      try {
        await apiService.stopContainer(containerId.value, dockerStore.containerSource)
        await loadContainer()
      } catch (error) {
        console.error('Error stopping container:', error)
      } finally {
        loading.value = false
      }
    }

    const restartContainer = async () => {
      loading.value = true
      try {
        await apiService.restartContainer(containerId.value, dockerStore.containerSource)
        await loadContainer()
      } catch (error) {
        console.error('Error restarting container:', error)
      } finally {
        loading.value = false
      }
    }

    const executeCommand = async () => {
      if (!execCommand.value.trim()) return

      try {
        const response = await apiService.execContainer(containerId.value, execCommand.value, dockerStore.containerSource)
        execOutput.value += `$ ${execCommand.value}\n${response}\n\n`
        execCommand.value = ''
      } catch (error) {
        console.error('Error executing command:', error)
        execOutput.value += `$ ${execCommand.value}\nError: ${error.message}\n\n`
        execCommand.value = ''
      }
    }

    const clearLogs = () => {
      logs.value = ''
    }

    const refreshLogs = async () => {
      await loadLogs()
    }

    const refreshFiles = async () => {
      await loadFiles(currentPath.value)
    }

    const navigateUp = () => {
      const pathParts = currentPath.value.split('/').filter(p => p)
      pathParts.pop()
      const newPath = '/' + pathParts.join('/')
      loadFiles(newPath === '/' ? '/' : newPath)
    }

    const navigateToFile = (file) => {
      if (file.type === 'directory') {
        const newPath = currentPath.value === '/'
          ? `/${file.name}`
          : `${currentPath.value}/${file.name}`
        loadFiles(newPath)
      }
    }

    const downloadFile = async (file) => {
      try {
        const filePath = currentPath.value === '/'
          ? `/${file.name}`
          : `${currentPath.value}/${file.name}`
        await apiService.downloadContainerFile(containerId.value, filePath, dockerStore.containerSource)
      } catch (error) {
        console.error('Error downloading file:', error)
      }
    }

    // Utility methods
    const getFileIcon = (file) => {
      if (file.type === 'directory') return 'bi bi-folder-fill text-warning'
      if (file.name.endsWith('.txt') || file.name.endsWith('.log')) return 'bi bi-file-text text-info'
      if (file.name.endsWith('.json') || file.name.endsWith('.xml')) return 'bi bi-file-code text-success'
      if (file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.gif')) return 'bi bi-file-image text-primary'
      return 'bi bi-file text-secondary'
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0 || bytes === undefined) return '-'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatBytes = (bytes) => {
      if (bytes === 0 || bytes === undefined) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }

    const getCpuProgressClass = (percentage) => {
      if (percentage > 80) return 'bg-danger'
      if (percentage > 60) return 'bg-warning'
      return 'bg-success'
    }

    const getMemoryProgressClass = (percentage) => {
      if (percentage > 85) return 'bg-danger'
      if (percentage > 70) return 'bg-warning'
      return 'bg-info'
    }

    // Lifecycle
    onMounted(async () => {
      await loadContainer()
      await loadLogs()
      await loadInspect()
      await loadFiles()
      await loadStats()

      // Set up real-time updates
      statsInterval = setInterval(loadStats, 5000) // Update stats every 5 seconds
      logsInterval = setInterval(loadLogs, 10000) // Update logs every 10 seconds
    })

    onUnmounted(() => {
      if (statsInterval) clearInterval(statsInterval)
      if (logsInterval) clearInterval(logsInterval)
    })

    return {
      containerId,
      container,
      containerName,
      containerStatus,
      statusBadgeClass,
      isRunning,
      loading,
      logs,
      inspectData,
      highlightedInspectData,
      execCommand,
      execOutput,
      currentPath,
      files,
      mounts,
      stats,
      startContainer,
      stopContainer,
      restartContainer,
      executeCommand,
      clearLogs,
      refreshLogs,
      refreshFiles,
      navigateUp,
      navigateToFile,
      downloadFile,
      getFileIcon,
      formatFileSize,
      formatBytes,
      formatDate,
      getCpuProgressClass,
      getMemoryProgressClass
    }
  }
}
</script>

<style scoped>
.logs-container {
  height: 400px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.inspect-container {
  height: 500px;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #444;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
}

.inspect-json {
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

/* JSON syntax highlight styles */

.terminal-output {
  max-height: 400px;
  overflow-y: auto;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: transparent;
  border-bottom: 2px solid #0d6efd;
  color: #0d6efd;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.progress {
  background-color: #e9ecef;
}

.display-6 {
  font-size: 1.5rem;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    margin-bottom: 0.25rem;
  }
}
</style>

<style>
/* Global JSON syntax highlight styles */
.json-key {
  color: #f92672 !important;
  font-weight: normal;
}

.json-string {
  color: #a6e22e !important;
}

.json-number {
  color: #ffcc02 !important;
}

.json-boolean {
  color: #ff8c00 !important;
}

.json-null {
  color: #ae81ff !important;
}
</style>