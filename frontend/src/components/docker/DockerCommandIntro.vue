<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title"><i class="bi bi-info-circle me-2"></i>About Docker Commands</h5>
      <p class="card-text">
        This page provides a comprehensive reference of the most commonly used Docker commands. 
        These commands will help you manage containers, images, volumes, networks, and more from the command line.
      </p>
      <div class="d-flex gap-3 mt-3">
        <div class="d-flex align-items-center">
          <span class="badge bg-success me-2">Safe</span>
          <small class="text-muted">Information and listing commands</small>
        </div>
        <div class="d-flex align-items-center">
          <span class="badge bg-warning text-dark me-2">Disruptive</span>
          <small class="text-muted">Changes state but reversible</small>
        </div>
        <div class="d-flex align-items-center">
          <span class="badge bg-danger me-2">Destructive</span>
          <small class="text-muted">Permanent changes - data deletion</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for this static component
</script>