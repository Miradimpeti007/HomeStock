<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  categories: Array,
  locations: Array,
  productToEdit: Object
})

// Ajout de l'événement 'category-added'
const emit = defineEmits(['close', 'save', 'location-added', 'category-added'])

const form = ref({
  name: "", categoryId: "", locationId: "", quantity: 1, unit: "unite",
  minQuantity: 0, autoRefill: false, expirationDate: ""
})

const isAddingLocation = ref(false)
const newLocationName = ref("")

// États pour la création de catégorie
const isAddingCategory = ref(false)
const newCategoryName = ref("")

watch(() => props.productToEdit, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
    
    if (form.value.unit === 'u' || form.value.unit === 'U') form.value.unit = 'unite'
    if (form.value.minQuantity === null || form.value.minQuantity === undefined) form.value.minQuantity = 0

    // SÉCURITÉ : Empêche un crash si la date en base de données est invalide
    if (newVal.expirationDate && String(newVal.expirationDate).startsWith('2099')) {
      form.value.expirationDate = ""
    } else if (newVal.expirationDate) {
      try {
        form.value.expirationDate = new Date(newVal.expirationDate).toISOString().split('T')[0]
      } catch (e) {
        form.value.expirationDate = ""
      }
    }
  } else {
    form.value = { name: "", categoryId: "", locationId: "", quantity: 1, unit: "unite", minQuantity: 0, autoRefill: false, expirationDate: "" }
  }
  isAddingLocation.value = false
  newLocationName.value = ""
  isAddingCategory.value = false
  newCategoryName.value = ""
}, { immediate: true })

const submitForm = () => {
  const nameVal = form.value.name ? String(form.value.name).trim() : ""
  if (nameVal === "") {
    alert("⚠️ Le nom du produit est obligatoire.")
    return
  }
  if (!form.value.categoryId) {
    alert("⚠️ Veuillez sélectionner une catégorie.")
    return
  }
  if (!form.value.locationId) {
    alert("⚠️ Veuillez sélectionner un emplacement.")
    return
  }
  
  const qty = parseFloat(form.value.quantity)
  if (isNaN(qty) || qty < 0) {
    alert("⚠️ La quantité est invalide.")
    return
  }

  if (isAddingLocation.value) {
    alert("⚠️ Veuillez valider (bouton vert ✓) ou annuler (bouton rouge ✗) la création du nouvel emplacement d'abord.")
    return
  }
  
  if (isAddingCategory.value) {
    alert("⚠️ Veuillez valider (bouton vert ✓) ou annuler (bouton rouge ✗) la création de la nouvelle catégorie d'abord.")
    return
  }

  emit('save', form.value)
}

const handleCreateLocation = async () => {
  if (newLocationName.value.trim() === "") return
  
  // Utilisation de la méthode déclarée dans preload.js
  const res = await window.api.config.createLocation({ name: newLocationName.value.trim() })
  if (res?.success) {
    emit('location-added') 
    form.value.locationId = res.data.id 
    isAddingLocation.value = false
    newLocationName.value = ""
  } else {
    alert(`Erreur lors de la création : ${res?.message}`)
  }
}

const handleCreateCategory = async () => {
  if (newCategoryName.value.trim() === "") return
  
  // Génération d'une couleur HEX valide pour satisfaire le categoryMapping du backend
  const niceColors = ['#ff7675', '#74b9ff', '#55efc4', '#00b894', '#fdcb6e', '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe', '#e17055']
  const randomColor = niceColors[Math.floor(Math.random() * niceColors.length)]

  // Utilisation de la méthode déclarée dans preload.js
  const res = await window.api.config.createCategory({ 
    name: newCategoryName.value.trim(),
    color: randomColor
  })
  
  if (res?.success) {
    emit('category-added') 
    form.value.categoryId = res.data.id 
    isAddingCategory.value = false
    newCategoryName.value = ""
  } else {
    alert(`Erreur lors de la création : ${res?.message}`)
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-container">
        <button class="close-modal-btn" @click="emit('close')"><span class="close-icon-shape"></span></button>
        <header class="modal-header">
          <h2>{{ productToEdit ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
        </header>
        
        <form class="modal-form" @submit.prevent="submitForm">
          <div class="form-group">
            <label>NOM DU PRODUIT *</label>
            <input v-model="form.name" type="text" placeholder="Ex: Lait, Œufs...">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CATÉGORIE *</label>
              
              <div v-if="!isAddingCategory" style="display: flex; gap: 8px; align-items: center;">
                <select v-model="form.categoryId" style="flex: 1;">
                  <option value="" disabled>-- Sélectionner --</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <button type="button" @click="isAddingCategory = true" class="action-btn-small purple" title="Créer une nouvelle catégorie">+</button>
              </div>
              
              <div v-else style="display: flex; gap: 6px; align-items: center;">
                <input v-model="newCategoryName" type="text" placeholder="Nom de la catégorie..." style="flex: 1;" @keydown.enter.prevent="handleCreateCategory">
                <button type="button" @click="handleCreateCategory" class="action-btn-small green">✓</button>
                <button type="button" @click="isAddingCategory = false" class="action-btn-small red">✗</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>EMPLACEMENT *</label>
              
              <div v-if="!isAddingLocation" style="display: flex; gap: 8px; align-items: center;">
                <select v-model="form.locationId" style="flex: 1;">
                  <option value="" disabled>-- Sélectionner --</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
                <button type="button" @click="isAddingLocation = true" class="action-btn-small purple" title="Créer un nouvel emplacement">+</button>
              </div>
              
              <div v-else style="display: flex; gap: 6px; align-items: center;">
                <input v-model="newLocationName" type="text" placeholder="Nom du lieu..." style="flex: 1;" @keydown.enter.prevent="handleCreateLocation">
                <button type="button" @click="handleCreateLocation" class="action-btn-small green">✓</button>
                <button type="button" @click="isAddingLocation = false" class="action-btn-small red">✗</button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>QUANTITÉ *</label>
              <input v-model="form.quantity" type="number" step="0.1" min="0">
            </div>
            <div class="form-group">
              <label>UNITÉ *</label>
              <select v-model="form.unit">
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
              <label>SEUIL D'ALERTE</label>
              <input v-model="form.minQuantity" type="number" step="0.1" min="0">
            </div>
            <div class="form-group">
              <label>RÉASSORT AUTO</label>
              <select v-model="form.autoRefill">
                <option :value="true">Activé</option>
                <option :value="false">Désactivé</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>DATE D'EXPIRATION (Optionnel)</label>
            <input v-model="form.expirationDate" type="date">
          </div>
          
          <button type="button" class="submit-btn" @click="submitForm">Enregistrer</button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.action-btn-small {
  border: none;
  border-radius: 8px;
  width: 42px;
  height: 42px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  transition: 0.2s;
}
.action-btn-small.purple { background: var(--primary-purple); }
.action-btn-small.purple:hover { background: #6258ff; }
.action-btn-small.green { background: rgba(0, 255, 163, 0.2); color: #00ffa3; }
.action-btn-small.green:hover { background: rgba(0, 255, 163, 0.3); }
.action-btn-small.red { background: rgba(255, 77, 77, 0.2); color: var(--accent-red); }
.action-btn-small.red:hover { background: rgba(255, 77, 77, 0.3); }
</style>