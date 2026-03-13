<script setup>
import { ref, onMounted } from "vue"
import StockControl from '~/components/molecules/StockControl.vue'
import PaginationControls from '~/components/molecules/PaginationControls.vue'
import ProductModal from '~/components/organisms/ProductModal.vue'

// États globaux
const showModal = ref(false)
const showFilters = ref(false) 
const isLoading = ref(true)
const productToEdit = ref(null)

// Données
const products = ref([])
const categories = ref([])
const locations = ref([])

// Filtres actifs respectant le contrat du backend
const activeFilters = ref({
  categoryId: "",
  locationId: "",
  unit: "",
  autoRefill: "", 
  status: ""
})

const pagination = ref({ currentPage: 1, totalPages: 1, lastPage: true })

const loadConfig = async () => {
  const cats = await window.api.config.getAllCategories()
  const locs = await window.api.config.getAllLocations()
  if (cats?.success) categories.value = cats.data
  if (locs?.success) locations.value = locs.data
}

const fetchProducts = async (page = 1) => {
  isLoading.value = true
  try {
    const filters = { page }
    
    if (activeFilters.value.categoryId !== "") filters.categoryId = Number(activeFilters.value.categoryId)
    if (activeFilters.value.locationId !== "") filters.locationId = Number(activeFilters.value.locationId)
    if (activeFilters.value.unit !== "") filters.unit = activeFilters.value.unit
    if (activeFilters.value.status !== "") filters.status = activeFilters.value.status
    
    if (activeFilters.value.autoRefill === 'true') filters.autoRefill = true
    if (activeFilters.value.autoRefill === 'false') filters.autoRefill = false

    const res = await window.api.products.getAll(filters)
    if (res?.success) {
      products.value = res.data.items
      pagination.value = {
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        lastPage: res.data.lastPage
      }
    }
  } catch (error) {
    console.error("Erreur chargement SQLite :", error)
  } finally {
    isLoading.value = false
  }
}

// Actions liées aux filtres
const applyFilters = () => {
  fetchProducts(1)
}

const resetFilters = () => {
  activeFilters.value = { categoryId: "", locationId: "", unit: "", autoRefill: "", status: "" }
  fetchProducts(1)
}

// Permet au slider horizontal de modifier l'emplacement et de recharger
const setLocationFilter = (locId) => {
  activeFilters.value.locationId = locId
  fetchProducts(1)
}

onMounted(async () => {
  await loadConfig()
  await fetchProducts(1)
})

/* --- ACTIONS CRUD --- */

const openCreateModal = () => {
  productToEdit.value = null
  showModal.value = true
}

const openEditModal = (product) => {
  productToEdit.value = product
  showModal.value = true
}

const handleSaveProduct = async (productData) => {
  const dataToSave = {
    ...productData,
    categoryId: Number(productData.categoryId),
    locationId: Number(productData.locationId),
    quantity: Number(productData.quantity),
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
}

const handleUpdateQty = async (id, step) => {
  const res = await window.api.products.updateQty({ id, change: step })
  if (res?.success) await fetchProducts(pagination.value.currentPage)
}

const handleDelete = async (id) => {
  if (!confirm("Supprimer ce produit (sera marqué comme jeté) ?")) return
  const res = await window.api.products.delete({ id, wasThrownAway: true })
  if (res?.success) await fetchProducts(pagination.value.currentPage)
}

// Nouvelle fonction pour ajouter un emplacement fonctionnelle avec le backend
const handleAddLocation = async () => {
  const locName = prompt("Nom du nouvel emplacement (ex: Garage) :")
  if (!locName || locName.trim() === "") return

  const res = await window.api.config.createLocation({ name: locName.trim() })
  if (res?.success) {
    await loadConfig() // Recharge la liste des emplacements pour mettre à jour le slider
  } else {
    alert(`Erreur backend : ${res?.message || 'Impossible de créer l\'emplacement'}`)
  }
}

/* --- HELPERS UI SÉCURISÉS --- */

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

    <div class="top-controls" style="display: flex; align-items: center; gap: 15px; margin-bottom: 1rem; width: 100%;">
      
      <div class="categories-slider" style="display: flex; gap: 10px; overflow-x: auto; flex-grow: 1; padding-bottom: 5px;">
        <button 
          class="filter-btn" :class="{ active: activeFilters.locationId === '' }" 
          @click="setLocationFilter('')" style="white-space: nowrap;">
          Tous
        </button>
        <button
          v-for="loc in locations" :key="loc.id"
          class="filter-btn" :class="{ active: activeFilters.locationId === loc.id }"
          @click="setLocationFilter(loc.id)" style="white-space: nowrap;">
          {{ loc.name }}
        </button>
      </div>

      <button class="btn-icon" @click="handleAddLocation" title="Ajouter un emplacement" style="background: var(--card-bg); border: 1px solid var(--card-border); color: white; padding: 8px 12px; border-radius: 10px; cursor: pointer; white-space: nowrap;">
        + Emplacement
      </button>
      
      <button 
        class="btn-icon" 
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters" 
        style="background: var(--card-bg); border: 1px solid var(--card-border); color: white; padding: 8px 15px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
        <span>⚙️</span> Filtres avancés
      </button>
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
          <span>DESCRIPTION</span>
          <span>CATÉGORIE</span>
          <span>GESTION STOCK</span>
          <span>LOCALISATION</span>
          <span>DATE EXPIRATION</span>
          <span>ACTIONS</span>
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
            <span class="pill category" :style="{ backgroundColor: p.category?.color || 'var(--primary-purple)' }">
              {{ p.category?.name || "N/A" }}
            </span>
          </div>

          <div class="col-stock">
            <StockControl 
              :product-id="p.id" 
              :quantity="p.quantity" 
              :unit="p.unit"
              @update-qty="handleUpdateQty" 
            />
          </div>

          <div class="col-loc">
            <span class="pill location">{{ p.location?.name || "N/A" }}</span>
          </div>

          <div class="col-exp">
            <div class="exp-box" :class="getExpirationStatus(p.expirationDate)">
              <span class="status-dot"></span>
              <span class="exp-label">{{ getExpirationText(p.expirationDate) }}</span>
            </div>
          </div>

          <div class="col-actions" style="display: flex; gap: 5px;">
            <button class="action-btn" @click="openEditModal(p)">✏️</button>
            <button class="action-btn delete" @click="handleDelete(p.id)">🗑️</button>
          </div>
        </div>

        <div v-if="!isLoading && products.length === 0" class="inventory-row">
          <div class="col-desc item-detail"><span class="item-name">Aucun produit ne correspond à ces filtres.</span></div>
        </div>
      </div>
    </div>

    <PaginationControls 
      v-if="pagination.totalPages > 1"
      :current-page="pagination.currentPage" 
      :last-page="pagination.lastPage"
      @prev="fetchProducts(pagination.currentPage - 1)"
      @next="fetchProducts(pagination.currentPage + 1)"
    />
  </main>

  <ProductModal 
    :show="showModal" 
    :categories="categories" 
    :locations="locations"
    :productToEdit="productToEdit"
    @close="showModal = false"
    @save="handleSaveProduct"
  />
</template>

<style scoped>
/* Slider (Maintenant pour les emplacements) */
.categories-slider::-webkit-scrollbar {
  height: 6px;
}
.categories-slider::-webkit-scrollbar-thumb {
  background: var(--card-border);
  border-radius: 10px;
}
.categories-slider::-webkit-scrollbar-track {
  background: transparent;
}

/* Panneau de filtres avancés */
.advanced-filters-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.filters-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--card-border);
  padding-top: 1rem;
}

.reset-btn {
  background: transparent;
  color: var(--accent-red);
  border: 1px solid rgba(255, 77, 77, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.reset-btn:hover {
  background: rgba(255, 77, 77, 0.1);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>