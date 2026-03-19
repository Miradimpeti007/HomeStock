<script setup>
import ShoppingItemRow from '~/components/molecules/ShoppingItemRow.vue'

defineProps({ 
  categoryName: String, 
  groupData: Object,
  togglingIds: Array 
})
const emit = defineEmits(['toggle-item', 'remove-item', 'update-qty']) // Ajout du emit
</script>

<template>
  <div class="category-group">
    <div class="group-header">
      <div class="group-title">
        <span class="group-icon">📦</span>
        <div class="group-info">
          <h4>{{ categoryName }}</h4>
          <p>{{ groupData.completedCount }} / {{ groupData.items.length }} complété(s)</p>
        </div>
      </div>
      <span class="item-count-badge">{{ groupData.items.length }} ARTICLE(S)</span>
    </div>
    <div class="group-items">
      <ShoppingItemRow 
        v-for="item in groupData.items" 
        :key="item.id" 
        :item="item"
        :is-toggling="togglingIds?.includes(item.id)"
        @toggle="emit('toggle-item', $event)" 
        @remove="emit('remove-item', $event)"
        @update-qty="(id, change) => emit('update-qty', id, change)"
      />
    </div>
  </div>
</template>