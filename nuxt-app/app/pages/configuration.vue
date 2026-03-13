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
      </section>
    </main>
  
</template>