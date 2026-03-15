<script setup>
import { ref, onMounted } from "vue"
import StockControl from '~/components/molecules/StockControl.vue'
import PaginationControls from '~/components/molecules/PaginationControls.vue'
import ProductModal from '~/components/organisms/ProductModal.vue'

const showModal = ref(false)
const showFilters = ref(false) 
const isLoading = ref(true)
const productToEdit = ref(null)

const products = ref([])
const categories = ref([])
const locations = ref([])

// NOUVEAU : État de la recherche
const searchQuery = ref("")

const activeFilters = ref({
  categoryId: "",
  locationId: "",
  unit: "",
  autoRefill: "", 
  status: "",
  sort: "expirationDate_ASC" 
})

const pagination = ref({ currentPage: 1, totalPages: 1, lastPage: true })

const loadConfig = async () => {
  const cats = await window.api.config.getAllCategories()
  const locs = await window.api.config.getAllLocations()
  if (cats?.success) categories.value = cats.data
  if (locs?.success) locations.value = locs.data
}

const fetchProducts = async (targetPage = 1) => {
  isLoading.value = true
  try {
    let allFetchedItems = []
    let p = 1
    let isLast = false
    
    while (!isLast) {
      const filters = { page: p }
      if (activeFilters.value.categoryId !== "") filters.categoryId = Number(activeFilters.value.categoryId)
      if (activeFilters.value.locationId !== "") filters.locationId = Number(activeFilters.value.locationId)
      if (activeFilters.value.unit !== "") filters.unit = activeFilters.value.unit
      if (activeFilters.value.status !== "") filters.status = activeFilters.value.status
      if (activeFilters.value.autoRefill === 'true') filters.autoRefill = true
      if (activeFilters.value.autoRefill === 'false') filters.autoRefill = false

      const res = await window.api.products.getAll(filters)
      if (res?.success) {
        allFetchedItems.push(...res.data.items)
        isLast = res.data.lastPage
        p++
      } else {
        break
      }
    }

    if (activeFilters.value.sort === 'expirationDate_ASC') {
      allFetchedItems.sort((a, b) => {
        const dateA = (a.expirationDate && !String(a.expirationDate).startsWith('2099')) ? new Date(a.expirationDate).getTime() : Infinity
        const dateB = (b.expirationDate && !String(b.expirationDate).startsWith('2099')) ? new Date(b.expirationDate).getTime() : Infinity
        return dateA - dateB
      })
    } else if (activeFilters.value.sort === 'createdAt_DESC') {
      allFetchedItems.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } else if (activeFilters.value.sort === 'category_ASC') {
      allFetchedItems.sort((a, b) => {
        const catA = a.category?.name?.toLowerCase() || "zzzz"
        const catB = b.category?.name?.toLowerCase() || "zzzz"
        return catA.localeCompare(catB)
      })
    } else if (activeFilters.value.sort === 'location_ASC') {
      allFetchedItems.sort((a, b) => {
        const locA = a.location?.name?.toLowerCase() || "zzzz"
        const locB = b.location?.name?.toLowerCase() || "zzzz"
        return locA.localeCompare(locB)
      })
    } else if (activeFilters.value.sort === 'quantity_ASC') {
      allFetchedItems.sort((a, b) => a.quantity - b.quantity)
    } else if (activeFilters.value.sort === 'quantity_DESC') {
      allFetchedItems.sort((a, b) => b.quantity - a.quantity)
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
    products.value = allFetchedItems.slice(startIndex, startIndex + limit)
    
    pagination.value = {
      currentPage: safePage,
      totalPages: totalPages,
      lastPage: safePage >= totalPages
    }

  } catch (error) {
    console.error("Erreur chargement SQLite :", error)
  } finally {
    isLoading.value = false
  }
}

const applyFilters = () => fetchProducts(1)
const resetFilters = () => {
  searchQuery.value = "" // Réinitialise aussi la recherche
  activeFilters.value = { categoryId: "", locationId: "", unit: "", autoRefill: "", status: "", sort: "expirationDate_ASC" }
  fetchProducts(1)
}

const setLocationFilter = (locId) => {
  activeFilters.value.locationId = locId
  fetchProducts(1)
}

onMounted(async () => {
  await loadConfig()
  await fetchProducts(1)
})

const openCreateModal = () => {
  productToEdit.value = null
  showModal.value = true
}

const openEditModal = (product) => {
  productToEdit.value = product
  showModal.value = true
}

const handleSaveProduct = async (productData) => {
  try {
    const dataToSave = {
      id: productData.id, 
      name: String(productData.name).trim(),
      categoryId: Number(productData.categoryId),
      locationId: Number(productData.locationId),
      quantity: Number(productData.quantity),
      unit: productData.unit,
      minQuantity: Number(productData.minQuantity) || 0,
      autoRefill: Boolean(productData.autoRefill),
      expirationDate: productData.expirationDate || '2099-12-31'
    }
    
    let res;
    if (dataToSave.id) {
      res = await window.api.products.update(dataToSave)
    } else {
      res = await window.api.products.create(dataToSave)
    }

    if (res?.success) {
      showModal.value = false
      await fetchProducts(pagination.value.currentPage)
    } else {
      alert(`Erreur backend : ${res?.message || 'Inconnue'}`)
    }
  } catch (error) {
    console.error("Erreur critique d'enregistrement :", error)
    alert(`Erreur d'exécution : Impossible de communiquer avec la base de données.`)
  }
}

const handleUpdateQty = async (id, step) => {
  try {
    const res = await window.api.products.updateQty({ id, change: step })
    if (res?.success) {
      await fetchProducts(pagination.value.currentPage)
    } else {
      alert(`Impossible de modifier la quantité : ${res?.message || 'Erreur inconnue'}`)
    }
  } catch (error) {
    alert("Erreur de communication.")
    console.error(error)
  }
}

const handleDelete = async (id) => {
  if (!confirm("Supprimer ce produit (sera marqué comme jeté) ?")) return
  const res = await window.api.products.delete({ id, wasThrownAway: true })
  if (res?.success) await fetchProducts(pagination.value.currentPage)
}

const getExpirationStatus = (date) => {
  if (!date || String(date).startsWith('2099')) return "safe"
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "perime"
  if (diff <= 3) return "urgent"
  return "safe"
}

const getExpirationText = (date) => {
  if (!date || String(date).startsWith('2099')) return "Non périssable"
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "Périmé"
  if (diff === 0) return "Aujourd'hui"
  if (diff <= 7) return `Dans ${diff} jours`
  return new Date(date).toLocaleDateString("fr-FR")
}
</script>

<template>
  <main class="main-content">
    <header class="topbar">
      <div class="header-titles">
        <h1>Inventaire</h1>
        <p v-if="isLoading">Chargement...</p>
        <p v-else>Stock actif de la maison</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">+ Nouveau Produit</button>
    </header>

    <div class="top-controls">
      <div class="categories-slider">
        <button class="filter-btn" :class="{ active: activeFilters.locationId === '' }" @click="setLocationFilter('')" style="white-space: nowrap;">Tous</button>
        <button v-for="loc in locations" :key="loc.id" class="filter-btn" :class="{ active: activeFilters.locationId === loc.id }" @click="setLocationFilter(loc.id)" style="white-space: nowrap;">{{ loc.name }}</button>
      </div>
      
      <div class="action-controls">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" @input="applyFilters" class="search-input" placeholder="Rechercher un produit..." />
        </div>

        <div class="sort-wrapper">
          <select v-model="activeFilters.sort" @change="applyFilters" class="sort-select">
            <option value="expirationDate_ASC">Expiration (Proche d'abord)</option>
            <option value="createdAt_DESC">Récemment ajoutés</option>
            <option value="category_ASC">Catégorie (A-Z)</option>
            <option value="quantity_ASC">Quantité (Croissant)</option>
            <option value="quantity_DESC">Quantité (Décroissant)</option>
            <option value="location_ASC">Localisation (A-Z)</option>
          </select>
        </div>

        <button class="btn-icon" :class="{ active: showFilters }" @click="showFilters = !showFilters">
          <span>⚙️</span> Filtres
        </button>
      </div>
    </div>

    <Transition name="slide-fade">
      <div v-if="showFilters" class="advanced-filters-panel">
        <div class="filters-grid">
          <div class="form-group">
            <label>CATÉGORIE</label>
            <select v-model="activeFilters.categoryId" @change="applyFilters">
              <option value="">Toutes les catégories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>EMPLACEMENT</label>
            <select v-model="activeFilters.locationId" @change="applyFilters">
              <option value="">Tous les emplacements</option>
              <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>UNITÉ</label>
            <select v-model="activeFilters.unit" @change="applyFilters">
              <option value="">Toutes les unités</option>
              <option value="L">Litre (L)</option>
              <option value="kg">Kilogramme (kg)</option>
              <option value="ml">Millilitre (ml)</option>
              <option value="mg">Milligramme (mg)</option>
              <option value="unite">Unité (u)</option>
            </select>
          </div>
          <div class="form-group">
            <label>STATUT (PÉREMPTION)</label>
            <select v-model="activeFilters.status" @change="applyFilters">
              <option value="">Tous les statuts</option>
              <option value="safe">Sûr (> 3 jours)</option>
              <option value="urgent">Urgent (≤ 3 jours)</option>
              <option value="expired">Périmé</option>
            </select>
          </div>
          <div class="form-group">
            <label>AUTO-REFILL</label>
            <select v-model="activeFilters.autoRefill" @change="applyFilters">
              <option value="">Peu importe</option>
              <option value="true">Activé (Oui)</option>
              <option value="false">Désactivé (Non)</option>
            </select>
          </div>
        </div>
        <div class="filters-actions">
          <button class="reset-btn" @click="resetFilters">Effacer les filtres</button>
        </div>
      </div>
    </Transition>

    <div class="inventory-card">
      <div class="inventory-table">
        <div class="table-header">
          <span>DESCRIPTION</span><span>CATÉGORIE</span><span>GESTION STOCK</span><span>LOCALISATION</span><span>DATE EXPIRATION</span><span>ACTIONS</span>
        </div>

        <div v-for="p in products" :key="p.id" class="inventory-row">
          <div class="col-desc item-detail">
            <div class="item-icon">📦</div> 
            <div class="item-text">
              <span class="item-name">{{ p.name }}</span>
              <span class="item-ref">REF-{{ p.id }}</span>
            </div>
          </div>
          <div class="col-cat">
            <span class="pill category" :style="{ backgroundColor: p.category?.color || 'var(--primary-purple)' }">{{ p.category?.name || "N/A" }}</span>
          </div>
          
          <div class="col-stock">
            <StockControl 
              :quantity="p.quantity" 
              :unit="p.unit"
              @change-qty="(step) => handleUpdateQty(p.id, step)" 
            />
          </div>

          <div class="col-loc"><span class="pill location">{{ p.location?.name || "N/A" }}</span></div>
          <div class="col-exp">
            <div class="exp-box" :class="getExpirationStatus(p.expirationDate)">
              <span class="status-dot"></span><span class="exp-label">{{ getExpirationText(p.expirationDate) }}</span>
            </div>
          </div>
          <div class="col-actions" style="display: flex; gap: 5px;">
            <button class="action-btn" @click="openEditModal(p)">✏️</button>
            <button class="action-btn delete" @click="handleDelete(p.id)">🗑️</button>
          </div>
        </div>

        <div v-if="!isLoading && products.length === 0" class="inventory-row">
          <div class="col-desc item-detail">
            <span class="item-name" v-if="searchQuery">Aucun résultat pour "{{ searchQuery }}".</span>
            <span class="item-name" v-else>Aucun produit ne correspond à ces filtres.</span>
          </div>
        </div>
      </div>
    </div>

    <PaginationControls v-if="pagination.totalPages > 1" :current-page="pagination.currentPage" :last-page="pagination.lastPage" @prev="fetchProducts(pagination.currentPage - 1)" @next="fetchProducts(pagination.currentPage + 1)" />
  </main>

  <ProductModal 
    :show="showModal" 
    :categories="categories" 
    :locations="locations" 
    :productToEdit="productToEdit" 
    @close="showModal = false" 
    @save="handleSaveProduct" 
    @location-added="loadConfig"
  />
</template>

<style scoped>
.top-controls {
  display: flex;
  flex-wrap: wrap; 
  align-items: center;
  justify-content: space-between; 
  gap: 20px;
  margin-bottom: 1.5rem;
  width: 100%;
}

.categories-slider {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  flex-grow: 1;
  padding-bottom: 5px;
  max-width: 100%;
}
.categories-slider::-webkit-scrollbar { height: 6px; }
.categories-slider::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
.categories-slider::-webkit-scrollbar-track { background: transparent; }

.action-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  flex-wrap: wrap; /* Permet à la recherche de s'adapter sur petit écran */
}

/* NOUVEAU CSS : Recherche */
.search-wrapper {
  position: relative;
  min-width: 220px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.search-input {
  width: 100%;
  background: var(--bg-dark);
  border: 1px solid var(--card-border);
  color: white;
  padding: 10px 16px 10px 40px; 
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: var(--primary-purple);
}

.sort-select {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  appearance: none;
  min-width: 200px;
  outline: none;
  transition: 0.2s;
}
.sort-select:focus { border-color: var(--primary-purple); }

.btn-icon {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  white-space: nowrap;
}
.btn-icon:hover, .btn-icon.active {
  background: rgba(108, 93, 255, 0.1);
  border-color: var(--primary-purple);
}

.advanced-filters-panel { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
.filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.filters-actions { display: flex; justify-content: flex-end; border-top: 1px solid var(--card-border); padding-top: 1rem; }
.reset-btn { background: transparent; color: var(--accent-red); border: 1px solid rgba(255, 77, 77, 0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.reset-btn:hover { background: rgba(255, 77, 77, 0.1); }
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }
</style>