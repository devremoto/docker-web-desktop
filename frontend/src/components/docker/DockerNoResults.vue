<template>
  <div class="row">
    <div class="col-12">
      <div class="alert alert-info text-center">
        <i class="bi bi-search me-2"></i>
        No commands found matching "{{ searchQuery }}". Try adjusting your search terms.
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    searchQuery: {
        type: String,
        required: true
    }
})
</script>