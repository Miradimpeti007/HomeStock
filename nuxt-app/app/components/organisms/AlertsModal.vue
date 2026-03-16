<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  alertsText: String
})

const emit = defineEmits(['close'])

// On découpe le texte brut (séparé par des sauts de ligne \n) en un tableau d'alertes
const alertLines = computed(() => {
  if (!props.alertsText) return []
  return props.alertsText.split('\n').filter(line => line.trim() !== '')
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-container alerts-modal">
        <button class="close-modal-btn" @click="emit('close')">
          <span class="close-icon-shape"></span>
        </button>
        
        <header class="modal-header" style="margin-bottom: 1.5rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🔔</div>
          <h2 style="color: white; font-size: 1.4rem;">Alertes d'Inventaire</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px;">
            Détail des produits nécessitant votre attention
          </p>
        </header>

        <div class="modal-body alerts-list">
          <div v-for="(line, index) in alertLines" :key="index" class="alert-item">
            {{ line }}
          </div>
          
          <div v-if="alertLines.length === 0" style="text-align: center; color: var(--text-muted);">
            Aucune alerte à afficher.
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 2rem; display: flex; justify-content: center;">
          <button class="btn-primary" @click="emit('close')" style="padding: 10px 30px;">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.alerts-modal {
  max-width: 550px;
  width: 90%;
}

.alerts-list {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Stylisation de la barre de défilement pour la liste d'alertes */
.alerts-list::-webkit-scrollbar { width: 6px; }
.alerts-list::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }

.alert-item {
  background: var(--bg-dark);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
  color: white;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
}
</style>