<template>
  <!-- Execution Modal -->
  <div class="modal fade" id="executionModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 80vw;">
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
            <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-terminal"></i>
                </span>
                <span class="input-group-text" style="flex-grow: 1; white-space: pre-wrap;">
                  <code class="d-block mt-1 p-2 bg-light rounded" v-html="displayCommand"></code>
                </span>
                <button  
                type="button" 
                class="btn btn-outline-secondary"
                @click="copyCommand"
                title="Copy command"
              >
                <i class="bi bi-clipboard"></i>
              </button>
                <button v-if="!isDocker"
                  type="button" 
                  class="btn btn-outline-secondary"
                  :disabled="!canExecuteCommand"
                  @click="$emit('executeOpenCurrentCommand')"
                  title="Open command">
                  <i class="bi bi-terminal"></i>
                </button>

              </div>
          </div>
          
          <!-- Parameter Selection -->
          <DockerParameterSelection
            v-if="!isExecuting && !executionResult && (commandToExecute.includes('>') && commandToExecute.includes('<'))"
            :command-to-execute="commandToExecute"
            :persistent-selections="persistentSelections"
            :loading-states="loadingStates"
            :available-options="availableOptions"
            @update:persistent-selections="$emit('update:persistentSelections', $event)"
            @load-dropdown-data="$emit('loadDropdownData', $event)"
          />
            
          <!-- Loading state -->
          <div v-if="isExecuting" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Executing...</span>
            </div>
            <p class="mt-2 text-muted">Executing command...</p>
          </div>

          <!-- Results -->
          <div v-if="executionResult" class="mt-4">
            <h6 class="mb-3">Execution Result:</h6>
            <div v-if="executionResult.success" class="alert alert-success">
              <i class="bi bi-check-circle me-2"></i>
              Command executed successfully!
            </div>
            <div v-else class="alert alert-danger">
              <i class="bi bi-x-circle me-2"></i>
              Command execution failed: {{ executionResult.error }}
            </div>
            
            <div v-if="executionResult.output" class="mt-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Output:</strong>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="copyOutput"
                  title="Copy output"
                >
                  <i class="bi bi-clipboard"></i> Copy Output
                </button>
              </div>
              <pre class="bg-dark text-light p-3 rounded mt-2 console-output"><code>{{ executionResult.output }}</code></pre>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x me-2"></i>Close
          </button>
          <!--v-if="!isExecuting && !executionResult"-->
          <button             
            type="button" 
            class="btn btn-primary"
            :disabled="!canExecuteCommand"
            @click="$emit('executeCurrentCommand')"
          >
            <i class="bi bi-play-fill me-2"></i>Execute
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DockerParameterSelection from './DockerParameterSelection.vue'

const props = defineProps({
  commandToExecute: {
    type: String,
    required: true
  },
  displayCommand: {
    type: String,
    required: true
  },
  isExecuting: {
    type: Boolean,
    default: false
  },
  executionResult: {
    type: Object,
    default: null
  },
  canExecuteCommand: {
    type: Boolean,
    default: false
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

const isDocker = import.meta.env.MODE === 'docker'

defineEmits(['executeCurrentCommand', 'update:persistentSelections', 'loadDropdownData', 'executeOpenCurrentCommand'])

const copyCommand = async () => {
  try {
    // Get the raw command text without HTML formatting
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = props.displayCommand
    const commandText = tempDiv.textContent || tempDiv.innerText

    await navigator.clipboard.writeText(commandText)
    console.log('Command copied to clipboard:', commandText)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy command:', error)
  }
}

const copyOutput = async () => {
  try {
    if (props.executionResult && props.executionResult.output) {
      await navigator.clipboard.writeText(props.executionResult.output)
      console.log('Output copied to clipboard')
      // You could add a toast notification here
    }
  } catch (error) {
    console.error('Failed to copy output:', error)
  }
}
</script>
<style scoped>
.console-output {
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  /* Allow line wrapping */
  word-break: break-word;
  /* Break long words */
}
</style>