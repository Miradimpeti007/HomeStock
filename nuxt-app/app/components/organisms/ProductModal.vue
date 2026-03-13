<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  categories: Array,
  locations: Array,
  productToEdit: Object // Reçu depuis la page inventaire quand on clique sur le crayon
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  id: null,
  name: "",
  categoryId: "",
  quantity: 1,
  minQuantity: 1,
  unit: "unite",
  expirationDate: "",
  locationId: "",
  autoRefill: false
})

// Pré-remplit le formulaire si on est en mode édition, sinon le vide pour une création
watch(() => props.productToEdit, (newVal) => {
  if (newVal) {
    form.value = {
      id: newVal.id,
      name: newVal.name,
      categoryId: newVal.categoryId,
      quantity: newVal.quantity,
      minQuantity: newVal.minQuantity || 1,
      unit: newVal.unit,
      expirationDate: newVal.expirationDate && !String(newVal.expirationDate).startsWith('2099') 
        ? new Date(newVal.expirationDate).toISOString().split('T')[0] 
        : "",
      locationId: newVal.locationId,
      autoRefill: !!newVal.autoRefill
    }
  } else {
    form.value = { id: null, name: "", categoryId: "", quantity: 1, minQuantity: 1, unit: "unite", expirationDate: "", locationId: "", autoRefill: false }
  }
}, { immediate: true })

const submitForm = () => {
  emit('save', { ...form.value })
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
            <h2>{{ form.id ? 'Modifier le Produit' : 'Nouveau Produit' }}</h2>
            <p>{{ form.id ? 'Mettez à jour les informations.' : 'Ajoutez un article à votre inventaire.' }}</p>
          </div>
        </header>

        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label>NOM DU PRODUIT</label>
            <input v-model="form.name" type="text" placeholder="ex: Jus de pomme" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CATÉGORIE</label>
              <select v-model="form.categoryId" required>
                <option value="" disabled>Sélectionner...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>EMPLACEMENT</label>
              <select v-model="form.locationId" required>
                <option value="" disabled>Sélectionner...</option>
                <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>QUANTITÉ ACTUELLE</label>
              <input v-model="form.quantity" type="number" step="0.1" min="0" required>
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

          <div class="form-row">
            <div class="form-group">
              <label>SEUIL D'ALERTE (Min)</label>
              <input v-model="form.minQuantity" type="number" step="0.1" min="0" required>
            </div>
            <div class="form-group">
              <label>DATE D'EXPIRATION (Optionnel)</label>
              <input v-model="form.expirationDate" type="date">
            </div>
          </div>

          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 10px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
            <label class="switch" style="margin-bottom: 0;">
              <input type="checkbox" v-model="form.autoRefill">
              <span class="slider"></span>
            </label>
            <div>
              <span style="font-weight: 600; font-size: 0.9rem; display: block; color: white;">Réassort Automatique</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Ajoute aux courses si le stock passe sous le seuil min.</span>
            </div>
          </div>

          <button type="submit" class="submit-btn">{{ form.id ? 'Mettre à jour' : 'Enregistrer' }}</button>
        </form>
      </div>
    </div>
  </Transition>
</template>