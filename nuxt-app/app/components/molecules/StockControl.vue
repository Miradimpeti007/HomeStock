<script setup>
defineProps({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  productId: { type: Number, required: true }
})

const emit = defineEmits(['update-qty'])
</script>

<template>
  <div class="stock-control">
    <button class="stock-btn" @click="emit('update-qty', productId, -1)">-</button>
    <span class="stock-display">
      {{ quantity }}
      <small>{{ unit }}</small>
    </span>
    <button class="stock-btn" @click="emit('update-qty', productId, 1)">+</button>
  </div>
</template>