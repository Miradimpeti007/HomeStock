<script setup>
import { computed } from 'vue'

const props = defineProps({ total: Number, completed: Number })
const progressPercentage = computed(() => props.total === 0 ? 0 : Math.round((props.completed / props.total) * 100))
</script>

<template>
  <section class="progression-card">
    <div class="progression-info">
      <div class="progression-text">
        <h3>Progression</h3>
        <p>{{ completed }} sur {{ total }} articles achetés</p>
      </div>
      <div class="progression-value">{{ progressPercentage }}%</div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>
  </section>
</template>