<script setup>
import { inventoryProducts } from "~/composables/useStore"
import { ref, computed } from "vue"
import "~/assets/css/style.css"

/**
 * 1. ÉTATS & DONNÉES
 */
// Articles ajoutés manuellement
const manualShoppingItems = ref([
  { id: 101, name: "Pain", category: "Boulangerie", unit: "u", quantity: 2, isCompleted: false },
])

// Articles automatiques basés sur l'inventaire (Rupture)
const autoShoppingItems = computed(() => 
  inventoryProducts.value
    .filter(p => p.quantity <= p.minQuantity)
    .map(p => ({ ...p, isCompleted: false, isAuto: true }))
)

// Fusion de tous les articles pour le calcul global
const allItems = computed(() => [...autoShoppingItems.value, ...manualShoppingItems.value])

/**
 * 2. LOGIQUE DE GROUPEMENT (Figma Style)
 */
const groupedItems = computed(() => {
  const groups = {}
  allItems.value.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = { name: item.category, items: [], completedCount: 0 }
    }
    groups[item.category].items.push(item)
    if (item.isCompleted) groups[item.category].completedCount++
  })
  return groups
})

/**
 * 3. PROGRESSION
 */
const totalItemsCount = computed(() => allItems.value.length)
const completedItemsCount = computed(() => allItems.value.filter(i => i.isCompleted).length)
const progressPercentage = computed(() => 
  totalItemsCount.value === 0 ? 0 : Math.round((completedItemsCount.value / totalItemsCount.value) * 100)
)

/**
 * 4. ACTIONS (Suppression & Validation)
 */
const showModal = ref(false)
const form = ref({ name: "", category: "ÉPICERIE", unit: "unite", quantity: 1 })

function submitForm() {
  manualShoppingItems.value.push({ 
    id: Date.now(), 
    ...form.value, 
    isCompleted: false,
    isManual: true 
  })
  showModal.value = false
  form.value = { name: "", category: "ÉPICERIE", unit: "unite", quantity: 1 }
}

// FONCTION DE SUPPRESSION CORRIGÉE
function removeItem(item) {
  if (item.isAuto) {
    alert("Cet article est en rupture dans l'inventaire. Pour le retirer, remettez du stock dans l'onglet Inventaire.")
  } else {
    manualShoppingItems.value = manualShoppingItems.value.filter(i => i.id !== item.id)
  }
}

function toggleCheck(item) {
  item.isCompleted = !item.isCompleted
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo-container">
        <div class="logo-box">📦</div>
        <span class="logo-text">HomeStock</span>
      </div>
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item">
          <span class="nav-icon">⊞</span><span>Tableau de bord</span>
        </NuxtLink>
        <NuxtLink to="/inventaire" class="nav-item">
          <span class="nav-icon">📋</span><span>Inventaire</span>
        </NuxtLink>
        <NuxtLink to="/courses" class="nav-item active">
          <span class="nav-icon">🛒</span>
          <span>Liste de courses</span>
          <span class="badge-count" v-if="totalItemsCount > 0">{{ totalItemsCount }}</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-label">SYSTÈME</div>
      <nav class="sidebar-nav">
        <NuxtLink to="/configuration" class="nav-item">
          <span class="nav-icon">⚙</span><span>Configuration</span>
        </NuxtLink>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="header-titles">
          <h1>Liste de Courses</h1>
          <p>Gérez vos achats à effectuer</p>
        </div>
        <button class="btn-primary" @click="showModal = true">+ Nouvel Article</button>
      </header>

      <section class="progression-card">
        <div class="progression-info">
          <div class="progression-text">
            <h3>Progression</h3>
            <p>{{ completedItemsCount }} sur {{ totalItemsCount }} articles complétés</p>
          </div>
          <div class="progression-value">{{ progressPercentage }}%</div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </section>

      <div class="shopping-groups">
        <div v-for="(group, catName) in groupedItems" :key="catName" class="category-group">
          <div class="group-header">
            <div class="group-title">
              <span class="group-icon">📦</span>
              <div class="group-info">
                <h4>{{ catName }}</h4>
                <p>{{ group.completedCount }} / {{ group.items.length }} complété</p>
              </div>
            </div>
            <span class="item-count-badge">{{ group.items.length }} ARTICLE{{ group.items.length > 1 ? 'S' : '' }}</span>
          </div>

          <div class="group-items">
            <div v-for="item in group.items" :key="item.id" 
                 class="shopping-item" :class="{ 'is-completed': item.isCompleted }">
              <div class="item-left" @click="toggleCheck(item)">
                <div class="checkbox" :class="{ checked: item.isCompleted }">
                  <span v-if="item.isCompleted">✓</span>
                </div>
                <div class="item-details">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-sub">{{ item.quantity }} {{ item.unit }}</span>
                </div>
              </div>
              <button class="btn-action-mini danger" @click.stop="removeItem(item)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-container">
          <button class="close-modal-btn" @click="showModal = false">
            <span class="close-icon-shape"></span>
          </button>
          <header class="modal-header">
            <h2>Ajouter aux courses</h2>
          </header>
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-group">
              <label>NOM DE L'ARTICLE</label>
              <input v-model="form.name" type="text" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>CATÉGORIE</label>
                <select v-model="form.category">
                  <option>Boulangerie</option>
                  <option>Épicerie</option>
                  <option>Produits Laitiers</option>
                  <option>Viande</option>
                  <option>Légumes</option>
                </select>
              </div>
              <div class="form-group">
                <label>UNITÉ</label>
                <select v-model="form.unit">
                  <option>u</option>
                  <option>kg</option>
                  <option>L</option>
                </select>
              </div>
            </div>
            <button type="submit" class="submit-btn">Enregistrer</button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>