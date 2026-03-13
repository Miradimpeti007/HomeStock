<script setup>
defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['toggle', 'remove'])
</script>

<template>
  <div class="shopping-item" :class="{ 'is-completed': item.isCompleted }">
    <div class="item-left" @click="emit('toggle', item)">
      <div class="checkbox" :class="{ checked: item.isCompleted }">
        <span v-if="item.isCompleted">✓</span>
      </div>
      <div class="item-details" style="display: flex; flex-direction: column; margin-left: 15px;">
        <span class="item-name" style="font-weight: 600;">{{ item.name }}</span>
        <span class="item-sub" style="font-size: 0.8rem; color: var(--text-muted);">
          {{ item.quantity }} {{ item.unit }}
        </span>
      </div>
    </div>
    
    <button class="btn-action-mini danger" @click.stop="emit('remove', item)">
      🗑️
    </button>
  </div>
</template>