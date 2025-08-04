<template>
  <nav class="navbar navbar-expand-lg navbar-dark px-3 sticky-top custom-navbar">
    <router-link class="navbar-brand" to="/home">Findmatch</router-link>
    <ul class="navbar-nav ms-auto d-flex flex-row gap-3">

      <li class="nav-item"><router-link class="nav-link" to="/partite">Partite</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/crea">Crea</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/classifica">Classifica</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/chat"><img src ="/images/bell.svg" alt="Profilo" width="24" height="24" style= "filter: invert(1)"></router-link></li>
      <!-- menu dropdown con icona profilo -->
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
          <img src="/images/person.svg" alt="Profilo" width="24" height="24" style= "filter: invert(1)"  />
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><router-link class="dropdown-item" to="/profilo">Profilo</router-link></li>
          <li><router-link class="dropdown-item" to="/impostazioni">Impostazioni</router-link></li>
          <li><a class="dropdown-item" href="#" @click.prevent="logout">Esci</a></li>
        </ul>
      </li>

    </ul>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userName')
  localStorage.removeItem('userId')
  router.push('/') // Torna alla pagina di login
}
</script>

<style scoped>
.custom-navbar {
  background-color: rgba(68, 128, 187, 0.8); 
  backdrop-filter: blur(6px);             
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}
</style>

