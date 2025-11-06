<template>
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
                :value="searchQuery" 
                type="text" 
                class="form-control" 
                placeholder="Search commands..." 
                @input="handleInput"
              >
              <button 
                v-if="searchQuery" 
                class="btn btn-outline-secondary" 
                type="button" 
                @click="$emit('clearSearch')"
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
</template>

<script setup>
defineProps({
    searchQuery: {
        type: String,
        default: ''
    },
    totalFilteredCommands: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['update:searchQuery', 'search', 'clearSearch'])

const handleInput = (event) => {
    emit('update:searchQuery', event.target.value)
    emit('search')
}
</script><style scoped>
.search-box {
    min-width: 300px;
}
</style>