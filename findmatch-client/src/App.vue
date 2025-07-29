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

// La Navbar non si mostra solo sulla pagina "/"
const showNavbar = computed(() => route.path !== '/')
</script>
