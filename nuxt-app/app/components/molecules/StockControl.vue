<script setup>
import { computed } from 'vue'

const props = defineProps({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
})

// On émet uniquement l'action de changement de quantité
const emit = defineEmits(['change-qty'])

const step = computed(() => {
  if (['L', 'kg'].includes(props.unit)) return 0.5
  if (['ml', 'mg'].includes(props.unit)) return 10
  return 1 // Par défaut pour les unités (u)
})
</script>

<template>
  <div class="stock-control">
    <button 
      class="stock-btn" 
      :class="{ disabled: quantity <= 0 }" 
      :disabled="quantity <= 0" 
      @click="emit('change-qty', -step)"
    >
      -
    </button>
    
    <span class="stock-display">
      {{ quantity }}
      <small style="font-size: 0.7rem; color: var(--text-muted); margin-left: 2px;">{{ unit }}</small>
    </span>
    
    <button class="stock-btn" @click="emit('change-qty', step)">
      +
    </button>
  </div>
</template>

<style scoped>
.stock-control {
  display: flex;
  align-items: center;
  background: var(--bg-dark);
  border-radius: 10px;
  padding: 4px;
  width: fit-content;
}
.stock-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--card-border);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.stock-btn:hover:not(.disabled) {
  background: var(--primary-purple);
}
.stock-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.stock-display {
  padding: 0 12px;
  font-weight: 700;
  min-width: 60px;
  text-align: center;
  display: flex;
  align-items: baseline;
  justify-content: center;
}
</style>