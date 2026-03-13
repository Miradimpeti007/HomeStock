<script setup>
import { navigateTo } from '#app'

// Redirige automatiquement vers le dashboard à l'ouverture du site
await navigateTo('/dashboard')
</script>

<template>
  <div>Redirection en cours...</div>
</template>