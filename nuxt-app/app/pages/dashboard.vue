<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import StatCard from '~/components/molecules/StatCard.vue'
import DashboardPanel from '~/components/organisms/DashboardPanel.vue'

// États UI
const showNotifications = ref(false)
const isLoading = ref(true)

// Données de la base
const totalArticles = ref(0)
const urgentProducts = ref([])
const expiredProducts = ref([])
const ruptureProducts = ref([])

// Compteur global des alertes
const totalAlertsCount = computed(() => ruptureProducts.value.length + urgentProducts.value.length)

// Formatage des dates pour l'affichage
const getRelativeDate = (date) => {
  if (!date || String(date).startsWith('2099')) return "Non périssable"
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return "Demain"
  return `Dans ${diff} jours`
}

// Propriété calculée pour injecter le texte formaté dans les props du panel
const formattedUrgentProducts = computed(() => {
  return urgentProducts.value.map(p => ({
    ...p,
    expText: getRelativeDate(p.expirationDate)
  }))
})

// Chargement des données depuis SQLite via preload
const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // 1. Récupère le nombre total d'articles (on utilise totalItems renvoyé par le backend)
    const allRes = await window.api.products.getAll({})
    if (allRes?.success) totalArticles.value = allRes.data.totalItems

    // 2. Récupère les articles urgents
    const urgentRes = await window.api.products.getAll({ status: 'urgent' })
    if (urgentRes?.success) urgentProducts.value = urgentRes.data.items

    // 3. Récupère les articles périmés
    const expiredRes = await window.api.products.getAll({ status: 'expired' })
    if (expiredRes?.success) expiredProducts.value = expiredRes.data.items

    // 4. Calcule les ruptures (parcours de toutes les pages pour trouver quantity <= minQuantity)
    let allItems = []
    let page = 1
    let lastPage = false
    while (!lastPage) {
      const r = await window.api.products.getAll({ page })
      if (r?.success) {
        allItems.push(...r.data.items)
        lastPage = r.data.lastPage
      } else {
        break
      }
      page++
    }
    ruptureProducts.value = allItems.filter(p => p.quantity <= p.minQuantity)

  } catch (error) {
    console.error("Erreur chargement du dashboard :", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
  window.addEventListener('click', closeNotifications)
})

onUnmounted(() => {
  window.removeEventListener('click', closeNotifications)
})

// Action : Supprimer un article périmé
const handleDeleteExpired = async (product) => {
  if (!confirm(`Jeter définitivement ${product.name} ?`)) return
  // Appel du backend avec archivage obligatoire en wasThrownAway = true
  const res = await window.api.products.delete({ id: product.id, wasThrownAway: true })
  if (res?.success) await fetchDashboardData()
}

// Gestion des notifications
const toggleNotifications = (event) => {
  event.stopPropagation()
  showNotifications.value = !showNotifications.value
}

const closeNotifications = () => {
  showNotifications.value = false
}
</script>

<template>
  <main class="main-content">
    <header class="topbar">
      <div class="header-titles">
        <h1>Tableau de bord</h1>
        <p v-if="isLoading">Synchronisation des données...</p>
        <p v-else>Vue d'ensemble de votre stock domestique</p>
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
                  <strong>{{ p.name }}</strong> a atteint le seuil d'alerte.
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
      <StatCard 
        label="ARTICLES TOTAL" 
        :value="totalArticles" 
        icon="📦" 
        colorClass="blue" 
      />
      <StatCard 
        label="PÉREMPTION PROCHE" 
        :value="urgentProducts.length" 
        icon="🕒" 
        colorClass="pink" 
      />
      <StatCard 
        label="RUPTURE DE STOCK" 
        :value="ruptureProducts.length" 
        icon="⚠️" 
        colorClass="yellow" 
      />
    </section>

    <section class="panels-grid">
      <DashboardPanel 
        title="Articles Urgents"
        subtitle="À consommer rapidement"
        icon="🕒"
        type="urgent"
        :items="formattedUrgentProducts"
      />

      <DashboardPanel 
        title="Articles Périmés"
        subtitle="À jeter"
        icon="⚠️"
        type="expired"
        :items="expiredProducts"
        @action="handleDeleteExpired"
      />

      <DashboardPanel 
        title="Rupture de Stock"
        subtitle="Articles à réapprovisionner"
        icon="📦"
        type="rupture"
        :items="ruptureProducts"
      />
    </section>
  </main>
</template>