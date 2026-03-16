<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlertsModal from '~/components/organisms/AlertsModal.vue'

const route = useRoute()
const router = useRouter()
const shoppingCount = ref(0)

// États pour stocker les données du 'body' et gérer l'affichage de la modale
const showAlertsModal = ref(false)
const alertsContent = ref("")

const fetchShoppingCount = async () => {
  try {
    const res = await window.api.shopping.getList({ isCompleted: false })
    if (res?.success) {
      shoppingCount.value = res.data.length
    }
  } catch (error) {
    console.error("Erreur de synchronisation du badge :", error)
  }
}

onMounted(() => {
  fetchShoppingCount()

  // LA CONNEXION AVEC LE PRELOAD : 
  // On écoute le signal provenant de win.webContents.send('open-alerts-modal', body)
  if (window.api && window.api.notifications) {
    window.api.notifications.onOpenAlerts((bodyData) => {
      
      // 1. On injecte les données reçues (le body) dans notre variable
      alertsContent.value = bodyData
      
      // 2. On vérifie si on est déjà sur la page inventaire
      if (route.path !== '/inventaire') {
        // Redirection vers l'inventaire puis ouverture de la modale
        router.push('/inventaire').then(() => {
          showAlertsModal.value = true
        })
      } else {
        // Si on y est déjà, on se contente d'ouvrir la modale
        showAlertsModal.value = true
      }
    })
  }
})

watch(() => route.path, () => {
  fetchShoppingCount()
})
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 3rem;">
        <div style="
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          background: linear-gradient(to top right, #4f46e5, #3b82f6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.3);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div>
          <h1 style="font-size: 1.125rem; font-weight: 700; letter-spacing: -0.025em; color: white; line-height: 1; margin: 0;">HomeStock</h1>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item" exact-active-class="active">
          <span class="nav-icon">⊞</span><span>Tableau de bord</span>
        </NuxtLink>
        <NuxtLink to="/inventaire" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📋</span><span>Inventaire</span>
        </NuxtLink>
        <NuxtLink to="/courses" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🛒</span><span>Liste de courses</span>
          <span v-if="shoppingCount > 0" class="badge-count">{{ shoppingCount }}</span>
        </NuxtLink>
        <NuxtLink to="/historique" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🕒</span><span>Historique</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-label">SYSTÈME</div>
      <nav class="sidebar-nav">
        <NuxtLink to="/configuration" class="nav-item" exact-active-class="active">
          <span class="nav-icon">⚙</span><span>Configuration</span>
        </NuxtLink>
      </nav>
    </aside>

    <slot />

    <AlertsModal 
      :show="showAlertsModal" 
      :alertsText="alertsContent" 
      @close="showAlertsModal = false" 
    />
  </div>
</template>