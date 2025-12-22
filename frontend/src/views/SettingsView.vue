<template>
  <div class="container py-4">
    <div class="row mb-3">
      <div class="col">
        <h2><i class="bi bi-gear me-2"></i>Settings</h2>
        <p class="text-muted">Configure WSL2 and other preferences.</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">WSL2 Configuration</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label for="wslDistro" class="form-label">WSL Distro Name</label>
          <input
            id="wslDistro"
            type="text"
            class="form-control"
            v-model="wslDistro"
            placeholder="e.g., Ubuntu, Ubuntu-22.04"
          />
          <small class="form-text text-muted">
            Used when source is set to WSL2. Defaults to "Ubuntu" if unspecified.
          </small>
        </div>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
          <i class="bi bi-save me-2"></i>Save Settings
        </button>
        <span v-if="saved" class="text-success ms-3"><i class="bi bi-check-circle me-1"></i>Saved</span>
      </div>
    </div>
  </div>
 </template>

 <script setup lang="ts">
import { ref, onMounted } from 'vue'

const wslDistro = ref<string>('Ubuntu')
const saving = ref<boolean>(false)
const saved = ref<boolean>(false)

const saveSettings = () => {
    saving.value = true
    localStorage.setItem('wslDistro', wslDistro.value.trim())
    saved.value = true
    setTimeout(() => { saved.value = false; saving.value = false }, 1200)
}

onMounted(() => {
    const current = localStorage.getItem('wslDistro')
    wslDistro.value = current || 'Ubuntu'
})
</script>

 <style scoped>
.card {
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}
</style>