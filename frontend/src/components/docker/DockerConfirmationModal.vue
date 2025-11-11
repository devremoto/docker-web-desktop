<template>
  <!-- Confirmation Modal -->
  <div class="modal fade" id="confirmationModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 80vw;">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-exclamation-triangle me-2"></i>Confirm Command Execution
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>{{ confirmationData.message }}</p>
          <div class="bg-light p-3 rounded position-relative">
            <strong>Command:</strong>
            <code class="d-block mt-1" v-html="displayCommand"></code>
            <button 
              type="button" 
              class="btn btn-outline-secondary btn-sm position-absolute top-0 end-0 mt-2 me-2"
              @click="copyCommand"
              title="Copy command"
            >
              <i class="bi bi-clipboard"></i>
            </button>
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
            @click="$emit('confirmExecution')"
            data-bs-dismiss="modal"
          >
            <i :class="confirmationData.buttonIcon + ' me-2'"></i>
            {{ confirmationData.buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
    confirmationData: {
        type: Object,
        required: true
    },
    displayCommand: {
        type: String,
        required: true
    }
})

defineEmits(['confirmExecution'])

const copyCommand = async () => {
    try {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = props.displayCommand
        const commandText = tempDiv.textContent || tempDiv.innerText

        await navigator.clipboard.writeText(commandText)
    } catch (error) {
        console.error('Failed to copy command:', error)
    }
}
</script>