<script setup>
// ON IMPORTE TOUT DEPUIS LE STORE POUR LA SYNCHRONISATION
import { 
  inventoryProducts, 
  ruptureProducts, 
  urgentProducts, 
  totalAlertsCount 
} from "~/composables/useStore"
import { computed, ref, onMounted, onUnmounted } from "vue"

// État pour la fenêtre de notifications
const showNotifications = ref(false)

/** * LOGIQUE DE CALCUL SYNCHRONISÉE
 */
const total = computed(() => inventoryProducts.value.length)

// Articles périmés (calculé ici car spécifique à l'affichage Dashboard)
const perimeProducts = computed(() => {
  const now = new Date()
  return inventoryProducts.value.filter(p => {
    if (!p.expirationDate) return false
    return new Date(p.expirationDate) < now
  })
})

/**
 * GESTION DES INTERACTIONS
 */
const toggleNotifications = (event) => {
  event.stopPropagation()
  showNotifications.value = !showNotifications.value
}

const closeNotifications = () => {
  showNotifications.value = false
}

onMounted(() => {
  window.addEventListener('click', closeNotifications)
})

onUnmounted(() => {
  window.removeEventListener('click', closeNotifications)
})

function getRelativeDate(date) {
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return "Demain"
  return `Dans ${diff} jours`
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
        <NuxtLink to="/dashboard" class="nav-item active">
          <span class="nav-icon">⊞</span>
          <span>Tableau de bord</span>
        </NuxtLink>
        <NuxtLink to="/inventaire" class="nav-item">
          <span class="nav-icon">📋</span>
          <span>Inventaire</span>
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
          <span class="nav-icon">⚙</span>
          <span>Configuration</span>
        </NuxtLink>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="header-titles">
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de votre stock domestique</p>
        </div>
        
        <div class="notification-container">
          <button class="btn-notif" @click="toggleNotifications">
            <span class="icon">🔔</span>
            <span v-if="totalAlertsCount > 0" class="notif-dot"></span>
          </button>

          <Transition name="slide-fade">
            <div v-if="showNotifications" class="notif-dropdown" @click.stop>
              <div class="notif-header">Notifications ({{ totalAlertsCount }})</div>
              <div class="notif-list">
                <div v-for="p in ruptureProducts" :key="'r'+p.id" class="notif-item">
                  <span class="notif-icon red">⚠️</span>
                  <div class="notif-text">
                    <strong>{{ p.name }}</strong> est épuisé.
                  </div>
                </div>
                <div v-for="p in urgentProducts" :key="'u'+p.id" class="notif-item">
                  <span class="notif-icon orange">🕒</span>
                  <div class="notif-text">
                    <strong>{{ p.name }}</strong> périme bientôt.
                  </div>
                </div>
                <div v-if="totalAlertsCount === 0" class="notif-empty">
                  Aucune alerte en cours
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-bg blue">📦</div>
          <div class="stat-info">
            <span class="stat-label">ARTICLES TOTAL</span>
            <div class="stat-row">
              <span class="stat-value">{{ total }}</span>
              <span class="stat-trend">+12%</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon-bg pink">🕒</div>
          <div class="stat-info">
            <span class="stat-label">PÉREMPTION PROCHE</span>
            <div class="stat-row">
              <span class="stat-value">{{ urgentProducts.length }}</span>
              <span class="stat-trend">+12%</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-bg yellow">⚠️</div>
          <div class="stat-info">
            <span class="stat-label">RUPTURE DE STOCK</span>
            <div class="stat-row">
              <span class="stat-value">{{ ruptureProducts.length }}</span>
              <span class="stat-trend">+12%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panels-grid">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-icon-circle">🕒</div>
            <div class="panel-title-group">
              <h3>Articles Urgents</h3>
              <p>À consommer rapidement</p>
            </div>
          </div>
          <div class="list-container">
            <div v-for="p in urgentProducts" :key="p.id" class="list-item">
              <div class="item-main">
                <div class="item-img-placeholder">🥛</div>
                <div class="item-info">
                  <span class="item-name">{{ p.name }}</span>
                  <span class="item-sub orange">{{ getRelativeDate(p.expirationDate) }}</span>
                </div>
              </div>
              <span class="item-qty">{{ p.quantity }} {{ p.unit }}</span>
            </div>
            <p v-if="urgentProducts.length === 0" class="empty-msg">Tout est sous contrôle.</p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-icon-circle">⚠️</div>
            <div class="panel-title-group">
              <h3>Articles Périmés</h3>
              <p>À retirer immédiatement</p>
            </div>
          </div>
          <div class="list-container">
            <div v-for="p in perimeProducts" :key="p.id" class="list-item">
              <div class="item-main">
                <div class="item-img-placeholder">🍖</div>
                <div class="item-info">
                  <span class="item-name">{{ p.name }}</span>
                  <span class="item-sub red">Périmé</span>
                </div>
              </div>
              <button class="btn-delete">🗑️</button>
            </div>
            <p v-if="perimeProducts.length === 0" class="empty-msg">Aucun gaspillage !</p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-icon-circle">📦</div>
            <div class="panel-title-group">
              <h3>Rupture de Stock</h3>
              <p>Articles à réapprovisionner</p>
            </div>
          </div>
          <div class="list-container">
            <div v-for="p in ruptureProducts" :key="p.id" class="list-item">
              <div class="item-main">
                <div class="item-img-placeholder">🧼</div>
                <div class="item-info">
                  <span class="item-name">{{ p.name }}</span>
                  <span class="item-sub grey">Stock faible</span>
                </div>
              </div>
              <button class="btn-add-mini">+</button>
            </div>
            <p v-if="ruptureProducts.length === 0" class="empty-msg">Stock complet.</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>