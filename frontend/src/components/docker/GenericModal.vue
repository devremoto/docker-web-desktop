<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog" :class="dialogClass">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i v-if="icon" :class="`bi ${icon} me-2`"></i>
            {{ title }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" :class="bodyClass">
          <slot name="body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2">{{ loadingText || 'Loading...' }}</p>
            </div>
            <div v-else-if="content" :class="contentClass" v-html="content"></div>
            <div v-else-if="emptyMessage" class="text-center py-3 text-muted">
              <p>{{ emptyMessage }}</p>
            </div>
          </slot>
        </div>
        <div class="modal-footer" v-if="!hideFooter">
          <slot name="footer">
        
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ closeText || 'Close' }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Modal } from 'bootstrap'

const props = defineProps({
    modalId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    dialogClass: {
        type: String,
        default: ''
    },
    bodyClass: {
        type: String,
        default: ''
    },
    contentClass: {
        type: String,
        default: ''
    },
    hideFooter: {
        type: Boolean,
        default: false
    },
    closeText: {
        type: String,
        default: 'Close'
    },
    loadingText: {
        type: String,
        default: 'Loading...'
    },
    emptyMessage: {
        type: String,
        default: ''
    }
})

const loading = ref(false)
const content = ref('')
const modalInstance = ref(null)

const show = () => {
    const modalElement = document.getElementById(props.modalId)
    if (modalElement) {
        if (!modalInstance.value) {
            modalInstance.value = new Modal(modalElement)
        }
        modalInstance.value.show()
    }
}

const hide = () => {
    if (modalInstance.value) {
        modalInstance.value.hide()
    }
}

const setContent = (newContent) => {
    content.value = newContent
}

const setLoading = (isLoading) => {
    loading.value = isLoading
}

const copyContentToClipboard = () => {
    if (content.value) {
        navigator.clipboard.writeText(content.value)
            .then(() => {
                console.log('Content copied to clipboard')
            })
            .catch(err => {
                console.error('Failed to copy content: ', err)
            })
    }
}

defineExpose({
    show,
    hide,
    setContent,
    setLoading,
    copyContentToClipboard
})
</script>

<style scoped>
.code-container {
    background-color: #212529;
    color: #adb5bd;
    padding: 1rem;
    border-radius: 0.375rem;
    max-height: 400px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
    border: 1px solid #495057;
}
</style>