<template>
  <div>
    <Navbar v-if="showNavbar" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()

// Mostra Navbar solo se non sei in login/registrazione e l'utente è autenticato
const showNavbar = computed(() => {
  const authRoutes = ['/', '/register']
  const isAuthenticated = localStorage.getItem('userId') !== null
  return !authRoutes.includes(route.path) && isAuthenticated
})
</script>
