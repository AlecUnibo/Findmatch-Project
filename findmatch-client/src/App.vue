<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <Navbar v-if="showNavbar" />
    <router-view />
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()

const showNavbar = computed(() => {
  const authRoutes = ['/', '/register']
  const isAuthenticated = localStorage.getItem('userId') !== null
  return !authRoutes.includes(route.path) && isAuthenticated
})

const hideFooterRoutes = ['/chat', '/impostazioni']
const showFooter = computed(() => !hideFooterRoutes.includes(route.path))
</script>
