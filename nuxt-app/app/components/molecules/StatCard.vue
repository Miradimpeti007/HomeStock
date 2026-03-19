<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  icon: { type: String, required: true },
  colorClass: { type: String, required: true } // 'blue', 'pink', ou 'yellow'
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-icon-bg" :class="colorClass">{{ icon }}</div>
    <div class="stat-info">
      <span class="stat-label">{{ label }}</span>
      <div class="stat-row">
        <span class="stat-value">{{ value }}</span>
      </div>
    </div>
  </div>
</template>