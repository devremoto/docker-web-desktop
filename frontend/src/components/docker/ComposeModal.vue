<template>
  <GenericModal
    ref="genericModal"
    modal-id="composeModal"
    :title="modalTitle"
    icon="bi-file-earmark-code"
    dialog-class="modal-lg"
    content-class="yaml-content"
    loading-text="Loading docker-compose file..."
    empty-message="No compose file available"
  >
  <template v-slot:footer>
    <!--copy content-->
    <button
      type="button"
      class="btn btn-primary"
      :disabled="!selectedFile"
      @click="copyContentToClipboard()"
    >
      Copy
    </button>
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
  </template>
</GenericModal>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import GenericModal from './GenericModal.vue'
import apiService from '../../services/api'
import { useDockerStore } from '../../stores/docker'

const selectedFile = ref(null)
const genericModal = ref(null)
const dockerStore = useDockerStore()

const modalTitle = computed(() => {
    return selectedFile.value ? `Docker Compose: ${selectedFile.value.fileName}` : 'Docker Compose'
})

function copyContentToClipboard() {
    if (selectedFile.value && selectedFile.value.content) {
        navigator.clipboard.writeText(selectedFile.value.content).then(() => {
            // copied successfully
        }).catch(err => {
            console.error('Failed to copy text: ', err)
        })
    }
}

// YAML syntax highlighter for docker compose files
function syntaxHighlightYaml(yamlString) {
    if (!yamlString) return ''

    let result = yamlString

    // Step 1: Highlight comments
    result = result.replace(/(#.*)$/gm, '<span class="yaml-comment">$1</span>')

    // Step 2: Highlight keys (text followed by colon)
    result = result.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)(\s*):/gm, '$1<span class="yaml-key">$2</span>$3:')

    // Step 3: Highlight string values (quoted strings)
    result = result.replace(/:\s*[\"']([^\"']*)[\"']/g, ': <span class="yaml-string">"$1"</span>')

    // Step 4: Highlight numbers
    result = result.replace(/:\s*(-?\d+(?:\.\d+)?)(?=\s*$|\s*#)/gm, ': <span class="yaml-number">$1</span>')

    // Step 5: Highlight booleans
    result = result.replace(/:\s*(true|false|yes|no|on|off)(?=\s*$|\s*#)/gim, ': <span class="yaml-boolean">$1</span>')

    // Step 6: Highlight null values
    result = result.replace(/:\s*(null|~)(?=\s*$|\s*#)/gim, ': <span class="yaml-null">$1</span>')

    // Step 7: Highlight array items (lines starting with -)
    result = result.replace(/^(\s*)(-)\s*/gm, '$1<span class="yaml-array">$2</span> ')

    // Step 8: Highlight Docker Compose specific keywords
    result = result.replace(/^(\s*)(version|services|networks|volumes|secrets|configs)(\s*):/gm, '$1<span class="yaml-docker-keyword">$2</span>$3:')

    return result
}

const viewComposeFile = async (group) => {
    try {
        if (group.type !== 'compose') {
            console.warn('Only compose groups have docker-compose files')
            return
        }

        // Get the first container to extract project information
        const firstContainer = group.containers[0]
        if (!firstContainer?.Labels?.['com.docker.compose.project']) {
            console.warn('No compose project found in container labels')
            return
        }

        const projectName = firstContainer.Labels['com.docker.compose.project']
        const workingDir = firstContainer.Labels['com.docker.compose.project.working_dir']
        const configFiles = firstContainer.Labels['com.docker.compose.project.config_files']

        genericModal.value.setLoading(true)
        genericModal.value.setContent('')
        genericModal.value.show()

        // Call backend to get compose file content using selected source
        const response = await apiService.getComposeFile(projectName, workingDir, configFiles, dockerStore.containerSource)

        if (response.content) {
            selectedFile.value = {
                fileName: response.fileName,
                content: response.content
            }
            const highlightedContent = syntaxHighlightYaml(response.content)
            genericModal.value.setContent(highlightedContent)
        } else {
            selectedFile.value = null
            genericModal.value.setContent('Docker compose file not found or not accessible')
        }
    } catch (error) {
        console.error('Failed to load docker-compose file:', error)
        selectedFile.value = null
        genericModal.value.setContent(`Error loading compose file: ${error.message || 'Unknown error'}`)
    } finally {
        genericModal.value.setLoading(false)
    }
}

defineExpose({
    viewComposeFile
})
</script>