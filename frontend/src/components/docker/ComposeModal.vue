<template>
  <!-- This component creates a modal dynamically when showComposeFile is called -->
</template>

<script setup>
import apiService from '../../services/api'

// YAML syntax highlighter for docker compose files
function syntaxHighlightYaml(yamlString) {
    if (!yamlString) return ''

    let result = yamlString

    // Step 1: Highlight comments
    result = result.replace(/^(\s*)(#.*)$/gm, '$1<span class="yaml-comment">$2</span>')

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

        // Call backend to get compose file content
        const response = await apiService.getComposeFile(projectName, workingDir, configFiles)

        if (response.content) {
            showComposeModal(response.fileName, response.content)
        } else {
            console.warn('Docker compose file not found or not accessible')
        }
    } catch (error) {
        console.error('Failed to load docker-compose file:', error)
    }
}

const showComposeModal = (fileName, content) => {
    // Create modal to display compose file
    const modal = document.createElement('div')
    modal.className = 'compose-file-modal-global'
    // Detect dark mode first
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark'

    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.5) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 1055 !important;
        padding: 20px !important;
        box-sizing: border-box !important;
    `

    const modalContent = document.createElement('div')
    modalContent.className = 'compose-modal-content'
    // Use the same color scheme as Bootstrap modals for consistency
    modalContent.style.cssText = `
        padding: 1.5rem !important;
        border-radius: 0.5rem !important;
        max-width: 90vw !important;
        max-height: 90vh !important;
        width: 1000px !important;
        overflow: hidden !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        background-color: #343a40 !important;
        color: #adb5bd !important;
        border: 1px solid #495057 !important;
    `

    modalContent.innerHTML = `
        <div class="compose-modal-header" style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 1rem !important; padding-bottom: 0.5rem !important; color: #adb5bd !important; border-bottom: 1px solid #495057 !important;">
            <h5 class="compose-modal-title" style="margin: 0 !important; font-weight: 600 !important; color: #adb5bd !important;">
                <i class="bi bi-file-earmark-code"></i> ${fileName}
            </h5>
            <button type="button" class="close-btn compose-close-btn" style="background: none !important; border: none !important; font-size: 1.5rem !important; cursor: pointer !important; padding: 0.25rem !important; width: 32px !important; height: 32px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 0.25rem !important; color: #adb5bd !important; opacity: 0.75 !important; line-height: 1 !important;">&times;</button>
        </div>
        <div style="flex: 1 !important; overflow: auto !important;">
            <div class="compose-code-content" style="padding: 1rem !important; border-radius: 0.375rem !important; margin: 0 !important; white-space: pre-wrap !important; word-wrap: break-word !important; font-family: 'Courier New', monospace !important; font-size: 0.875rem !important; line-height: 1.4 !important; height: 100% !important; overflow: auto !important; background-color: #212529 !important; color: #adb5bd !important; max-height: 400px !important; border: 1px solid #495057 !important;">${syntaxHighlightYaml(content)}</div>
        </div>
        <div class="compose-modal-footer" style="display: flex !important; justify-content: flex-end !important; padding-top: 0.5rem !important; margin-top: 1rem !important; border-top: 1px solid #495057 !important;">
            <button class="btn btn-secondary compose-btn-close" style="border: none !important; padding: 0.375rem 0.75rem !important; border-radius: 0.375rem !important; cursor: pointer !important; font-weight: 400 !important; background-color: #6c757d !important; color: #fff !important; border: 1px solid #6c757d !important;">Close</button>
        </div>
    `

    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // Apply consistent styling matching Bootstrap modal theme
    const codeContent = modal.querySelector('.compose-code-content')
    // Keep the same dark theme as Bootstrap modals for consistency
    codeContent.style.backgroundColor = '#212529 !important'
    codeContent.style.color = '#adb5bd !important'

    // Apply syntax highlighting CSS classes - consistent with Bootstrap modal theme
    const style = document.createElement('style')
    style.textContent = `
    .compose-file-modal-global .compose-code-content {
      background-color: #212529 !important;
      color: #adb5bd !important;
    }
    .compose-file-modal-global .yaml-key { 
      color: #58a6ff !important; 
      font-weight: 600 !important; 
    }
    .compose-file-modal-global .yaml-string { 
      color: #a5d6ff !important; 
    }
    .compose-file-modal-global .yaml-number { 
      color: #d2a8ff !important; 
    }
    .compose-file-modal-global .yaml-boolean { 
      color: #ff7b72 !important; 
      font-weight: 500 !important; 
    }
    .compose-file-modal-global .yaml-null { 
      color: #8b949e !important; 
      font-style: italic !important; 
    }
    .compose-file-modal-global .yaml-comment { 
      color: #8b949e !important; 
      font-style: italic !important; 
    }
    .compose-file-modal-global .yaml-array { 
      color: #58a6ff !important; 
      font-weight: bold !important; 
    }
    .compose-file-modal-global .yaml-docker-keyword { 
      color: #d2a8ff !important; 
      font-weight: bold !important; 
    }
    .compose-file-modal-global .compose-close-btn:hover {
      opacity: 1 !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
    .compose-file-modal-global .compose-btn-close:hover {
      background-color: #5c636a !important;
      border-color: #565e64 !important;
    }
  `
    document.head.appendChild(style)

    // Store style reference for cleanup
    modal._syntaxStyle = style

    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn')
    const closeButton = modal.querySelector('.compose-btn-close')

    const closeModal = () => {
        // Clean up dynamically added styles
        if (modal._syntaxStyle) {
            modal._syntaxStyle.remove()
        }
        modal.remove()
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal)
    }
    if (closeButton) {
        closeButton.addEventListener('click', closeModal)
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal()
    })

    // Hover effects are now handled by CSS classes automatically

    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal()
            document.removeEventListener('keydown', handleEscape)
        }
    }
    document.addEventListener('keydown', handleEscape)
}

defineExpose({
    viewComposeFile
})
</script>