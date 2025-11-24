<template>
  <div class="docker-compose">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col">
        <h2>
          <i class="bi bi-files me-2"></i>
          Docker Compose
        </h2>
        <p class="text-muted">Manage and execute Docker Compose files</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="row mb-4">
      <div class="col">
        <div class="btn-group" role="group">
          <button 
            class="btn btn-outline-primary" 
            :class="{ active: activeTab === 'upload' }"
            @click="activeTab = 'upload'"
          >
            <i class="bi bi-upload me-1"></i>
            Upload File
          </button>
          <button 
            class="btn btn-outline-primary"
            :class="{ active: activeTab === 'editor' }"
            @click="activeTab = 'editor'"
          >
            <i class="bi bi-code-square me-1"></i>
            Editor
          </button>
          <button 
            class="btn btn-outline-primary"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            <i class="bi bi-clock-history me-1"></i>
            History
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Tab -->
    <div v-show="activeTab === 'upload'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Upload Docker Compose File</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="upload-area" @drop.prevent="handleFileDrop" @dragover.prevent @dragenter.prevent>
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept=".yml,.yaml" 
                  @change="handleFileSelect" 
                  style="display: none"
                >
                <div class="text-center py-5">
                  <i class="bi bi-cloud-upload display-1 text-muted"></i>
                  <p class="mt-3">Drag & drop your docker-compose.yml file here</p>
                  <button class="btn btn-primary" @click="$refs.fileInput.click()">
                    <i class="bi bi-folder-open me-1"></i>
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <h6>File Information</h6>
              <div v-if="uploadedFile" class="file-info">
                <p><strong>Name:</strong> {{ uploadedFile.name }}</p>
                <p><strong>Size:</strong> {{ formatFileSize(uploadedFile.size) }}</p>
                <p><strong>Last Modified:</strong> {{ formatDate(uploadedFile.lastModified) }}</p>
                <button class="btn btn-success mt-2" @click="executeUploadedFile" :disabled="executing">
                  <i class="bi bi-play-fill me-1"></i>
                  {{ executing ? 'Executing...' : 'Execute' }}
                </button>
              </div>
              <div v-else class="text-muted">
                <p>No file selected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Tab -->
    <div v-show="activeTab === 'editor'" class="tab-content">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Docker Compose Editor</h5>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="loadTemplate">
              <i class="bi bi-file-earmark-code me-1"></i>
              Load Template
            </button>
            <button class="btn btn-outline-secondary" @click="clearEditor">
              <i class="bi bi-trash me-1"></i>
              Clear
            </button>
            <button class="btn btn-success" @click="executeFromEditor" :disabled="executing || !composeContent.trim()">
              <i class="bi bi-play-fill me-1"></i>
              {{ executing ? 'Executing...' : 'Execute' }}
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="editor-container">
            <textarea 
              v-model="composeContent"
              class="form-control editor-textarea"
              placeholder="version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - '80:80'"
              rows="20"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- History Tab -->
    <div v-show="activeTab === 'history'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Execution History</h5>
        </div>
        <div class="card-body">
          <div v-if="executionHistory.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-clock-history display-4"></i>
            <p class="mt-2">No execution history yet</p>
          </div>
          <div v-else>
            <div 
              v-for="(execution, index) in executionHistory" 
              :key="index"
              class="execution-item border-bottom pb-3 mb-3"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-1">{{ execution.fileName || 'Editor Content' }}</h6>
                  <small class="text-muted">{{ formatDate(execution.timestamp) }}</small>
                </div>
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-outline-primary" 
                    @click="loadFromHistory(execution)"
                  >
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Load
                  </button>
                  <button 
                    class="btn btn-outline-success" 
                    @click="executeFromHistory(execution)"
                    :disabled="executing"
                  >
                    <i class="bi bi-play-fill me-1"></i>
                    Execute
                  </button>
                </div>
              </div>
              <div class="mt-2">
                <span class="badge" :class="execution.success ? 'bg-success' : 'bg-danger'">
                  {{ execution.success ? 'Success' : 'Failed' }}
                </span>
                <span class="ms-2 small text-muted">{{ execution.command }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Execution Output -->
    <div v-if="showOutput" class="row mt-4">
      <div class="col">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Execution Output</h6>
            <button class="btn btn-sm btn-outline-secondary" @click="clearOutput">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="card-body">
            <pre class="output-container console-output"><code>{{ executionOutput.output }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Command Selection Modal -->
    <div 
      class="modal fade" 
      id="commandModal" 
      tabindex="-1" 
      ref="commandModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Select Docker Compose Command</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6 mb-3" v-for="cmd in composeCommands" :key="cmd.command">
                <button 
                  class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                  @click="executeCommand(cmd.command)"
                  data-bs-dismiss="modal"
                >
                  <i :class="cmd.icon + ' display-6 mb-2'"></i>
                  <strong>{{ cmd.name }}</strong>
                  <small class="text-muted mt-1">{{ cmd.description }}</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div 
      class="modal fade" 
      id="confirmationModal" 
      tabindex="-1" 
      ref="confirmationModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Docker Compose Execution</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning d-flex align-items-center">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                <strong>Warning!</strong> This action will execute docker-compose commands on your system.
              </div>
            </div>
            <p><strong>Command:</strong> <code>docker-compose {{ selectedCommand }}</code></p>
            <p><strong>Source:</strong> {{ uploadedFile?.name || 'Editor Content' }}</p>
            <div v-if="composeContent" class="mt-3">
              <h6>Docker Compose Content Preview:</h6>
              <div class="compose-preview">
                <pre>{{ composeContentPreview }}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x me-1"></i>
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-warning" 
              @click="confirmExecution"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-play-fill me-1"></i>
              Execute Command
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { Modal } from 'bootstrap'

export default {
  name: 'DockerComposeView',
  setup() {
    const activeTab = ref('upload')
    const uploadedFile = ref(null)
    const composeContent = ref('')
    const executing = ref(false)
    const executionOutput = ref({ output: '' })
    const showOutput = ref(false)
    const executionHistory = ref([])
    const selectedCommand = ref('')

    const composeCommands = ref([
      {
        command: 'up -d',
        name: 'Up (Detached)',
        description: 'Start services in background',
        icon: 'bi bi-play-circle'
      },
      {
        command: 'up',
        name: 'Up',
        description: 'Start services',
        icon: 'bi bi-play-fill'
      },
      {
        command: 'down',
        name: 'Down',
        description: 'Stop and remove services',
        icon: 'bi bi-stop-circle'
      },
      {
        command: 'ps',
        name: 'Status',
        description: 'Show service status',
        icon: 'bi bi-list-ul'
      },
      {
        command: 'logs',
        name: 'Logs',
        description: 'View service logs',
        icon: 'bi bi-journal-text'
      },
      {
        command: 'pull',
        name: 'Pull',
        description: 'Pull service images',
        icon: 'bi bi-download'
      }
    ])

    // File handling methods
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        uploadedFile.value = file
        readFileContent(file)
      }
    }

    const handleFileDrop = (event) => {
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        uploadedFile.value = file
        readFileContent(file)
      }
    }

    const readFileContent = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        composeContent.value = e.target.result
      }
      reader.readAsText(file)
    }

    // Editor methods
    const loadTemplate = () => {
      composeContent.value = `version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:`
    }

    const clearEditor = () => {
      composeContent.value = ''
    }

    const clearOutput = () => {
      showOutput.value = false
      executionOutput.value = { output: '' }
    }

    // Execution methods
    const executeUploadedFile = () => {
      if (uploadedFile.value) {
        showCommandModal()
      }
    }

    const executeFromEditor = () => {
      if (composeContent.value.trim()) {
        showCommandModal()
      }
    }

    const executeFromHistory = (execution) => {
      composeContent.value = execution.content
      executeCommand(execution.command.replace('docker-compose ', ''))
    }

    const showCommandModal = () => {
      const modal = new Modal(document.getElementById('commandModal'))
      modal.show()
    }

    const executeCommand = (command) => {
      selectedCommand.value = command
      showConfirmationModal()
    }

    const showConfirmationModal = () => {
      const modal = new Modal(document.getElementById('confirmationModal'))
      modal.show()
    }

    const confirmExecution = async () => {
      executing.value = true
      showOutput.value = true
      executionOutput.value = { output: 'Executing docker-compose ' + selectedCommand.value + '...\n' }

      try {
        // Simulate API call to execute docker-compose command
        // In a real implementation, this would call your backend API
        const response = await fetch('/api/compose/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: `docker-compose ${selectedCommand.value}`,
            content: composeContent.value
          })
        })

        const result = await response.json()
        executionOutput.value = result

        // Add to history
        executionHistory.value.unshift({
          timestamp: new Date(),
          fileName: uploadedFile.value?.name,
          content: composeContent.value,
          command: 'docker-compose ' + selectedCommand.value,
          success: response.ok
        })

      } catch (error) {
        executionOutput.value = { output: 'Error: ' + error.message }

        // Add to history as failed
        executionHistory.value.unshift({
          timestamp: new Date(),
          fileName: uploadedFile.value?.name,
          content: composeContent.value,
          command: 'docker-compose ' + selectedCommand.value,
          success: false
        })
      } finally {
        executing.value = false
      }
    }

    const loadFromHistory = (execution) => {
      composeContent.value = execution.content
      activeTab.value = 'editor'
    }

    // Utility methods
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (date) => {
      if (typeof date === 'number') {
        date = new Date(date)
      }
      return date.toLocaleString()
    }

    const composeContentPreview = computed(() => {
      if (!composeContent.value) return ''
      const lines = composeContent.value.split('\n')
      return lines.length > 10
        ? lines.slice(0, 10).join('\n') + '\n... (truncated)'
        : composeContent.value
    })

    return {
      activeTab,
      uploadedFile,
      composeContent,
      executing,
      executionOutput,
      showOutput,
      executionHistory,
      composeCommands,
      handleFileSelect,
      handleFileDrop,
      loadTemplate,
      clearEditor,
      clearOutput,
      executeUploadedFile,
      executeFromEditor,
      executeFromHistory,
      executeCommand,
      confirmExecution,
      loadFromHistory,
      formatFileSize,
      formatDate,
      selectedCommand,
      composeContentPreview
    }
  }
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  transition: border-color 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.editor-textarea {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  border: none;
  resize: vertical;
  min-height: 400px;
}

.editor-textarea:focus {
  box-shadow: none;
  outline: none;
}

.console-output {
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 1rem;

}

.execution-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.file-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.tab-content {
  min-height: 400px;
}

.btn-group .btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .file-info {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .upload-area {
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .upload-area:hover {
    border-color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.1);
  }
}

.compose-preview {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.compose-preview pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
}

/* Dark mode for compose preview */
@media (prefers-color-scheme: dark) {
  .compose-preview {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
}
</style>