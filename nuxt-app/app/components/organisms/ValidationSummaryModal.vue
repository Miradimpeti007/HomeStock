<script setup>
const props = defineProps({
  show: Boolean,
  summary: Object
})

const emit = defineEmits(['close', 'edit-product'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-container" style="max-width: 550px;">
        <button class="close-modal-btn" @click="emit('close')"><span class="close-icon-shape"></span></button>
        
        <header class="modal-header" style="margin-bottom: 1.5rem;">
          <h2 style="color: #00ffa3;">✅ Validation terminée</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px;">
            Vos achats ont été transférés dans l'inventaire.
          </p>
        </header>

        <div class="modal-body">
          <div class="summary-section">
            <h3>🔄 Produits mis à jour ({{ summary?.updatedCount || 0 }})</h3>
            <div v-if="summary?.updatedCount > 0" class="items-list">
              <div v-for="(item, index) in summary.updatedItems" :key="'upd-'+index" class="summary-item">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty success">+{{ item.quantityAdded }} ajouté(s)</span>
              </div>
            </div>
            <p v-else class="empty-text">Aucun stock existant n'a été modifié.</p>
          </div>

          <div class="summary-section">
            <h3>✨ Nouveaux produits créés ({{ summary?.createdCount || 0 }})</h3>
            <p v-if="summary?.createdCount > 0" class="sub-text">
              Voici les produits créés avec les valeurs par défaut. Vous pouvez les configurer maintenant :
            </p>
            
            <div v-if="summary?.createdCount > 0" class="items-list">
              <div v-for="prod in summary.createdItems" :key="prod.id" class="summary-item created">
                <div class="item-info">
                  <span class="item-name">{{ prod.name }}</span>
                  <span class="item-details">{{ prod.quantity }} {{ prod.unit }}</span>
                </div>
                <button class="action-btn edit-btn" @click="emit('edit-product', prod)" title="Modifier ce produit">
                  ✏️
                </button>
              </div>
            </div>
            <p v-else class="empty-text">Aucun nouveau produit n'a été créé.</p>
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 2rem; display: flex; justify-content: flex-end;">
          <button class="btn-primary danger" @click="emit('close')" style="background: var(--accent-red); box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);">
            Faire plus tard dans l'inventaire
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.summary-section {
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  padding: 1rem;
  border-radius: 12px;
}
.summary-section h3 {
  font-size: 1rem;
  color: white;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sub-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.empty-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}
.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-dark);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}
.item-name {
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
}
.item-qty.success {
  color: #00ffa3;
  font-size: 0.85rem;
  font-weight: bold;
}
.item-details {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: 8px;
}
.edit-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--card-border);
  border-radius: 6px;
  padding: 5px;
  cursor: pointer;
  transition: 0.2s;
}
.edit-btn:hover {
  background: var(--primary-purple);
}
</style>