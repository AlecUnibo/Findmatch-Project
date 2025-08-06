<template>
  <nav class="navbar navbar-expand-lg navbar-dark px-3 sticky-top custom-navbar">
    <router-link class="navbar-brand" to="/home">Findmatch</router-link>
    <ul class="navbar-nav ms-auto d-flex flex-row gap-3">

      <li class="nav-item"><router-link class="nav-link" to="/partite">Partite</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/crea">Crea</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/classifica">Classifica</router-link></li>

      <!-- Cerca utenti -->
      <li class="nav-item position-relative" ref="searchBox">
        <a class="nav-link" href="#" @click.prevent="toggleSearch">
          <img src="/images/search.svg" alt="Cerca" width="24" height="24" style="filter: invert(1)" />
        </a>

        <div v-if="showSearch" class="position-absolute end-0 mt-2 bg-white p-2 rounded shadow" style="z-index: 1000; width: 250px;">
          <input
            type="text"
            v-model="searchQuery"
            class="form-control form-control-sm"
            placeholder="Cerca utenti..."
            @input="searchUsers"
          />
          <ul class="list-group mt-2" v-if="searchResults.length">
            <li
              class="list-group-item py-1 px-2"
              v-for="user in searchResults"
              :key="user.id"
            >
              {{ user.username }}
            </li>
          </ul>
          <div v-else-if="searchQuery" class="small text-muted mt-2 px-1">Nessun utente trovato</div>
        </div>
      </li>

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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

const router = useRouter()

const searchQuery = ref('')
const searchResults = ref([])
const showSearch = ref(false)
const searchBox = ref(null)

const handleClickOutside = (event) => {
  if (searchBox.value && !searchBox.value.contains(event.target)) {
    showSearch.value = false
    searchQuery.value = ''
    searchResults.value = []
  }
}


const toggleSearch = () => {
  showSearch.value = !showSearch.value
  searchQuery.value = ''
  searchResults.value = []
}

const searchUsers = async () => {
  if (searchQuery.value.trim() === '') {
    searchResults.value = []
    return
  }

  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery.value)}`)
    searchResults.value = data
  } catch (err) {
    console.error('Errore nella ricerca utenti:', err)
    searchResults.value = []
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userName')
  localStorage.removeItem('userId')
  router.push('/') // Torna alla pagina di login
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

