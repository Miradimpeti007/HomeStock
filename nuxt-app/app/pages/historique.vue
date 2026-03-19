<script setup>
import { ref, onMounted } from "vue"
import PaginationControls from '~/components/molecules/PaginationControls.vue'

const isLoading = ref(true)
const showClearConfirm = ref(false)
const historyItems = ref([])
const categories = ref([])
const locations = ref([])

// NOUVEAU : État de la recherche
const searchQuery = ref("")

const pagination = ref({ currentPage: 1, totalPages: 1, lastPage: true })

const formatDateForInput = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = new Date()
const lastMonth = new Date()
lastMonth.setDate(today.getDate() - 30)

const activeFilters = ref({
  categoryId: "Tous",
  locationId: "Tous",
  reason: "Tous",
  startDate: formatDateForInput(lastMonth),
  endDate: formatDateForInput(today),
  sort: "consumedDate_DESC" 
})

const loadConfig = async () => {
  const cats = await window.api.config.getAllCategories()
  const locs = await window.api.config.getAllLocations()
  if (cats?.success) categories.value = cats.data
  if (locs?.success) locations.value = locs.data
}

const fetchHistory = async (targetPage = 1) => {
  isLoading.value = true
  try {
    let allFetchedItems = []
    let p = 1
    let isLast = false
    
    while (!isLast) {
      const filters = { page: p }

      if (activeFilters.value.categoryId !== "Tous") filters.categoryId = Number(activeFilters.value.categoryId)
      if (activeFilters.value.locationId !== "Tous") filters.locationId = Number(activeFilters.value.locationId)
      if (activeFilters.value.reason === "true") filters.wasThrownAway = true
      if (activeFilters.value.reason === "false") filters.wasThrownAway = false

      if (activeFilters.value.startDate && activeFilters.value.endDate) {
        filters.startDate = activeFilters.value.startDate
        filters.endDate = activeFilters.value.endDate
        filters.consumedDate = {
          start: `${activeFilters.value.startDate} 00:00:00`,
          end: `${activeFilters.value.endDate} 23:59:59`
        }
      }

      const res = await window.api.history.getAll(filters)
      
      if (res?.success) {
        allFetchedItems.push(...res.data.items)
        isLast = res.data.lastPage
        p++
      } else {
        break
      }
    }

    const sortVal = activeFilters.value.sort
    if (sortVal === 'consumedDate_DESC') {
      allFetchedItems.sort((a, b) => new Date(b.consumedDate).getTime() - new Date(a.consumedDate).getTime())
    } else if (sortVal === 'consumedDate_ASC') {
      allFetchedItems.sort((a, b) => new Date(a.consumedDate).getTime() - new Date(b.consumedDate).getTime())
    } else if (sortVal === 'category_ASC') {
      allFetchedItems.sort((a, b) => {
        const catA = a.category?.name?.toLowerCase() || "zzzz"
        const catB = b.category?.name?.toLowerCase() || "zzzz"
        return catA.localeCompare(catB)
      })
    } else if (sortVal === 'location_ASC') {
      allFetchedItems.sort((a, b) => {
        const locA = a.location?.name?.toLowerCase() || "zzzz"
        const locB = b.location?.name?.toLowerCase() || "zzzz"
        return locA.localeCompare(locB)
      })
    } else if (sortVal === 'quantity_DESC') {
      allFetchedItems.sort((a, b) => (b.quantity || 1) - (a.quantity || 1))
    } else if (sortVal === 'quantity_ASC') {
      allFetchedItems.sort((a, b) => (a.quantity || 1) - (b.quantity || 1))
    } else if (sortVal === 'reason_ASC') { 
      allFetchedItems.sort((a, b) => Number(b.wasThrownAway) - Number(a.wasThrownAway))
    } else if (sortVal === 'reason_DESC') { 
      allFetchedItems.sort((a, b) => Number(a.wasThrownAway) - Number(b.wasThrownAway))
    }

    // NOUVEAU : Application de la recherche par nom
    if (searchQuery.value.trim() !== "") {
      const q = searchQuery.value.toLowerCase()
      allFetchedItems = allFetchedItems.filter(item => item.name && item.name.toLowerCase().includes(q))
    }

    const limit = 20
    const totalItems = allFetchedItems.length
    const totalPages = Math.ceil(totalItems / limit) || 1
    const safePage = Math.min(Math.max(1, targetPage), totalPages)
    
    const startIndex = (safePage - 1) * limit
    historyItems.value = allFetchedItems.slice(startIndex, startIndex + limit)
    
    pagination.value = {
      currentPage: safePage,
      totalPages: totalPages,
      lastPage: safePage >= totalPages
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

const applyFilters = () => fetchHistory(1)

const handleDeleteItem = async (id) => {
  if (!confirm("Supprimer définitivement cette ligne de l'historique ?")) return
  const res = await window.api.history.deleteItem({ id })
  if (res?.success) await fetchHistory(pagination.value.currentPage)
}

const executeClearHistory = async () => {
  const res = await window.api.history.clear()
  if (res?.success) {
    showClearConfirm.value = false 
    await fetchHistory(1) 
  } else {
    alert("Erreur lors de la suppression.")
  }
}

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
      <button class="btn-primary danger" @click="showClearConfirm = true">
        🗑️ Vider l'historique
      </button>
    </header>

    <div class="history-filters-container">
      
      <div class="filter-group">
        <label>RECHERCHE</label>
        <div class="select-wrapper">
          <span class="filter-icon">🔍</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="applyFilters" 
            class="search-input" 
            placeholder="Nom du produit..." 
          />
        </div>
      </div>

      <div class="filter-group">
        <label>TRIER PAR</label>
        <div class="select-wrapper">
          <span class="filter-icon">⚲</span>
          <select v-model="activeFilters.sort" @change="applyFilters">
            <option value="consumedDate_DESC">Date (Plus récent d'abord)</option>
            <option value="consumedDate_ASC">Date (Plus ancien d'abord)</option>
            <option value="category_ASC">Catégorie (A-Z)</option>
            <option value="quantity_DESC">Quantité (Décroissant)</option>
            <option value="quantity_ASC">Quantité (Croissant)</option>
            <option value="location_ASC">Localisation (A-Z)</option>
            <option value="reason_ASC">Raison (Périmé d'abord)</option>
            <option value="reason_DESC">Raison (Consommé d'abord)</option>
          </select>
        </div>
      </div>

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

      <div class="filter-group date-filter-group">
        <label>PÉRIODE</label>
        <div class="date-range-wrapper">
          <input 
            type="date" 
            v-model="activeFilters.startDate" 
            @change="applyFilters" 
            class="date-input" 
            title="Date de début"
          />
          <span class="date-separator">→</span>
          <input 
            type="date" 
            v-model="activeFilters.endDate" 
            @change="applyFilters" 
            class="date-input" 
            title="Date de fin"
          />
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
            {{ item.quantity || 1 }} <span class="text-muted" style="font-size: 0.8rem;">{{ item.unit }}</span>
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
          <div class="col-desc item-detail">
            <span class="item-name" v-if="searchQuery">Aucun résultat pour "{{ searchQuery }}".</span>
            <span class="item-name" v-else>L'historique est vide sur cette période.</span>
          </div>
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

    <Transition name="fade">
      <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
        <div class="modal-container alert-modal">
          <button class="close-modal-btn" @click="showClearConfirm = false">
            <span class="close-icon-shape"></span>
          </button>
          
          <div class="alert-icon-wrapper">
            <span style="font-size: 3rem;">⚠️</span>
          </div>
          
          <h2 style="text-align: center; color: white; margin-bottom: 10px;">Vider l'historique</h2>
          <p style="text-align: center; color: var(--text-muted); margin-bottom: 25px; line-height: 1.5;">
            Êtes-vous sûr de vouloir supprimer <strong>définitivement</strong> tout l'historique de consommation ? 
            <br><span style="color: var(--accent-red);">Cette action est irréversible.</span>
          </p>
          
          <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="btn-secondary" @click="showClearConfirm = false" style="padding: 10px 20px; border-radius: 10px; border: 1px solid var(--card-border); background: transparent; color: white; cursor: pointer;">
              Annuler
            </button>
            <button class="btn-primary danger" @click="executeClearHistory" style="padding: 10px 20px; border-radius: 10px;">
              Oui, tout supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </main>
</template>

<style scoped>
.btn-primary.danger { background: var(--accent-red); box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3); }
.btn-primary.danger:hover { background: #ff3333; }

.history-filters-container {
  display: flex;
  flex-wrap: wrap; 
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--card-border);
}

.filter-group { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 8px; }
.date-filter-group { flex: 1.2; min-width: 260px; }

.filter-group label {
  font-size: 0.75rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase;
}

/* NOUVEAU CSS : Input de recherche adapté pour les filtres */
.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: var(--bg-dark);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.search-input:focus { border-color: var(--primary-purple); }

.date-range-wrapper {
  display: flex; align-items: center; justify-content: space-between; background: var(--bg-dark); border: 1px solid var(--card-border); border-radius: 12px; padding: 10px 12px; width: 100%; box-sizing: border-box; 
}

.date-input { background: transparent; border: none; color: white; font-family: inherit; font-size: 0.85rem; outline: none; cursor: pointer; width: 46%; color-scheme: dark; }
.date-input::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
.date-input::-webkit-calendar-picker-indicator:hover { opacity: 1; }
.date-separator { color: var(--text-muted); font-size: 0.9rem; }

.select-wrapper { position: relative; display: flex; align-items: center; }
.filter-icon { position: absolute; left: 14px; color: var(--text-muted); pointer-events: none; }

.select-wrapper select { width: 100%; padding: 12px 16px 12px 40px; background: var(--bg-dark); border: 1px solid var(--card-border); border-radius: 12px; color: white; font-size: 0.9rem; appearance: none; cursor: pointer; }
.select-wrapper select:focus { border-color: var(--primary-purple); outline: none; }

.history-grid { grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1.5fr 1.5fr 0.8fr !important; }
.font-bold { font-weight: 700; }
.text-white { color: white; }
.text-muted { color: var(--text-muted); }

.danger-pill { background: rgba(255, 77, 77, 0.1); color: var(--accent-red); border: 1px solid rgba(255, 77, 77, 0.2); }
.success-pill { background: rgba(0, 255, 163, 0.1); color: #00ffa3; border: 1px solid rgba(0, 255, 163, 0.2); }

.alert-modal { max-width: 450px; padding: 2rem; }
.alert-icon-wrapper { display: flex; justify-content: center; margin-bottom: 1rem; }
</style>