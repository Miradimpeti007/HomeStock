<script setup>
import { ref, computed, onMounted } from "vue"
// Importation du store centralisé
import { inventoryProducts, ruptureProducts } from "~/composables/useStore"
import "~/assets/css/style.css"

// --- ÉTATS ---
const showModal = ref(false)
const isLoading = ref(true)
const currentFilter = ref("Tous")
const locations = ["Tous", "Frigo", "Congélateur", "Cellier", "Entretien"]

const categories = [
  { id: 1, name: "PRODUITS LAITIERS" },
  { id: 2, name: "VIANDE" },
  { id: 3, name: "ÉPICERIE" },
  { id: 4, name: "LÉGUMES" },
  { id: 5, name: "BOISSONS" }
]

const form = ref({
  name: '',
  categoryId: '',
  quantity: 0,
  unit: 'L',
  expirationDate: '',
  location: 'Frigo'
})

// --- SYNCHRONISATION SQLITE ---

// Charger les produits au démarrage
const syncWithSQLite = async () => {
  isLoading.value = true
  try {
    if (window.api && window.api.products) {
      const data = await window.api.products.getAll()
      inventoryProducts.value = data
    }
  } catch (error) {
    console.error("Erreur de chargement SQLite :", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  syncWithSQLite()
})

// --- LOGIQUE CRUD (Utilisant les méthodes de ton collègue) ---

const handleSave = async () => {
  const productData = {
    ...form.value,
    category: categories.find(c => c.id === form.value.categoryId)?.name || "Générique"
  }

  try {
    if (window.api && window.api.products.create) {
      await window.api.products.create(productData)
      await syncWithSQLite() // Rafraîchir la liste
      showModal.value = false
      // Reset du formulaire
      form.value = { name: '', categoryId: '', quantity: 0, unit: 'L', expirationDate: '', location: 'Frigo' }
    }
  } catch (error) {
    console.error("Erreur de création :", error)
  }
}

const handleUpdateQty = async (id, step) => {
  try {
    if (window.api && window.api.products.updateQty) {
      // Ton collègue attend un objet { id, change }
      await window.api.products.updateQty({ id, change: step })
      await syncWithSQLite()
    }
  } catch (error) {
    console.error("Erreur de mise à jour stock :", error)
  }
}

const handleDelete = async (id) => {
  if (confirm("Supprimer définitivement ce produit ?")) {
    try {
      if (window.api && window.api.products.delete) {
        // Ton collègue attend un objet { id }
        await window.api.products.delete({ id })
        await syncWithSQLite()
      }
    } catch (error) {
      console.error("Erreur de suppression :", error)
    }
  }
}

// --- LOGIQUE AFFICHAGE ---

const filteredProducts = computed(() => {
  if (currentFilter.value === "Tous") return inventoryProducts.value
  return inventoryProducts.value.filter(p => p.location === currentFilter.value)
})

const getExpirationStatus = (date) => {
  if (!date) return "none"
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "perime"
  if (diff <= 3) return "urgent"
  return "safe"
}

const getExpirationText = (date) => {
  if (!date) return "N/A"
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "Périmé"
  if (diff === 0) return "Aujourd'hui"
  if (diff <= 7) return `Dans ${diff} jours`
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
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
        <NuxtLink to="/inventaire" class="nav-item active">
          <span class="nav-icon">📋</span><span>Inventaire</span>
        </NuxtLink>
        <NuxtLink to="/courses" class="nav-item">
          <span class="nav-icon">🛒</span>
          <span>Liste de courses</span>
          <span v-if="ruptureProducts.length > 0" class="badge-count">
            {{ ruptureProducts.length }}
          </span>
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
          <h1>Inventaire</h1>
          <p v-if="isLoading">Chargement de la base SQLite...</p>
          <p v-else>Stock actif de la maison</p>
        </div>
        <button class="btn-primary" @click="showModal = true">+ Nouveau Produit</button>
      </header>

      <div class="filter-bar">
        <button v-for="loc in locations" :key="loc" 
                class="filter-btn" :class="{ active: currentFilter === loc }"
                @click="currentFilter = loc">
          {{ loc }}
        </button>
      </div>

      <div class="inventory-card">
        <div class="inventory-table">
          <div class="table-header">
            <span>DESCRIPTION</span>
            <span>CATÉGORIE</span>
            <span>GESTION STOCK</span>
            <span>LOCALISATION</span>
            <span>DATE EXPIRATION</span>
            <span>ACTIONS</span>
          </div>

          <div v-for="p in filteredProducts" :key="p.id" class="inventory-row">
            <div class="col-desc item-detail">
              <div class="item-icon">📦</div>
              <div class="item-text">
                <span class="item-name">{{ p.name }}</span>
                <span class="item-ref">REF-{{ p.id }}</span>
              </div>
            </div>
            <div class="col-cat"><span class="pill category">{{ p.category }}</span></div>
            <div class="col-stock">
              <div class="stock-control">
                <button class="stock-btn" @click="handleUpdateQty(p.id, -1)">-</button>
                <span class="stock-display">{{ p.quantity }} <small>{{ p.unit }}</small></span>
                <button class="stock-btn" @click="handleUpdateQty(p.id, 1)">+</button>
              </div>
            </div>
            <div class="col-loc"><span class="pill location">{{ p.location }}</span></div>
            <div class="col-exp">
              <div class="exp-box" :class="getExpirationStatus(p.expirationDate)">
                <span class="status-dot"></span>
                <span class="exp-label">{{ getExpirationText(p.expirationDate) }}</span>
              </div>
            </div>
            <div class="col-actions">
              <button class="action-btn">📝</button>
              <button class="action-btn delete" @click="handleDelete(p.id)">🗑️</button>
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
            <div class="header-text">
              <h2>Nouveau Produit</h2>
              <p>Ajoutez un article à votre inventaire intelligent.</p>
            </div>
          </header>

          <form @submit.prevent="handleSave" class="modal-form">
            <div class="form-group">
              <label>NOM DU PRODUIT</label>
              <input v-model="form.name" type="text" placeholder="ex: Jus de pomme" required>
            </div>
            <div class="form-group">
              <label>CATÉGORIE</label>
              <select v-model="form.categoryId" required>
                <option value="" disabled>Sélectionner une catégorie</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>QUANTITÉ</label>
                <input v-model="form.quantity" type="number" step="0.1" required>
              </div>
              <div class="form-group">
                <label>UNITÉ</label>
                <select v-model="form.unit">
                  <option value="L">Litre (L)</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="unite">Unité (u)</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>DATE D'EXPIRATION</label>
              <input v-model="form.expirationDate" type="date">
            </div>
            <div class="form-group">
              <label>LOCALISATION</label>
              <select v-model="form.location">
                <option v-for="loc in locations.slice(1)" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
            <button type="submit" class="submit-btn">Enregistrer l'article</button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>