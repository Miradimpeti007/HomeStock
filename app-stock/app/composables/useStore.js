import { ref, computed } from 'vue'

export const inventoryProducts = ref([
  {
    id: 1,
    name: "Lait Demi-écrémé",
    category: "PRODUITS LAITIERS",
    quantity: 2,
    unit: "L",
    location: "Frigo",
    minQuantity: 2,
    expirationDate: "2026-10-10",
    autoRefill: false
  },
  {
    id: 2,
    name: "Poulet Fermier",
    category: "VIANDE",
    quantity: 1,
    unit: "unite",
    location: "Frigo",
    minQuantity: 1,
    expirationDate: "2026-03-10", 
    autoRefill: true
  },
  {
    id: 3,
    name: "Pâtes Penne",
    category: "ÉPICERIE",
    quantity: 5,
    unit: "kg",
    location: "Cellier",
    minQuantity: 2,
    expirationDate: "2027-02-01",
    autoRefill: false
  }
])

// --- LOGIQUE PARTAGÉE ---

// Articles en rupture (utilisé par la cloche ET la liste de courses)
export const ruptureProducts = computed(() => 
  inventoryProducts.value.filter(p => p.quantity <= p.minQuantity)
)

// Articles urgents (périment dans moins de 3 jours)
export const urgentProducts = computed(() => {
  const now = new Date()
  return inventoryProducts.value.filter(p => {
    if (!p.expirationDate) return false
    const exp = new Date(p.expirationDate)
    const diff = (exp - now) / (1000 * 60 * 60 * 24)
    return diff > 0 && diff <= 3 
  })
})

// Compteur global pour le badge rouge et la cloche
export const totalAlertsCount = computed(() => 
  ruptureProducts.value.length + urgentProducts.value.length
)

// --- ACTIONS ---

export const addProduct = (product) => {
  inventoryProducts.value.push(product)
}

export const deleteProduct = (id) => {
  inventoryProducts.value = inventoryProducts.value.filter(p => p.id !== id)
}

export const decreaseStock = (id) => {
  const p = inventoryProducts.value.find(p => p.id === id)
  if (p && p.quantity > 0) {
    let step = (p.unit === "L" || p.unit === "kg") ? 0.5 : 1
    p.quantity = parseFloat((p.quantity - step).toFixed(2))
  }
}

// Ajouté pour tes boutons "+" fonctionnels
export const increaseStock = (id) => {
  const p = inventoryProducts.value.find(p => p.id === id)
  if (p) {
    let step = (p.unit === "L" || p.unit === "kg") ? 0.5 : 1
    p.quantity = parseFloat((p.quantity + step).toFixed(2))
  }
}