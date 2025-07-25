<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <router-link class="navbar-brand" to="/">Findmatch</router-link>
    <ul class="navbar-nav ms-auto d-flex flex-row gap-3">
      <li class="nav-item"><router-link class="nav-link" to="/partite">Partite</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/crea">Crea</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/classifica">Classifica</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/profilo">Profilo</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/login">Login</router-link></li>
    </ul>
  </nav>
</template>
