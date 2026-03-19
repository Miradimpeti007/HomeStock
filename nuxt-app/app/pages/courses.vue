<script setup>
import { ref, computed, onMounted } from 'vue'
import ProgressBar from '~/components/molecules/ProgressBar.vue'
import ShoppingGroup from '~/components/organisms/ShoppingGroup.vue'
import ShoppingModal from '~/components/organisms/ShoppingModal.vue'
import ValidationSummaryModal from '~/components/organisms/ValidationSummaryModal.vue'
import ProductModal from '~/components/organisms/ProductModal.vue'

const isLoading = ref(true)
const showModal = ref(false)
const shoppingItems = ref([])
const categories = ref([]) 
const locations = ref([]) 
const togglingIds = ref([])

// NOUVEAU : État de la recherche
const searchQuery = ref("")

const showSummaryModal = ref(false)
const validationSummary = ref(null)

const showProductModal = ref(false)
const productToEdit = ref(null)

const loadConfig = async () => {
  const cats = await window.api.config.getAllCategories()
  const locs = await window.api.config.getAllLocations() 
  if (cats?.success) categories.value = cats.data
  if (locs?.success) locations.value = locs.data
}

const fetchShoppingList = async () => {
  isLoading.value = true
  try {
    const res = await window.api.shopping.getList()
    if (res?.success) {
      shoppingItems.value = res.data
    }
  } catch (error) {
    console.error("Erreur chargement courses :", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadConfig() 
  await fetchShoppingList()
})

// NOUVEAU : Propriété calculée pour la recherche en temps réel
const filteredShoppingItems = computed(() => {
  if (!searchQuery.value.trim()) return shoppingItems.value
  const q = searchQuery.value.toLowerCase()
  return shoppingItems.value.filter(item => item.name && item.name.toLowerCase().includes(q))
})

// On calcule le total et les groupes sur la base des items filtrés
const totalItemsCount = computed(() => filteredShoppingItems.value.length)
const completedItems = computed(() => filteredShoppingItems.value.filter(i => i.isCompleted))
const completedItemsCount = computed(() => completedItems.value.length)

const groupedItems = computed(() => {
  const groups = {}
  filteredShoppingItems.value.forEach(item => {
    const catName = item.category?.name || "Générique"
    if (!groups[catName]) groups[catName] = { items: [], completedCount: 0 }
    
    groups[catName].items.push(item)
    if (item.isCompleted) groups[catName].completedCount++
  })
  return groups
})

/* --- ACTIONS CRUD COURSES --- */

const handleSaveItem = async (itemData) => {
  const res = await window.api.shopping.add({
    name: itemData.name,
    quantity: itemData.quantity ? Number(itemData.quantity) : 1,
    unit: itemData.unit,
    categoryId: itemData.categoryId ? Number(itemData.categoryId) : null
  })
  
  if (res?.success) {
    showModal.value = false
    await fetchShoppingList()
  } else {
    alert(`Erreur : ${res?.message}`)
  }
}

const handleUpdateQty = async (id, change) => {
  const itemIndex = shoppingItems.value.findIndex(i => i.id === id)
  if (itemIndex !== -1) {
    shoppingItems.value[itemIndex].quantity = parseFloat((shoppingItems.value[itemIndex].quantity + change).toFixed(2))
  }

  const res = await window.api.shopping.updateQty(id, change)
  if (!res?.success) {
    if (itemIndex !== -1) {
      shoppingItems.value[itemIndex].quantity = parseFloat((shoppingItems.value[itemIndex].quantity - change).toFixed(2))
    }
    alert("Erreur lors de la mise à jour de la quantité.")
  }
}

const handleToggleCheck = async (id) => {
  if (togglingIds.value.includes(id)) return 
  togglingIds.value.push(id) 

  try {
    const res = await window.api.shopping.toggleCompletion(id) 
    if (res?.success) {
      const itemIndex = shoppingItems.value.findIndex(i => i.id === id)
      if (itemIndex !== -1) {
        shoppingItems.value[itemIndex].isCompleted = !shoppingItems.value[itemIndex].isCompleted
      }
    } else {
      alert("Erreur lors de la mise à jour.")
    }
  } catch (err) {
    console.error(err)
  } finally {
    togglingIds.value = togglingIds.value.filter(tId => tId !== id)
  }
}

const handleRemoveItem = async (id) => {
  const item = shoppingItems.value.find(i => i.id === id)
  if (item && item.linkedProductId) {
    if(!confirm("Cet article a été généré automatiquement par le stock. Le supprimer quand même ?")) return
  }
  
  const res = await window.api.shopping.delete(id) 
  if (res?.success) await fetchShoppingList()
}

const handleValidateCart = async () => {
  // On valide uniquement les items qui sont affichés ET complétés
  const itemIds = completedItems.value.map(i => i.id)
  if (itemIds.length === 0) return

  const res = await window.api.shopping.validateCart(itemIds) 
  if (res?.success) {
    validationSummary.value = res.data
    showSummaryModal.value = true
    await fetchShoppingList() 
  } else {
    alert(`Erreur de validation : ${res?.message}`)
  }
}

/* --- ACTIONS ÉDITION PRODUIT DEPUIS LE RÉSUMÉ --- */

const openProductEditor = (product) => {
  productToEdit.value = product
  showProductModal.value = true
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
  
  const res = await window.api.products.update(dataToSave)

  if (res?.success) {
    showProductModal.value = false
    
    if (validationSummary.value && validationSummary.value.createdItems) {
      const idx = validationSummary.value.createdItems.findIndex(p => p.id === dataToSave.id)
      if (idx !== -1) {
        validationSummary.value.createdItems[idx] = { ...validationSummary.value.createdItems[idx], ...dataToSave }
      }
    }
  } else {
    alert(`Erreur de modification : ${res?.message || 'Inconnue'}`)
  }
}
</script>

<template>
  <main class="main-content">
    <header class="topbar">
      <div class="header-titles">
        <h1>Liste de Courses</h1>
        <p v-if="isLoading">Chargement de votre liste...</p>
        <p v-else>Gérez vos achats à effectuer</p>
      </div>
      <div style="display: flex; gap: 15px;">
        <button 
          v-if="completedItemsCount > 0" 
          class="btn-primary" 
          style="background: var(--accent-blue); box-shadow: 0 4px 15px rgba(45, 91, 255, 0.3);" 
          @click="handleValidateCart">
          🛒 Valider les achats ({{ completedItemsCount }})
        </button>
        <button class="btn-primary" @click="showModal = true">+ Nouvel Article</button>
      </div>
    </header>

    <div class="top-controls" style="display: flex; margin-bottom: 1.5rem;">
      <div class="search-wrapper" style="flex: 1; max-width: 400px;">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          class="search-input" 
          placeholder="Rechercher un article..." 
        />
      </div>
    </div>

    <ProgressBar :total="totalItemsCount" :completed="completedItemsCount" />

    <div class="shopping-groups">
      <ShoppingGroup 
        v-for="(groupData, catName) in groupedItems" :key="catName"
        :category-name="catName" 
        :group-data="groupData"
        :toggling-ids="togglingIds"
        @toggle-item="handleToggleCheck" 
        @remove-item="handleRemoveItem"
        @update-qty="handleUpdateQty"
      />
      
      <div v-if="!isLoading && totalItemsCount === 0" style="text-align: center; color: var(--text-muted); padding: 3rem;">
        <span v-if="searchQuery">Aucun article trouvé pour "{{ searchQuery }}".</span>
        <span v-else>Votre liste de courses est vide.</span>
      </div>
    </div>

    <ShoppingModal 
  :show="showModal" 
  :categories="categories" 
  @close="showModal = false" 
  @save="handleSaveItem"
  @category-added="loadConfig" 
/>

    <ValidationSummaryModal
      :show="showSummaryModal"
      :summary="validationSummary"
      @close="showSummaryModal = false"
      @edit-product="openProductEditor"
    />

    <ProductModal 
      :show="showProductModal" 
      :categories="categories" 
      :locations="locations"
      :productToEdit="productToEdit"
      @close="showProductModal = false"
      @save="handleSaveProduct"
    />
  </main>
</template>

<style scoped>
/* NOUVEAU CSS : Recherche */
.search-wrapper {
  position: relative;
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
</style>