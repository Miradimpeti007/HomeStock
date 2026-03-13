<script setup>
import ShoppingItemRow from '~/components/molecules/ShoppingItemRow.vue'

defineProps({
  categoryName: { type: String, required: true },
  groupData: { type: Object, required: true }
})

const emit = defineEmits(['toggle-item', 'remove-item'])
</script>

<template>
  <div class="category-group">
    <div class="group-header">
      <div class="group-title">
        <span class="group-icon">📦</span>
        <div class="group-info">
          <h4>{{ categoryName }}</h4>
          <p>{{ groupData.completedCount }} / {{ groupData.items.length }} complété</p>
        </div>
      </div>
      <span class="item-count-badge">
        {{ groupData.items.length }} ARTICLE{{ groupData.items.length > 1 ? 'S' : '' }}
      </span>
    </div>

    <div class="group-items">
      <ShoppingItemRow 
        v-for="item in groupData.items" 
        :key="item.id" 
        :item="item"
        @toggle="emit('toggle-item', $event)"
        @remove="emit('remove-item', $event)"
      />
    </div>
  </div>
</template>