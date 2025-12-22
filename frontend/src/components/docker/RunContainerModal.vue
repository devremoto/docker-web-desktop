<template>
  <GenericModal
    :modal-id="modalId"
    :title="`Run Container: ${imageRef || ''}`"
    icon="bi-box-arrow-in-right"
    dialog-class="modal-lg"
    :hide-footer="false"
    ref="modalRef"
  >
    <template #body>
      <div>
        <div v-if="feedback" class="alert alert-success d-flex align-items-center" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          <span>{{ feedback }}</span>
        </div>
        <div class="mb-3">
          <label class="form-label">Command Preview</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-terminal"></i></span>
            <code class="d-block mt-1 p-2 bg-light rounded" style="flex: 1">{{ assembledCommand }}</code>
            <button type="button" class="btn btn-outline-secondary" @click="copyPreview" title="Copy command">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Container Name (optional)</label>
            <input type="text" class="form-control" v-model="form.name" placeholder="e.g. my-nginx" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Detach (-d)</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-model="form.detach" id="detachCheck">
              <label class="form-check-label" for="detachCheck">Run in background</label>
            </div>
          </div>
        </div>

        <hr/>

        <div class="mb-2 d-flex justify-content-between align-items-center">
          <label class="form-label mb-0">Environment Variables (-e)</label>
          <button type="button" class="btn btn-sm btn-outline-primary" @click="addEnvPair"><i class="bi bi-plus"></i> Add</button>
        </div>
        <div v-if="form.env.length === 0" class="text-muted mb-2">No environment variables</div>
        <div v-for="(pair, idx) in form.env" :key="idx" class="row g-2 align-items-center mb-2">
          <div class="col-md-5">
            <input type="text" class="form-control" v-model="pair.key" placeholder="KEY" />
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control" v-model="pair.value" placeholder="VALUE" />
          </div>
          <div class="col-md-2 d-flex">
            <button type="button" class="btn btn-outline-danger" @click="removeEnvPair(idx)"><i class="bi bi-trash"></i></button>
          </div>
        </div>

        <hr/>

        <div class="mb-2 d-flex justify-content-between align-items-center">
          <label class="form-label mb-0">Port Mappings (-p)</label>
          <button type="button" class="btn btn-sm btn-outline-primary" @click="addPort"><i class="bi bi-plus"></i> Add</button>
        </div>
        <div v-if="form.ports.length === 0" class="text-muted mb-2">No port mappings</div>
        <div v-for="(pm, idx) in form.ports" :key="idx" class="row g-2 align-items-center mb-2">
          <div class="col-md-4">
            <input type="number" class="form-control" v-model.number="pm.host" placeholder="Host Port" />
          </div>
          <div class="col-md-4">
            <input type="number" class="form-control" v-model.number="pm.container" placeholder="Container Port" />
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="pm.protocol">
              <option value="tcp">tcp</option>
              <option value="udp">udp</option>
            </select>
          </div>
          <div class="col-md-2 d-flex">
            <button type="button" class="btn btn-outline-danger" @click="removePort(idx)"><i class="bi bi-trash"></i></button>
          </div>
        </div>

        <hr/>

        <div class="mb-3">
          <label class="form-label">Command Override (optional)</label>
          <input type="text" class="form-control" v-model="form.command" placeholder="e.g. /bin/sh -c 'echo hello'" />
        </div>
      </div>
    </template>

    <template #footer>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-outline-warning" @click="resetForm"><i class="bi bi-arrow-counterclockwise me-2"></i>Reset</button>
      <button type="button" class="btn btn-primary" :disabled="!canRun" @click="emitRun"><i class="bi bi-play-fill me-2"></i>Run</button>
    </template>
  </GenericModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import GenericModal from './GenericModal.vue'

const props = defineProps({
    modalId: { type: String, default: 'runContainerModal' }
})

const modalRef = ref(null)
const imageRef = ref('')
const feedback = ref('')

const form = ref({
    name: '',
    detach: true,
    env: [], // {key, value}
    ports: [], // {host, container, protocol}
    command: ''
})

const canRun = computed(() => imageRef.value && imageRef.value.trim() !== '')

const assembledCommand = computed(() => {
    const parts = []
    parts.push('docker run')
    if (form.value.detach) parts.push('-d')
    if (form.value.name && form.value.name.trim() !== '') parts.push(`--name ${form.value.name}`)
    form.value.env.filter(e => e.key && e.value).forEach(e => parts.push(`-e ${e.key}=${e.value}`))
    form.value.ports.filter(p => p.host && p.container).forEach(p => parts.push(`-p ${p.host}:${p.container}${p.protocol && p.protocol !== 'tcp' ? '/' + p.protocol : ''}`))
    parts.push(imageRef.value)
    if (form.value.command && form.value.command.trim() !== '') parts.push(form.value.command)
    return parts.join(' ')
})

const addEnvPair = () => form.value.env.push({ key: '', value: '' })
const removeEnvPair = (idx) => form.value.env.splice(idx, 1)

const addPort = () => form.value.ports.push({ host: null, container: null, protocol: 'tcp' })
const removePort = (idx) => form.value.ports.splice(idx, 1)

const resetForm = () => {
    form.value = { name: '', detach: true, env: [], ports: [], command: '' }
}

const copyPreview = async () => {
    try {
        await navigator.clipboard.writeText(assembledCommand.value)
    } catch (e) { console.error('Copy failed', e) }
}

const showForImage = (repo, tag) => {
    const cleanRepo = repo && repo !== '<none>' ? repo : ''
    const cleanTag = tag && tag !== '<none>' ? tag : ''
    imageRef.value = cleanRepo + (cleanTag ? `:${cleanTag}` : '')
    if (cleanRepo) {
        // Suggest a default container name based on repository
        const base = cleanRepo.split('/')?.pop()?.split(':')[0] || 'container'
        form.value.name = `${base}`
    }
    resetForm()
    form.value.name = form.value.name // preserve name after reset
    modalRef.value?.show()
}

const emit = defineEmits(['run'])
const emitRun = () => emit('run', assembledCommand.value)

const hide = () => modalRef.value?.hide()
const showSuccess = (message) => {
    feedback.value = message || 'Container started successfully'
    setTimeout(() => { feedback.value = '' }, 3000)
}

defineExpose({ showForImage, resetForm, hide, showSuccess })
</script>

<style scoped>
code {
    font-size: 0.9rem;
}
</style>
