<script setup>
import { ref, onMounted } from "vue"
import PaginationControls from '~/components/molecules/PaginationControls.vue'

// États UI
const isLoading = ref(true)
const historyItems = ref([])
const categories = ref([])
const locations = ref([])

// Pagination
const pagination = ref({ currentPage: 1, totalPages: 1, lastPage: true })

// Filtres
const activeFilters = ref({
  categoryId: "Tous",
  locationId: "Tous",
  reason: "Tous"
})

const loadConfig = async () => {
  const cats = await window.api.config.getAllCategories()
  const locs = await window.api.config.getAllLocations()
  if (cats?.success) categories.value = cats.data
  if (locs?.success) locations.value = locs.data
}

const fetchHistory = async (page = 1) => {
  isLoading.value = true
  try {
    const filters = { page }

    if (activeFilters.value.categoryId !== "Tous") filters.categoryId = Number(activeFilters.value.categoryId)
    if (activeFilters.value.locationId !== "Tous") filters.locationId = Number(activeFilters.value.locationId)
    
    // Conversion stricte pour correspondre à historyFilterMapping du backend
    if (activeFilters.value.reason === "true") filters.wasThrownAway = true
    if (activeFilters.value.reason === "false") filters.wasThrownAway = false

    const res = await window.api.history.getAll(filters)
    
    if (res?.success) {
      historyItems.value = res.data.items
      pagination.value = {
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        lastPage: res.data.lastPage
      }
    }
  } catch (error) {
    console.error("Erreur chargement historique :", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadConfig()
  await fetchHistory(1)
})

/* --- ACTIONS --- */

const applyFilters = () => fetchHistory(1)

const handleDeleteItem = async (id) => {
  if (!confirm("Supprimer définitivement cette ligne de l'historique ?")) return
  // Utilisation de deleteItem en accord avec ton preload.js
  const res = await window.api.history.deleteItem({ id })
  if (res?.success) await fetchHistory(pagination.value.currentPage)
}

const handleClearHistory = async () => {
  if (!confirm("⚠️ ATTENTION : Voulez-vous vraiment vider tout l'historique ? Cette action est irréversible.")) return
  const res = await window.api.history.clear()
  if (res?.success) await fetchHistory(1)
}

/* --- HELPERS UI --- */
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}
</script>

<template>
  <main class="main-content">
    <header class="topbar">
      <div class="header-titles">
        <h1>Historique</h1>
        <p v-if="isLoading">Chargement des archives...</p>
        <p v-else>Suivez les produits supprimés et périmés</p>
      </div>
      <button class="btn-primary danger" @click="handleClearHistory">
        🗑️ Vider l'historique
      </button>
    </header>

    <div class="history-filters-container">
      <div class="filter-group">
        <label>CATÉGORIE</label>
        <div class="select-wrapper">
          <span class="filter-icon">⚲</span>
          <select v-model="activeFilters.categoryId" @change="applyFilters">
            <option value="Tous">Tous</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <div class="filter-group">
        <label>RAISON</label>
        <div class="select-wrapper">
          <span class="filter-icon">⚲</span>
          <select v-model="activeFilters.reason" @change="applyFilters">
            <option value="Tous">Tous</option>
            <option value="true">Gaspillage / Périmé</option>
            <option value="false">Consommé normalement</option>
          </select>
        </div>
      </div>

      <div class="filter-group">
        <label>LOCALISATION</label>
        <div class="select-wrapper">
          <span class="filter-icon">⚲</span>
          <select v-model="activeFilters.locationId" @change="applyFilters">
            <option value="Tous">Tous</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="inventory-card">
      <div class="inventory-table">
        <div class="table-header history-grid">
          <span>PRODUIT</span>
          <span>CATÉGORIE</span>
          <span>QUANTITÉ</span>
          <span>LOCALISATION</span>
          <span>DATE SUPPRESSION</span>
          <span>RAISON</span>
          <span>ACTIONS</span>
        </div>

        <div v-for="item in historyItems" :key="item.id" class="inventory-row history-grid">
          <div class="col-desc item-detail">
            <div class="item-icon">📦</div> 
            <div class="item-text">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-ref">ID: #{{ item.id }}</span>
            </div>
          </div>

          <div class="col-cat">
            <span class="pill category" :style="{ backgroundColor: item.category?.color || 'var(--primary-purple)' }">
              {{ item.category?.name || "N/A" }}
            </span>
          </div>

          <div class="col-qty font-bold text-white">
            1 <span class="text-muted" style="font-size: 0.8rem;">{{ item.unit }}</span>
          </div>

          <div class="col-loc">
            <span class="pill location">{{ item.location?.name || "N/A" }}</span>
          </div>

          <div class="col-date text-muted font-bold">
            {{ formatDate(item.consumedDate) }}
          </div>

          <div class="col-reason">
            <span v-if="item.wasThrownAway" class="pill danger-pill">PÉRIMÉ / JETÉ</span>
            <span v-else class="pill success-pill">CONSOMMÉ</span>
          </div>

          <div class="col-actions">
            <button class="action-btn delete" @click="handleDeleteItem(item.id)">🗑️</button>
          </div>
        </div>

        <div v-if="!isLoading && historyItems.length === 0" class="inventory-row">
          <div class="col-desc item-detail"><span class="item-name">L'historique est vide.</span></div>
        </div>
      </div>
    </div>

    <PaginationControls 
      v-if="pagination.totalPages > 1"
      :current-page="pagination.currentPage" 
      :last-page="pagination.lastPage"
      @prev="fetchHistory(pagination.currentPage - 1)"
      @next="fetchHistory(pagination.currentPage + 1)"
    />
  </main>
</template>

<style scoped>
.btn-primary.danger {
  background: var(--accent-red);
  box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
}

.btn-primary.danger:hover {
  background: #ff3333;
}

.history-filters-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--card-border);
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.select-wrapper select {
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: var(--bg-dark);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  appearance: none;
  cursor: pointer;
}

.select-wrapper select:focus {
  border-color: var(--primary-purple);
  outline: none;
}

.history-grid {
  grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1.5fr 1.5fr 0.8fr !important;
}

.font-bold { font-weight: 700; }
.text-white { color: white; }
.text-muted { color: var(--text-muted); }

.danger-pill {
  background: rgba(255, 77, 77, 0.1);
  color: var(--accent-red);
  border: 1px solid rgba(255, 77, 77, 0.2);
}

.success-pill {
  background: rgba(0, 255, 163, 0.1);
  color: #00ffa3;
  border: 1px solid rgba(0, 255, 163, 0.2);
}
</style>