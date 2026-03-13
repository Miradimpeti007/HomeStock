<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  categories: Array
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: "",
  categoryId: "",
  quantity: 1,
  unit: "unite"
})

const submitForm = () => {
  emit('save', { ...form.value })
  form.value = { name: "", categoryId: "", quantity: 1, unit: "unite" }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-container">
        <button class="close-modal-btn" @click="emit('close')">
          <span class="close-icon-shape"></span>
        </button>
        <header class="modal-header">
          <div class="header-text">
            <h2>Ajouter aux courses</h2>
            <p>Ajoutez un article manuellement à votre liste.</p>
          </div>
        </header>
        
        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label>NOM DE L'ARTICLE</label>
            <input v-model="form.name" type="text" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>CATÉGORIE</label>
              <select v-model="form.categoryId" required>
                <option value="" disabled>Sélectionner une catégorie</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
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
          
          <div class="form-group">
            <label>QUANTITÉ</label>
            <input v-model="form.quantity" type="number" step="0.1" min="0.1" required>
          </div>
          
          <button type="submit" class="submit-btn">Enregistrer</button>
        </form>
      </div>
    </div>
  </Transition>
</template>