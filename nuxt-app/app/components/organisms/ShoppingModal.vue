<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ 
  show: Boolean,
  categories: Array 
})
const emit = defineEmits(['close', 'save'])

const form = ref({ name: "", categoryId: "", quantity: 1, unit: "unite" })

const step = computed(() => {
  if (['L', 'kg'].includes(form.value.unit)) return 0.5
  if (['ml', 'mg'].includes(form.value.unit)) return 10
  return 1
})

const decreaseQty = () => {
  if (form.value.quantity > step.value) {
    form.value.quantity = parseFloat((form.value.quantity - step.value).toFixed(2))
  }
}

const increaseQty = () => {
  form.value.quantity = parseFloat((form.value.quantity + step.value).toFixed(2))
}

const submitForm = () => {
  emit('save', { ...form.value })
  form.value = { name: "", categoryId: "", quantity: 1, unit: "unite" }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-container">
        <button class="close-modal-btn" @click="emit('close')"><span class="close-icon-shape"></span></button>
        <header class="modal-header"><h2>Ajouter aux courses</h2></header>
        
        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label>NOM DE L'ARTICLE</label>
            <input v-model="form.name" type="text" placeholder="Ex: Lait, Œufs..." required>
          </div>

          <div class="form-group">
            <label>CATÉGORIE (Optionnel)</label>
            <select v-model="form.categoryId">
              <option value="">-- Catégorie par défaut --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>QUANTITÉ</label>
              <div class="qty-controller">
                <button type="button" class="qty-btn" @click="decreaseQty">-</button>
                <input v-model="form.quantity" type="number" :step="step" class="qty-input">
                <button type="button" class="qty-btn" @click="increaseQty">+</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>UNITÉ</label>
              <select v-model="form.unit" required>
                <option value="L">Litre (L)</option>
                <option value="kg">Kilogramme (kg)</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="mg">Milligramme (mg)</option>
                <option value="unite">Unité (u)</option>
              </select>
            </div>
          </div>
          <button type="submit" class="submit-btn">Enregistrer</button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.qty-controller {
  display: flex;
  align-items: center;
  background: var(--bg-dark);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
}
.qty-btn {
  background: transparent;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}
.qty-btn:hover { background: rgba(255, 255, 255, 0.1); }
.qty-input {
  flex: 1;
  text-align: center;
  border: none !important;
  background: transparent !important;
  padding: 10px 0 !important;
  -moz-appearance: textfield; 
}
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>