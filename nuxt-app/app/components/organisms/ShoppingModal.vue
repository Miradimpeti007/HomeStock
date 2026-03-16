<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ 
  show: Boolean,
  categories: Array 
})

// On ajoute 'category-added' pour signaler au parent de recharger la liste
const emit = defineEmits(['close', 'save', 'category-added'])

const form = ref({ name: "", categoryId: "", quantity: 1, unit: "unite" })

// États pour la création de catégorie à la volée
const isAddingCategory = ref(false)
const newCategoryName = ref("")

// Reset du formulaire à l'ouverture
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = { name: "", categoryId: "", quantity: 1, unit: "unite" }
    isAddingCategory.value = false
    newCategoryName.value = ""
  }
})

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

const handleCreateCategory = async () => {
  if (newCategoryName.value.trim() === "") return
  
  // Palette de couleurs pastel pour le backend
  const niceColors = ['#ff7675', '#74b9ff', '#55efc4', '#00b894', '#fdcb6e', '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe', '#e17055']
  const randomColor = niceColors[Math.floor(Math.random() * niceColors.length)]

  // Appel via le preload exposé
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

const submitForm = () => {
  if (isAddingCategory.value) {
    alert("Veuillez valider ou annuler la création de la catégorie d'abord.")
    return
  }
  emit('save', { ...form.value })
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
            <label>CATÉGORIE</label>
            
            <div v-if="!isAddingCategory" style="display: flex; gap: 8px; align-items: center;">
              <select v-model="form.categoryId" style="flex: 1;">
                <option value="">-- Catégorie par défaut --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <button type="button" @click="isAddingCategory = true" class="action-btn-small purple">+</button>
            </div>
            
            <div v-else style="display: flex; gap: 6px; align-items: center;">
              <input v-model="newCategoryName" type="text" placeholder="Nouvelle catégorie..." style="flex: 1;" @keydown.enter.prevent="handleCreateCategory">
              <button type="button" @click="handleCreateCategory" class="action-btn-small green">✓</button>
              <button type="button" @click="isAddingCategory = false" class="action-btn-small red">✗</button>
            </div>
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
.action-btn-small {
  border: none; border-radius: 8px; width: 42px; height: 42px; font-size: 1.2rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; transition: 0.2s;
}
.action-btn-small.purple { background: var(--primary-purple); }
.action-btn-small.green { background: rgba(0, 255, 163, 0.2); color: #00ffa3; }
.action-btn-small.red { background: rgba(255, 77, 77, 0.2); color: var(--accent-red); }

.qty-controller { display: flex; align-items: center; background: var(--bg-dark); border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden; }
.qty-btn { background: transparent; color: white; border: none; padding: 10px 15px; font-size: 1.2rem; cursor: pointer; transition: background 0.2s; }
.qty-btn:hover { background: rgba(255, 255, 255, 0.1); }
.qty-input { flex: 1; text-align: center; border: none !important; background: transparent !important; padding: 10px 0 !important; }
</style>