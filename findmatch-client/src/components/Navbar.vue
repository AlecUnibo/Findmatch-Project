<template>
  <nav class="component-navbar navbar navbar-expand-lg navbar-dark px-3 sticky-top custom-navbar" role="navigation" aria-label="Barra di navigazione principale">
    <router-link class="navbar-brand" to="/home" aria-label="Vai alla home">
      <img src="/images/logo.png" alt="Logo di FindMatch — vai alla home" class="navbar-logo" />
    </router-link>

    <ul class="navbar-nav ms-auto d-flex flex-row gap-3" role="menubar" aria-label="Menu principale">
      <li class="nav-item" role="none">
        <router-link
          to="/partite"
          class="nav-link"
          :class="{ 'is-active': isActive('/partite') }"
          role="menuitem"
          aria-label="Vai alla sezione Partite"
          :aria-current="isActive('/partite') ? 'page' : null"
        >
          Partite
        </router-link>
      </li>

      <li class="nav-item" role="none">
        <router-link
          to="/crea"
          class="nav-link d-flex align-items-center"
          :class="{ 'is-active': isActive('/crea') }"
          role="menuitem"
          aria-label="Vai alla sezione Crea"
          :aria-current="isActive('/crea') ? 'page' : null"
        >
          <img src="/images/plus.svg" alt="Crea nuova partita" width="18" height="18" class="icon-inline" />
          <span class="ms-1">Crea</span>
        </router-link>
      </li>

      <li class="nav-item" role="none">
        <router-link
          to="/classifica"
          class="nav-link d-flex align-items-center"
          :class="{ 'is-active': isActive('/classifica') }"
          role="menuitem"
          aria-label="Vai alla classifica"
          :aria-current="isActive('/classifica') ? 'page' : null"
        >
          <img src="/images/trophy.svg" alt="Classifica" width="18" height="18" class="icon-inline icon-trophy" />
          <span class="ms-1">Classifica</span>
        </router-link>
      </li>

      <!-- Cerca utenti -->
      <li class="nav-item position-relative" ref="searchBox" role="none">
        <button
          type="button"
          class="nav-link btn-icon"
          @click="toggleSearch"
          :aria-expanded="String(showSearch)"
          aria-controls="nav-search"
          aria-label="Apri ricerca utenti"
        >
          <img src="/images/search.svg" alt="Cerca utenti" width="24" height="24" class="icon-invert" />
        </button>

        <div
          v-if="showSearch"
          id="nav-search"
          class="position-absolute end-0 mt-2 bg-white p-2 rounded shadow search-box"
          role="region"
          aria-label="Risultati ricerca utenti"
        >
          <input
            type="text"
            v-model="searchQuery"
            class="form-control form-control-sm"
            placeholder="Cerca utenti..."
            @input="searchUsers"
            aria-label="Campo ricerca utenti"
          />
          <ul class="list-group mt-2" v-if="searchResults.length" role="listbox" aria-label="Risultati della ricerca">
            <li
              v-for="user in searchResults"
              :key="user.id"
              class="list-group-item py-1 px-2 list-group-item-action cursor-pointer"
              role="option"
              tabindex="0"
              @click="openUserModal(user.id)"
              @keydown.enter.prevent="openUserModal(user.id)"
              :aria-label="`Apri profilo di ${user.username}`"
            >
              {{ user.username }}
            </li>
          </ul>
          <div v-else-if="searchQuery" class="small text-muted mt-2 px-1">Nessun utente trovato</div>
        </div>
      </li>

      <li class="nav-item position-relative" role="none">
        <router-link to="/notifiche" class="nav-link d-flex align-items-center" role="menuitem" aria-label="Vai alle notifiche">
          <img src="/images/bell.svg" alt="Notifiche" width="24" height="24" class="icon-invert" />
          <span v-if="unreadNotifications > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" aria-live="polite">
            {{ unreadNotifications }}
            <span class="visually-hidden">notifiche non lette</span>
          </span>
        </router-link>
      </li>

      <!-- menu dropdown con icona profilo -->
      <li class="nav-item dropdown" role="none">
        <button
          class="nav-link dropdown-toggle d-flex align-items-center btn-icon"
          type="button"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="Apri menu profilo"
        >
          <img src="/images/person.svg" alt="Apri menu profilo" width="24" height="24" class="icon-invert" />
        </button>
        <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-label="Menu profilo">
          <li role="none"><router-link class="dropdown-item" to="/profilo" role="menuitem">Profilo</router-link></li>
          <li role="none"><router-link class="dropdown-item" to="/impostazioni" role="menuitem">Impostazioni</router-link></li>
          <li role="none"><a class="dropdown-item" href="#" @click.prevent="logout" role="menuitem">Esci</a></li>
        </ul>
      </li>
    </ul>

    <!-- MODALE PROFILO UTENTE (teleported) -->
    <teleport to="body">
      <div v-if="showModal" class="overlay-backdrop d-flex align-items-center justify-content-center" @click.self="closeModal">
        <div class="modal-content user-modal-card" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 id="user-modal-title" class="mb-0">Profilo Utente</h5>
            <button class="btn-close" @click="closeModal" aria-label="Chiudi profilo"></button>
          </div>

          <div v-if="loadingUser" class="text-center py-4">
            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            <span aria-live="polite">Caricamento...</span>
          </div>

          <div v-else-if="selectedUser" class="user-card p-3 shadow-sm border-0 bg-white text-dark rounded">
            <!-- VISTA PROFILO (default) -->
            <template v-if="!showFollowersView">
              <div class="d-flex align-items-center mb-3">
                <img
                  src="/images/immagine_profilo.jpg"
                  :alt="`Foto profilo di ${selectedUser.username}`"
                  width="80"
                  height="80"
                  class="rounded-circle me-3 profile-img"
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
                    <div class="fs-5 fw-bold text-dark">{{ selectedUser.matches_played ?? 0 }}</div>
                  </div>
                </div>

                <div class="col">
                  <div
                    class="stat-box border rounded p-2 clickable"
                    @click="openFollowersView"
                    @keydown.enter.prevent="openFollowersView"
                    role="button"
                    tabindex="0"
                    title="Vedi follower"
                  >
                    <div class="small text-secondary">Follower</div>
                    <div class="fs-5 fw-bold text-dark">{{ selectedUser.followers_count ?? 0 }}</div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <h6 class="mb-1">📝 Biografia</h6>
                <p v-if="selectedUser.bio && selectedUser.bio.trim()" class="user-bio">{{ selectedUser.bio }}</p>
                <p v-else class="text-muted">Nessuna biografia disponibile</p>
              </div>

              <div v-if="String(selectedUser.id) !== String(currentUserId)">
                <button v-if="!selectedUser.is_following" class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="seguiUtente(selectedUser.id)">
                  <img src="/images/plus.svg" alt="Segui" width="18" height="18" class="icon-inline" />
                  Segui
                </button>

                <button v-else class="btn btn-outline-secondary w-100" @click="smettiDiSeguire(selectedUser.id)" title="Smetti di seguire">Segui già</button>
              </div>
            </template>

            <!-- VISTA FOLLOWER (lista) -->
            <template v-else>
              <div class="d-flex align-items-center mb-3">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="closeFollowersView" aria-label="Torna indietro">← Indietro</button>
                <h5 class="mb-0">Follower di {{ selectedUser.username }}</h5>
              </div>

              <div v-if="followersSelectedLoading" class="text-center py-2">
                <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                <span aria-live="polite">Caricamento...</span>
              </div>

              <ul v-else-if="followersSelectedList.length" class="list-group" role="list">
                <li v-for="u in followersSelectedList" :key="u.id" class="list-group-item d-flex align-items-center">
                  <img src="/images/immagine_profilo.jpg" :alt="`Foto profilo di ${u.username}`" width="36" height="36" class="rounded-circle me-2 profile-img-sm" />
                  <div class="flex-grow-1">
                    <div class="fw-semibold">{{ u.username }}</div>
                    <small class="text-muted">{{ u.email }}</small>
                  </div>
                </li>
              </ul>

              <p v-else class="text-muted mb-0">Nessun follower.</p>
              <p v-if="followersSelectedError" class="text-danger small mt-2" role="alert">{{ followersSelectedError }}</p>
            </template>
          </div>
        </div>
      </div>
    </teleport>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const searchResults = ref([])
const showSearch = ref(false)
const searchBox = ref(null)
const selectedUser = ref(null)
const showModal = ref(false)
const loadingUser = ref(false)
const currentUserId = localStorage.getItem('userId')
const unreadNotifications = ref(0)
const loadingFollowersSelected = ref(false)
const showFollowersView = ref(false)
const followersSelectedList = ref([])
const followersSelectedLoading = ref(false)
const followersSelectedError = ref('')

let notificationInterval = null

const fetchUnreadCount = async () => {
  if (!currentUserId) return;
  try {
    const { data } = await axios.get(`http://localhost:3000/api/notifiche/unread-count/${currentUserId}`);
    unreadNotifications.value = data.count;
  } catch (err) {
    console.error('Errore nel recupero del conteggio notifiche:', err);
  }
};

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
  if (showSearch.value) {
    setTimeout(() => {
      const el = document.querySelector('#nav-search input')
      if (el) el.focus()
    }, 0)
  }
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

const openFollowersView = async () => {
  if (!selectedUser.value?.id) return
  followersSelectedError.value = ''
  followersSelectedLoading.value = true
  showFollowersView.value = true

  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/users/${selectedUser.value.id}/followers`
    )
    followersSelectedList.value = data || []
  } catch (err) {
    console.error('Errore nel recupero follower utente selezionato:', err)
    followersSelectedError.value = 'Impossibile caricare la lista dei follower.'
    followersSelectedList.value = []
  } finally {
    followersSelectedLoading.value = false
  }
}

const closeFollowersView = () => {
  showFollowersView.value = false
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
  showFollowersView.value = false
  followersSelectedList.value = []
  followersSelectedError.value = ''
}

const seguiUtente = async (targetUserId) => {
  if (!currentUserId) return alert('Devi essere loggato');
  if (String(targetUserId) === String(currentUserId)) return;
  if (selectedUser.value?.is_following) return;

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
    selectedUser.value.followers_count = data.followers_count ?? selectedUser.value.followers_count;
  } catch (err) {
    console.error('Errore follow:', err);
    selectedUser.value.followers_count = prev.followers_count;
    selectedUser.value.is_following = prev.is_following;
    alert('❌ Errore durante il follow.');
  }
};

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
  router.push('/')
}

const normalizePath = (p) => (p || '').replace(/\/+$/, '') || '/'
const isActive = (pathStart) => {
  try {
    const current = normalizePath(route.path)
    const target = normalizePath(pathStart)
    return current === target || current.startsWith(target + '/') || current.startsWith(target)
  } catch {
    return false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchUnreadCount();
  notificationInterval = setInterval(fetchUnreadCount, 15000); // Poll ogni 15 secondi
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  clearInterval(notificationInterval);
});
</script>
