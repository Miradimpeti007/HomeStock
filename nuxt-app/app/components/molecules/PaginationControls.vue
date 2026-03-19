<script setup>
defineProps({
  currentPage: { type: Number, required: true },
  lastPage: { type: Boolean, required: true }
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <div class="pagination-container" style="display: flex; gap: 10px; justify-content: center; margin-top: 2rem;">
    <button 
      class="filter-btn" 
      :class="{ 'disabled': currentPage === 1 }"
      :disabled="currentPage === 1"
      @click="emit('prev')"
    >
      ◀ Précédent
    </button>
    
    <span style="display: flex; align-items: center; font-weight: bold;">Page {{ currentPage }}</span>
    
    <button 
      class="filter-btn" 
      :class="{ 'disabled': lastPage }"
      :disabled="lastPage"
      @click="emit('next')"
    >
      Suivant ▶
    </button>
  </div>
</template>

<style scoped>
.disabled { opacity: 0.5; cursor: not-allowed; }
</style>