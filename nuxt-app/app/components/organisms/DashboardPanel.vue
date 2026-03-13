<script setup>
defineProps({
  title: String,
  subtitle: String,
  icon: String,
  items: Array,
  type: String // 'urgent', 'expired', ou 'rupture'
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <div class="panel-icon-circle">{{ icon }}</div>
      <div class="panel-title-group">
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
    </div>
    <div class="list-container">
      <div v-for="p in items" :key="p.id" class="list-item">
        <div class="item-main">
          <div class="item-img-placeholder">
            <span v-if="type === 'urgent'">📦</span>
            <span v-else-if="type === 'expired'">⚠️</span>
            <span v-else>🛒</span>
          </div>
          <div class="item-info">
            <span class="item-name">{{ p.name }}</span>
            <span v-if="type === 'urgent'" class="item-sub orange">{{ p.expText }}</span>
            <span v-else-if="type === 'expired'" class="item-sub red">Périmé</span>
            <span v-else-if="type === 'rupture'" class="item-sub grey">Stock : {{ p.quantity }} {{ p.unit }}</span>
          </div>
        </div>
        
        <span v-if="type === 'urgent'" class="item-qty">{{ p.quantity }} {{ p.unit }}</span>
        
        <button 
          v-if="type === 'expired'" 
          class="btn-action-mini danger" 
          title="Jeter"
          @click="emit('action', p)">
          🗑️
        </button>
      </div>
      
      <p v-if="items.length === 0" class="empty-msg">
        Tout est sous contrôle.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 1. CARTE GLOBALE : Hauteur fixe et Flexbox */
.panel {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 1.8rem;
  height: 420px; /* Force la même taille pour tous les panneaux */
  display: flex;
  flex-direction: column;
}

/* 2. EN-TÊTE : Reste fixe en haut */
.panel-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 1.5rem;
  flex-shrink: 0; /* Empêche l'en-tête de s'écraser quand la liste est longue */
}

.panel-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.panel-title-group h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.panel-title-group p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* 3. LISTE DÉROULANTE (Le cœur du correctif) */
.list-container {
  flex: 1; /* Prend tout l'espace restant dans les 420px */
  overflow-y: auto; /* Active le scroll vertical */
  padding-right: 8px; /* Laisse un peu de place pour la scrollbar */
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* Customisation de la Scrollbar pour l'esthétique */
.list-container::-webkit-scrollbar {
  width: 6px;
}
.list-container::-webkit-scrollbar-thumb {
  background: var(--card-border);
  border-radius: 10px;
}
.list-container::-webkit-scrollbar-track {
  background: transparent;
}

/* 4. STYLE DES ÉLÉMENTS INTERNES */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0; /* Garde la taille intacte de l'élément même si la zone scrolle */
}

.list-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--card-border);
}

.item-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-img-placeholder {
  width: 42px;
  height: 42px;
  background: var(--bg-dark);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.item-sub {
  font-size: 0.75rem;
  font-weight: 500;
}

.item-sub.orange { color: var(--accent-yellow); }
.item-sub.red { color: var(--accent-red); }
.item-sub.grey { color: var(--text-muted); }

.item-qty {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.empty-msg {
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 2rem 0;
  text-align: center;
}

.btn-action-mini {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-action-mini.danger:hover {
  background: rgba(255, 77, 77, 0.1);
  border-color: var(--accent-red);
}
</style>