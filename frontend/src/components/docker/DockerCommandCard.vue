<template>
  <div v-if="commands.length > 0" class="col-lg-6 mb-4">
    <div class="card h-100">
      <div class="card-header" :class="headerClass">
        <h5 class="mb-0">
          <i :class="iconClass + ' me-2'"></i>
          {{ title }} ({{ commands.length }})
        </h5>
      </div>
      <div class="card-body">
        <div class="command-item" v-for="cmd in commands" :key="cmd.command">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <code class="command-code" v-html="highlightSearch(cmd.command)"></code>
            <div class="btn-group btn-group-sm" role="group">
              <button 
                :class="getButtonClass(cmd.risk)" 
                @click="$emit('executeCommand', cmd.command)" 
                :title="getButtonTitle(cmd.risk)"
              >
                <i class="bi bi-play-fill"></i>
                <i v-if="cmd.risk !== 'safe'" class="bi bi-exclamation-triangle ms-1"></i>
              </button>
              <button class="btn btn-outline-secondary" @click="$emit('copyCommand', cmd.command)" title="Copy command">
                <i class="bi bi-clipboard"></i>
              </button>
            </div>
          </div>
          <div class="command-desc-wrapper">
            <p class="command-desc" v-html="highlightSearch(cmd.description)"></p>
            <span v-if="getRiskBadge(cmd.risk)" :class="getRiskBadge(cmd.risk).class">
              <i :class="getRiskBadge(cmd.risk).icon + ' me-1'"></i>
              {{ getRiskBadge(cmd.risk).text }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    iconClass: {
        type: String,
        required: true
    },
    headerClass: {
        type: String,
        default: 'bg-primary text-white'
    },
    commands: {
        type: Array,
        required: true
    },
    searchQuery: {
        type: String,
        default: ''
    }
})

defineEmits(['executeCommand', 'copyCommand'])

// Utility functions
const highlightSearch = (text) => {
    // First, highlight placeholders like <container>, <image>, etc.
    let styledText = text.replace(/<(container|image|volume|network|service|stack|tag|port|path|name|id)>/g,
        '<span class="placeholder-highlight">&lt;$1&gt;</span>')

    // Then, highlight search terms if any
    if (!props.searchQuery) return styledText

    const regex = new RegExp(`(${props.searchQuery})`, 'gi')
    return styledText.replace(regex, '<mark>$1</mark>')
}

const getButtonClass = (risk) => {
    switch (risk) {
        case 'safe':
            return 'btn btn-success btn-sm'
        case 'disruptive':
            return 'btn btn-warning btn-sm'
        case 'destructive':
            return 'btn btn-danger btn-sm'
        default:
            return 'btn btn-secondary btn-sm'
    }
}

const getButtonTitle = (risk) => {
    switch (risk) {
        case 'safe':
            return 'Execute command (Safe)'
        case 'disruptive':
            return 'Execute command (Disruptive - may change state)'
        case 'destructive':
            return 'Execute command (Destructive - may delete data)'
        default:
            return 'Execute command'
    }
}

const getRiskBadge = (risk) => {
    switch (risk) {
        case 'safe':
            return {
                class: 'badge bg-success text-white small',
                icon: 'bi bi-check-circle',
                text: 'Safe'
            }
        case 'disruptive':
            return {
                class: 'badge bg-warning text-dark small',
                icon: 'bi bi-exclamation-triangle',
                text: 'Disruptive'
            }
        case 'destructive':
            return {
                class: 'badge bg-danger text-white small',
                icon: 'bi bi-x-circle',
                text: 'Destructive'
            }
        default:
            return null
    }
}
</script>

<style scoped>
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

.command-item {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
}

.command-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}
</style>