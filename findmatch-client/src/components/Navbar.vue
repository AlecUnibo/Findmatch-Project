<template>
  <nav class="navbar navbar-expand-lg navbar-dark px-3 sticky-top custom-navbar">
    <router-link class="navbar-brand" to="/home">
      <img src="/images/logo.png" alt="Home" class="navbar-logo" />
    </router-link>
    <ul class="navbar-nav ms-auto d-flex flex-row gap-3">

      <li class="nav-item"><router-link class="nav-link" to="/partite">Partite</router-link></li>
      <li class="nav-item"><router-link class="nav-link" to="/crea"><img src="/images/plus.svg" alt="Segui" width="18" height="18"/> Crea</router-link></li>
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
              class="list-group-item py-1 px-2 list-group-item-action"
              style="cursor: pointer"
              v-for="user in searchResults"
              :key="user.id"
              @click="openUserModal(user.id)"
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
    <!-- MODALE PROFILO UTENTE -->
    <div
      v-if="showModal"
      class="modal-backdrop d-flex align-items-center justify-content-center"
      @click.self="closeModal"
    >
      <div class="modal-content user-modal-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Profilo Utente</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>

        <div v-if="loadingUser" class="text-center py-4">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Caricamento...
        </div>

        <div v-else-if="selectedUser" class="user-card p-3 shadow-sm border-0 bg-white text-dark rounded">
          <div class="d-flex align-items-center mb-3">
            <img
              src="/images/immagine_profilo.jpg"
              class="rounded-circle me-3"
              alt="Foto profilo"
              width="80"
              height="80"
              style="object-fit: cover; border: 2px solid #ccc;"
            />
            <div>
              <h4 class="mb-0">{{ selectedUser.username }}</h4>
              <small class="text-muted">{{ selectedUser.email }}</small>
            </div>
          </div>

          <div class="row text-center mb-3 gx-2">
            <div class="col">
              <div class="stat-box border rounded p-2">
                <div class="small text-secondary">Partite giocate</div>
                <div class="fs-5 fw-bold text-dark">
                  {{ selectedUser.matches_played ?? 0 }}
                </div>
              </div>
            </div>
            <div class="col">
              <div class="stat-box border rounded p-2">
                <div class="small text-secondary">Follower</div>
                <div class="fs-5 fw-bold text-dark">
                  {{ selectedUser.followers_count ?? 0 }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <h6 class="mb-1">📝 Biografia</h6>
            <p v-if="selectedUser.bio && selectedUser.bio.trim()" style="white-space: pre-wrap;">
              {{ selectedUser.bio }}
            </p>
            <p v-else class="text-muted">Nessuna biografia disponibile</p>
          </div>

          <!-- se non sto visitando il profilo con cui sono loggato -->
          <div v-if="String(selectedUser.id) !== String(currentUserId)">
            <button
              v-if="!selectedUser.is_following"
              class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
              @click="seguiUtente(selectedUser.id)"
            >
              <img src="/images/plus.svg" alt="Segui" width="18" height="18" />
              Segui
            </button>

            <button
              v-else
              class="btn btn-outline-secondary w-100"
              @click="smettiDiSeguire(selectedUser.id)"
              title="Smetti di seguire"
            >
              Segui già
            </button>
          </div>

        </div>

      </div>
    </div>

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
const selectedUser = ref(null)
const showModal = ref(false)
const loadingUser = ref(false)
const currentUserId = localStorage.getItem('userId')


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
    const { data } = await axios.get(
      `http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery.value)}`
    )
    searchResults.value = data
  } catch (err) {
    console.error('Errore nella ricerca utenti:', err)
    searchResults.value = []
  }
}

const openUserModal = async (userId) => {
  try {
    loadingUser.value = true
    showModal.value = true
    showSearch.value = false

    const res = await axios.get(
      `http://localhost:3000/api/users/${userId}?viewerId=${encodeURIComponent(currentUserId)}`
    )
    selectedUser.value = res.data
  } catch (err) {
    console.error('Errore nel recupero utente:', err)
  } finally {
    loadingUser.value = false
  }
}


const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const seguiUtente = async (targetUserId) => {
  if (!currentUserId) return alert('Devi essere loggato');
  if (String(targetUserId) === String(currentUserId)) return; // no self-follow

  // se già segue, ignora (o implementa toggle)
  if (selectedUser.value?.is_following) return;

  // Optimistic UI
  const prev = { 
    followers_count: selectedUser.value.followers_count, 
    is_following: selectedUser.value.is_following 
  };
  selectedUser.value.followers_count = (selectedUser.value.followers_count ?? 0) + 1;
  selectedUser.value.is_following = true;

  try {
    const { data } = await axios.post(
      `http://localhost:3000/api/users/${targetUserId}/follow`,
      { followerId: currentUserId }
    );
    // allinea al dato server (in caso di concorrenza)
    selectedUser.value.followers_count = data.followers_count ?? selectedUser.value.followers_count;
  } catch (err) {
    console.error('Errore follow:', err);
    // rollback
    selectedUser.value.followers_count = prev.followers_count;
    selectedUser.value.is_following = prev.is_following;
    alert('❌ Errore durante il follow.');
  }
};

// opzionale: toggla unfollow
const smettiDiSeguire = async (targetUserId) => {
  if (!currentUserId) return;
  if (!selectedUser.value?.is_following) return;

  const prev = { 
    followers_count: selectedUser.value.followers_count, 
    is_following: selectedUser.value.is_following 
  };
  selectedUser.value.followers_count = Math.max(0, (selectedUser.value.followers_count ?? 0) - 1);
  selectedUser.value.is_following = false;

  try {
    const { data } = await axios.delete(
      `http://localhost:3000/api/users/${targetUserId}/follow`,
      { data: { followerId: currentUserId } }
    );
    selectedUser.value.followers_count = data.followers_count ?? selectedUser.value.followers_count;
  } catch (err) {
    console.error('Errore unfollow:', err);
    selectedUser.value.followers_count = prev.followers_count;
    selectedUser.value.is_following = prev.is_following;
  }
};


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

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.361);
  z-index: 1050;
}

.user-card {
  background-color: #fff;
  color: #000;
  border-radius: 10px;
}

.user-card h4 {
  color: #000 !important;
}

.stat-box {
  background-color: #ffffff;
  border: 1px solid #ccc;
  color: #222;
}

.user-modal-card {
  max-width: 600px;
  min-width: 360px;
  width: 100%;
  background-color: rgba(68, 127, 187, 0.955);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.353);
}

.user-modal-card .btn-close {
  filter: invert(1);
}

.user-modal-card h4,
.user-modal-card h5,
.user-modal-card h6 {
  color: #fff;
}

.user-modal-card .text-muted {
  color: #ddd !important;
}

.navbar-logo {
  height: 55px;
  width: auto;
  object-fit: contain;
}

</style>