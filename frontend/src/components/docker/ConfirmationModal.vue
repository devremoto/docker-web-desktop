<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="`bi me-2 ${confirmationData.icon}`"></i>
            {{ confirmationData.title }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>{{ confirmationData.message }}</p>
          <div v-if="confirmationData.type === 'danger'" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            This action cannot be undone.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button 
            type="button" 
            class="btn" 
            :class="confirmationData.buttonClass"
            @click="confirmAction"
            data-bs-dismiss="modal"
          >
            {{ confirmationData.buttonText }}
          </button>
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
        default: 'confirmationModal'
    }
})

const confirmationData = ref({
    title: '',
    message: '',
    icon: '',
    type: '',
    buttonText: '',
    buttonClass: '',
    action: null
})

const showConfirmation = (title, message, icon, type, buttonText, buttonClass, action) => {
    confirmationData.value = {
        title,
        message,
        icon,
        type,
        buttonText,
        buttonClass,
        action
    }

    const modalElement = document.getElementById(props.modalId)
    if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
    }
}

const confirmAction = () => {
    if (confirmationData.value.action) {
        confirmationData.value.action()
    }
}

defineExpose({
    showConfirmation
})
</script>