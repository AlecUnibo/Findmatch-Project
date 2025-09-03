<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <Navbar v-if="showNavbar" />

    <!-- RouterView con transizione breve -->
    <RouterView v-slot="{ Component, route }">
      <Transition :name="route.meta.transition || 'page-fade'"
                  mode="out-in"
                  appear>
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>

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
