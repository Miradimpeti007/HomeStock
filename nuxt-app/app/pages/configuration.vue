<script setup>
import { ref, onMounted } from "vue"
import "~/assets/css/style.css"

// États pour les notifications (Paramètres)
const alertsPeremption = ref(true)
const alertsRupture = ref(true)

// Données dynamiques
const categories = ref([])
const locations = ref([])
const isLoading = ref(true)

// Modale Lieux
const showLocationModal = ref(false)
const locationForm = ref({ id: null, name: "" })

// Modale Catégories
const showCategoryModal = ref(false)
const categoryForm = ref({ id: null, name: "", color: "#6c5dff" })

// Chargement initial des données depuis SQLite
const loadConfig = async () => {
  isLoading.value = true
  const cats = await window.api.config.getAllCategories()
  const locs = await window.api.config.getAllLocations()
  
  if (cats?.success) categories.value = cats.data
  if (locs?.success) locations.value = locs.data
  isLoading.value = false
}

onMounted(() => {
  loadConfig()
})

/* --- GESTION DES LIEUX VIA MODALE --- */

const openLocationModal = (loc = null) => {
  if (loc) {
    locationForm.value = { ...loc }
  } else {
    locationForm.value = { id: null, name: "" }
  }
  showLocationModal.value = true
}

const saveLocation = async () => {
  if (!locationForm.value.name || !locationForm.value.name.trim()) {
    alert("⚠️ Le nom du lieu est obligatoire.")
    return
  }

  const dataToSend = {
    id: locationForm.value.id,
    name: locationForm.value.name.trim()
  }

  let res;
  if (dataToSend.id) {
    res = await window.api.config.updateLocation(dataToSend)
  } else {
    res = await window.api.config.createLocation(dataToSend)
  }

  if (res?.success) {
    showLocationModal.value = false
    await loadConfig()
  } else {
    alert(res?.message || "Erreur lors de l'enregistrement.")
  }
}

const handleRemoveLocation = async (id) => {
  if (!confirm("Supprimer ce lieu ? (Il ne doit pas être lié à des produits)")) return
  const res = await window.api.config.deleteLocation({ id })
  if (res?.success) {
    await loadConfig()
  } else {
    alert(res?.message)
  }
}

/* --- GESTION DES CATÉGORIES VIA MODALE --- */

const openCategoryModal = (cat = null) => {
  if (cat) {
    categoryForm.value = { ...cat }
  } else {
    // Si c'est une nouvelle, on lui donne une belle couleur aléatoire par défaut
    const niceColors = ['#ff7675', '#74b9ff', '#55efc4', '#00b894', '#fdcb6e', '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe', '#e17055']
    const randomColor = niceColors[Math.floor(Math.random() * niceColors.length)]
    categoryForm.value = { id: null, name: "", color: randomColor }
  }
  showCategoryModal.value = true
}

const saveCategory = async () => {
  if (!categoryForm.value.name || !categoryForm.value.name.trim()) {
    alert("⚠️ Le nom de la catégorie est obligatoire.")
    return
  }

  const dataToSend = {
    id: categoryForm.value.id,
    name: categoryForm.value.name.trim(),
    color: categoryForm.value.color
  }

  let res;
  if (dataToSend.id) {
    res = await window.api.config.updateCategory(dataToSend)
  } else {
    res = await window.api.config.createCategory(dataToSend)
  }

  if (res?.success) {
    showCategoryModal.value = false
    await loadConfig()
  } else {
    alert(res?.message || "Erreur lors de l'enregistrement.")
  }
}

const handleRemoveCategory = async (id) => {
  if (!confirm("Supprimer cette catégorie ?")) return
  const res = await window.api.config.deleteCategory({ id })
  if (res?.success) {
    await loadConfig()
  } else {
    alert(res?.message)
  }
}
</script>

<template>
  <main class="main-content">
    <header class="topbar">
      <div class="header-titles">
        <h1>Configuration</h1>
        <p>Gérez vos préférences, vos lieux et vos catégories</p>
      </div>
    </header>

    <div class="config-grid">
      
      <section class="config-section-card">
        <div class="section-header">
          <div class="icon-wrapper yellow">🔔</div>
          <div class="header-text">
            <h3>Notifications</h3>
            <p>Alertes du système</p>
          </div>
        </div>
        <div class="section-body">
          <div class="config-list">
            <div class="config-item">
              <div class="config-text">
                <h4>Alertes de péremption</h4>
                <p>Recevoir des notifications avant expiration</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="alertsPeremption">
                <span class="slider"></span>
              </label>
            </div>
            <div class="config-item">
              <div class="config-text">
                <h4>Rupture de stock</h4>
                <p>Être notifié quand un produit est épuisé</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="alertsRupture">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="config-section-card">
        <div class="section-header">
          <div class="icon-wrapper blue">📍</div>
          <div class="header-text">
            <h3>Lieux de stockage</h3>
            <p>{{ locations.length }} emplacement(s)</p>
          </div>
        </div>
        <div class="section-body has-list">
          
          <button class="btn-primary add-btn-full" @click="openLocationModal(null)">
            + Ajouter un lieu
          </button>
          
          <div class="item-list custom-scrollbar">
            <div v-for="loc in locations" :key="loc.id" class="item-row">
              <span class="item-name">{{ loc.name }}</span>
              <div class="actions">
                <button @click="openLocationModal(loc)" title="Modifier">✏️</button>
                <button class="btn-del" @click="handleRemoveLocation(loc.id)" title="Supprimer">🗑️</button>
              </div>
            </div>
            <div v-if="locations.length === 0" style="text-align: center; padding: 1rem; color: var(--text-muted);">
              Aucun lieu enregistré.
            </div>
          </div>

        </div>
      </section>

      <section class="config-section-card">
        <div class="section-header">
          <div class="icon-wrapper purple">🏷️</div>
          <div class="header-text">
            <h3>Catégories</h3>
            <p>{{ categories.length }} catégorie(s)</p>
          </div>
        </div>
        <div class="section-body has-list">
          
          <button class="btn-primary add-btn-full" @click="openCategoryModal(null)">
            + Ajouter une catégorie
          </button>
          
          <div class="item-list custom-scrollbar">
            <div v-for="cat in categories" :key="cat.id" class="item-row">
              <div class="cat-info">
                <span class="color-dot" :style="{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}80` }"></span>
                <span class="item-name">{{ cat.name }}</span>
              </div>
              <div class="actions">
                <button @click="openCategoryModal(cat)" title="Modifier">✏️</button>
                <button class="btn-del" @click="handleRemoveCategory(cat.id)" title="Supprimer">🗑️</button>
              </div>
            </div>
            <div v-if="categories.length === 0" style="text-align: center; padding: 1rem; color: var(--text-muted);">
              Aucune catégorie enregistrée.
            </div>
          </div>

        </div>
      </section>

    </div>

    <Transition name="fade">
      <div v-if="showLocationModal" class="modal-overlay" @click.self="showLocationModal = false">
        <div class="modal-container">
          <button class="close-modal-btn" @click="showLocationModal = false"><span class="close-icon-shape"></span></button>
          <header class="modal-header">
            <h2>{{ locationForm.id ? 'Modifier le lieu' : 'Nouveau lieu' }}</h2>
          </header>
          
          <form class="modal-form" @submit.prevent="saveLocation">
            <div class="form-group">
              <label>NOM DE L'EMPLACEMENT *</label>
              <input v-model="locationForm.name" type="text" placeholder="Ex: Frigo, Cave, Cellier..." required>
            </div>
            
            <button type="submit" class="submit-btn">Enregistrer</button>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
        <div class="modal-container">
          <button class="close-modal-btn" @click="showCategoryModal = false"><span class="close-icon-shape"></span></button>
          <header class="modal-header">
            <h2>{{ categoryForm.id ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h2>
          </header>
          
          <form class="modal-form" @submit.prevent="saveCategory">
            <div class="form-group">
              <label>NOM DE LA CATÉGORIE *</label>
              <input v-model="categoryForm.name" type="text" placeholder="Ex: Frais, Surgelés, Boissons..." required>
            </div>

            <div class="form-group">
              <label>COULEUR IDENTIFIANT *</label>
              <div style="display: flex; gap: 15px; align-items: center;">
                <div class="color-picker-wrapper-large">
                  <input v-model="categoryForm.color" type="color" class="color-picker">
                </div>
                <span style="color: var(--text-muted); font-family: monospace;">{{ categoryForm.color.toUpperCase() }}</span>
              </div>
            </div>
            
            <button type="submit" class="submit-btn">Enregistrer</button>
          </form>
        </div>
      </div>
    </Transition>

  </main>
</template>

<style scoped>
/* --- GRILLE PRINCIPALE --- */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

/* --- CARTES (BLOCS) --- */
.config-section-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 480px; /* Hauteur fixe pour forcer le scroll interne */
  overflow: hidden;
}

/* EN-TÊTE DES CARTES */
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--card-border);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.icon-wrapper.yellow { background: rgba(255, 171, 0, 0.1); color: #ffab00; }
.icon-wrapper.blue { background: rgba(0, 184, 217, 0.1); color: #00b8d9; }
.icon-wrapper.purple { background: rgba(108, 93, 255, 0.1); color: var(--primary-purple); }

.header-text h3 { margin: 0; font-size: 1.1rem; color: white; }
.header-text p { margin: 0; font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }

/* CORPS DES CARTES */
.section-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden; /* Empêche le débordement hors de la carte */
}

/* --- BOUTON AJOUT MODAL --- */
.add-btn-full {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 12px;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(108, 93, 255, 0.2);
}

/* --- LISTES AVEC SCROLL INTERNE --- */
.item-list {
  flex: 1;
  overflow-y: auto; /* Active le scroll uniquement ici */
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 5px; /* Évite que la scrollbar ne touche le contenu */
}

/* SCROLLBAR PERSONNALISÉE (Mode sombre) */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* --- LIGNES D'ÉLÉMENTS --- */
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-dark);
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.item-row:hover {
  border-color: var(--card-border);
  background: rgba(255, 255, 255, 0.05);
}

.item-name {
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* BOUTONS D'ACTION (Éditer / Supprimer) */
.actions {
  display: flex;
  gap: 4px;
}
.actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  font-size: 1.1rem;
  border-radius: 6px;
  opacity: 0.6;
  transition: all 0.2s ease;
}
.actions button:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}
.actions .btn-del:hover {
  background: rgba(255, 77, 77, 0.1);
}

/* --- SWITCH NOTIFICATIONS --- */
.config-list { display: flex; flex-direction: column; gap: 1rem; }
.config-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.config-item:last-child { border-bottom: none; }
.config-text h4 { margin: 0 0 4px 0; color: white; font-size: 1rem; }
.config-text p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }

.switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-dark); transition: .4s; border-radius: 24px; border: 1px solid var(--card-border); }
.slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--text-muted); transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--primary-purple); border-color: var(--primary-purple); }
input:checked + .slider:before { transform: translateX(20px); background-color: white; }

/* SÉLECTEUR DE COULEUR DANS LA MODALE */
.color-picker-wrapper-large {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--card-border);
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.color-picker {
  width: 150%;
  height: 150%;
  margin: -25%; 
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
}
</style>