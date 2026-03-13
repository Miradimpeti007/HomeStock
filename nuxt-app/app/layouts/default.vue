<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo-container">
        <div class="logo-box">📦</div>
        <span class="logo-text">HomeStock</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item active-link">
          <span class="nav-icon">⊞</span><span>Tableau de bord</span>
        </NuxtLink>
        <NuxtLink to="/inventaire" class="nav-item active-link">
          <span class="nav-icon">📋</span><span>Inventaire</span>
        </NuxtLink>
        <NuxtLink to="/courses" class="nav-item active-link">
          <span class="nav-icon">🛒</span><span>Liste de courses</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-label">SYSTÈME</div>
      <nav class="sidebar-nav">
        <NuxtLink to="/configuration" class="nav-item active-link">
          <span class="nav-icon">⚙</span><span>Configuration</span>
        </NuxtLink>
      </nav>
    </aside>

    <slot />
  </div>
</template>

<style scoped>
/* Ajoute ici une classe pour gérer l'état actif du menu si besoin */
.router-link-exact-active {
  background: rgba(83, 51, 237, 0.15);
  color: var(--text-main);
  box-shadow: inset 0 0 0 1px rgba(83, 51, 237, 0.3);
}
</style>