<script setup>
import { ref } from "vue"
// Importation des données partagées pour la synchronisation du badge sidebar
import { ruptureProducts } from "~/composables/useStore"
import "~/assets/css/style.css"

// États pour les notifications
const alertsPeremption = ref(true)
const alertsRupture = ref(true)

// Gestion dynamique des lieux de stockage
const newLocationName = ref("")
const storageLocations = ref([
  { id: 1, name: "Frigo" },
  { id: 2, name: "Congélateur" },
  { id: 3, name: "Cellier" },
  { id: 4, name: "Entretien" }
])

function addLocation() {
  if (newLocationName.value.trim() !== "") {
    storageLocations.value.push({
      id: Date.now(),
      name: newLocationName.value.trim()
    })
    newLocationName.value = "" // Reset le champ
  }
}

function removeLocation(id) {
  storageLocations.value = storageLocations.value.filter(loc => loc.id !== id)
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
        <NuxtLink to="/configuration" class="nav-item active">
          <span class="nav-icon">⚙</span><span>Configuration</span>
        </NuxtLink>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="header-titles">
          <h1>Configuration</h1>
          <p>Paramètres de l'application</p>
        </div>
      </header>

      <section class="config-container">
        <div class="config-section-card">
          <div class="section-header">
            <div class="section-icon-bg yellow">🔔</div>
            <h3>Notifications</h3>
          </div>
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

        <div class="config-section-card">
          <div class="section-header">
            <div class="section-icon-bg blue">🏠</div>
            <h3>Lieux de stockage</h3>
          </div>
          
          <div class="add-location-form">
            <input 
              v-model="newLocationName" 
              type="text" 
              placeholder="Ajouter un lieu (ex: Garage)"
              @keyup.enter="addLocation"
            >
            <button class="btn-add-loc" @click="addLocation">Ajouter</button>
          </div>

          <div class="location-tags-grid">
            <div v-for="loc in storageLocations" :key="loc.id" class="location-tag">
              <span>{{ loc.name }}</span>
              <button class="remove-tag" @click="removeLocation(loc.id)">×</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>