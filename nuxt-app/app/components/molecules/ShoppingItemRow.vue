<script setup>
import { computed } from 'vue'

const props = defineProps({ 
  item: Object,
  isToggling: Boolean 
})
const emit = defineEmits(['toggle', 'remove', 'update-qty'])

const step = computed(() => {
  if (['L', 'kg'].includes(props.item.unit)) return 0.5
  if (['ml', 'mg'].includes(props.item.unit)) return 10
  return 1
})

const decrease = (e) => {
  e.stopPropagation() // Empêche de cocher l'article quand on clique sur le bouton "-"
  if (props.item.quantity > step.value) {
    emit('update-qty', props.item.id, -step.value)
  }
}

const increase = (e) => {
  e.stopPropagation() // Empêche de cocher l'article quand on clique sur le bouton "+"
  emit('update-qty', props.item.id, step.value)
}
</script>

<template>
  <div class="shopping-item" :class="{ 'is-completed': item.isCompleted, 'is-loading': isToggling }">
    <div class="item-left" @click="!isToggling && emit('toggle', item.id)">
      <div class="checkbox" :class="{ checked: item.isCompleted }">
        <span v-if="isToggling" class="spinner"></span>
        <span v-else-if="item.isCompleted">✓</span>
      </div>
      
      <div class="item-details" style="display: flex; flex-direction: column; margin-left: 15px;">
        <span class="item-name" style="font-weight: 600;">{{ item.name }}</span>
        
        <div class="row-qty-controller" @click.stop>
          <button type="button" class="row-qty-btn" @click="decrease" :disabled="item.quantity <= step">-</button>
          <span class="row-qty-val">{{ item.quantity }} <small>{{ item.unit }}</small></span>
          <button type="button" class="row-qty-btn" @click="increase">+</button>
        </div>
      </div>
    </div>
    
    <button class="btn-action-mini danger" :disabled="isToggling" @click.stop="!isToggling && emit('remove', item.id)">🗑️</button>
  </div>
</template>

<style scoped>
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

.is-loading { opacity: 0.6; pointer-events: none; }

/* Styles du mini contrôleur de quantité */
.row-qty-controller {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-top: 4px;
  width: fit-content;
}
.row-qty-btn {
  background: transparent;
  border: none;
  color: white;
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
}
.row-qty-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
.row-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.row-qty-val {
  font-size: 0.8rem;
  color: var(--text-muted);
  min-width: 45px;
  text-align: center;
}
</style>