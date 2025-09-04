<template>
  <nav class="component-navbar navbar navbar-expand-lg navbar-dark px-3 sticky-top custom-navbar" role="navigation" aria-label="Barra di navigazione principale">
    <router-link class="navbar-brand" to="/home" aria-label="Vai alla home di FindMatch">
      <img src="/images/logo.png" alt="Logo di FindMatch" class="navbar-logo" />
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
          aria-label="Crea una nuova partita"
          :aria-current="isActive('/crea') ? 'page' : null"
        >
          <img src="/images/plus.svg" alt="" width="18" height="18" class="icon-inline" aria-hidden="true" />
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
          <img src="/images/trophy.svg" alt="" width="18" height="18" class="icon-inline icon-trophy" aria-hidden="true" />
          <span class="ms-1">Classifica</span>
        </router-link>
      </li>

      <!-- Cerca utenti — popover moderno -->
      <li class="nav-item position-relative" ref="searchBox" role="none">
        <button
          type="button"
          class="nav-link btn-icon"
          @click="toggleSearch"
          :aria-expanded="String(showSearch)"
          aria-controls="nav-search"
          aria-label="Apri ricerca utenti"
        >
          <img src="/images/search.svg" alt="" width="24" height="24" class="icon-invert" aria-hidden="true" />
        </button>

        <transition name="pop">
          <div
            v-if="showSearch"
            id="nav-search"
            class="search-popover glass shadow-lg"
            role="region"
            aria-label="Finestra di ricerca utenti"
          >
            <div class="search-input-row">
              <img src="/images/search.svg" alt="" width="18" height="18" aria-hidden="true" />
              <input
                type="text"
                v-model="searchQuery"
                class="search-input"
                placeholder="Cerca utenti per username…"
                @input="searchUsers"
                @keydown.esc.stop.prevent="closeSearch"
                aria-label="Campo di testo per la ricerca di utenti"
              />
              <button class="btn-clear" @click="closeSearch" aria-label="Chiudi ricerca">✕</button>
            </div>

            <div class="search-results" role="listbox" aria-label="Risultati della ricerca">
              <template v-if="searchResults.length">
                <button
                  v-for="user in searchResults"
                  :key="user.id"
                  class="result-row"
                  role="option"
                  tabindex="0"
                  @click="openUserModal(user.id)"
                  @keydown.enter.prevent="openUserModal(user.id)"
                  :aria-label="`Apri il profilo di ${user.username}`"
                >
                  <img src="/images/immagine_profilo.jpg" :alt="`Foto profilo di ${user.username}`" width="28" height="28" class="avatar-sm" />
                  <span class="result-text">{{ user.username }}</span>
                </button>
              </template>

              <div v-else-if="searchQuery" class="empty-state">Nessun utente trovato</div>
              <div v-else class="hint">Digita per cercare…</div>
            </div>

            <div class="edge-fade" aria-hidden="true"></div>
          </div>
        </transition>
      </li>

      <li class="nav-item position-relative" role="none">
        <router-link to="/notifiche" class="nav-link d-flex align-items-center" role="menuitem" aria-label="Vai alle notifiche">
          <img src="/images/bell.svg" alt="" width="24" height="24" class="icon-invert" aria-hidden="true" />
          <span v-if="unreadNotifications > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" aria-live="polite">
            {{ unreadNotifications }}
            <span class="visually-hidden">notifiche non lette</span>
          </span>
        </router-link>
      </li>

      <!-- Menu profilo — popover moderno -->
      <li class="nav-item position-relative" ref="profileMenu" role="none">
        <button
          class="nav-link d-flex align-items-center btn-icon"
          type="button"
          @click="toggleProfileMenu"
          :aria-expanded="String(showProfile)"
          aria-haspopup="true"
          aria-controls="profile-menu"
          aria-label="Apri menu del profilo utente"
        >
          <img src="/images/person.svg" alt="" width="24" height="24" class="icon-invert" aria-hidden="true" />
        </button>

        <transition name="pop">
          <div
            v-if="showProfile"
            id="profile-menu"
            class="dropdown-panel glass shadow-lg"
            role="menu"
            aria-label="Menu del profilo"
            @keydown.esc.stop.prevent="closeProfileMenu"
          >
            <div class="dropdown-header">
              <img src="/images/immagine_profilo.jpg" alt="Avatar" width="36" height="36" class="avatar" />
              <div class="me-auto">
                <div class="label">Profilo</div>
                <div class="sub">{{ displayName }}</div>
              </div>
            </div>

            <hr class="dropdown-sep" />

            <button class="dropdown-item-modern" role="menuitem" @click="go('/profilo')">
              <img src="/images/person.svg" alt="" width="18" height="18" aria-hidden="true" />
              <span>Profilo</span>
            </button>
            <button class="dropdown-item-modern" role="menuitem" @click="go('/impostazioni')">
              <img src="/images/settings.svg" alt="" width="18" height="18" aria-hidden="true" />
              <span>Impostazioni</span>
            </button>

            <button
              class="dropdown-item-modern danger"
              role="menuitem"
              data-bs-toggle="modal"
              data-bs-target="#modalLogout"
            >
              <img src="/images/exit.svg" alt="" width="18" height="18" aria-hidden="true" />
              <span>Esci</span>
            </button>
          </div>
        </transition>
      </li>
    </ul>


    <!-- MODALE PROFILO UTENTE -->
    <teleport to="body">
      <div v-if="showModal" class="overlay-backdrop d-flex align-items-center justify-content-center" @click.self="closeModal">
        <div class="modal-content user-modal-card" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 id="user-modal-title" class="mb-0">Profilo Utente</h5>
            <button class="btn-close" @click="closeModal" aria-label="Chiudi finestra profilo utente"></button>
          </div>

          <div v-if="loadingUser" class="text-center py-4">
            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            <span aria-live="polite">Caricamento...</span>
          </div>

          <div v-else-if="selectedUser" class="user-card p-3 shadow-sm border-0 bg-white text-dark rounded">
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
                  <small class="user-email">{{ selectedUser.email }}</small>
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
                <h6 class="mb-1 bio-title ">📝 Biografia</h6>
                <p v-if="selectedUser.bio && selectedUser.bio.trim()" class="user-bio">{{ selectedUser.bio }}</p>
                <p v-else class="user-bio-empty">Nessuna biografia disponibile</p>
              </div>

              <div v-if="String(selectedUser.id) !== String(currentUserId)">
                <button v-if="!selectedUser.is_following" class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="seguiUtente(selectedUser.id)">
                  <img src="/images/plus.svg" alt="Segui" width="18" height="18" class="icon-inline" />
                  Segui
                </button>

                <button v-else class="btn btn-outline-secondary w-100" @click="smettiDiSeguire(selectedUser.id)" title="Smetti di seguire">Segui già</button>
              </div>
            </template>

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

    <!-- MODALE CONFERMA LOGOUT -->
    <teleport to="body">
      <div class="modal fade" id="modalLogout" tabindex="-1" aria-labelledby="modalLogoutLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow" role="dialog" aria-modal="true" aria-labelledby="modalLogoutLabel">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="modalLogoutLabel">Conferma logout</h5>
            </div>
            <div class="modal-body">
              <p class="mb-2">Sei sicuro di voler uscire?</p>
              <small class="text-muted">Dovrai effettuare di nuovo l’accesso per continuare.</small>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annulla</button>
              <button type="button" class="btn btn-danger" @click="confirmLogout" data-bs-dismiss="modal">
                <span v-if="logoutBusy" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sì, esci
              </button>
            </div>
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

const router = useRouter()
const route = useRoute()

/** LocalStorage safe */
const ls = typeof window !== 'undefined' ? window.localStorage : null
const displayName = ref(ls?.getItem('userName') || 'Utente')
const currentUserId = ls?.getItem('userId') || null

/** State */
const searchQuery = ref('')
const searchResults = ref([])
const showSearch = ref(false)
const searchBox = ref(null)

const selectedUser = ref(null)
const showModal = ref(false)
const loadingUser = ref(false)
const unreadNotifications = ref(0)

const showFollowersView = ref(false)
const followersSelectedList = ref([])
const followersSelectedLoading = ref(false)
const followersSelectedError = ref('')

const showProfile = ref(false)
const profileMenu = ref(null)

/* NEW: stato conferma logout */
const showLogoutConfirm = ref(false)

let notificationInterval = null

const logoutBusy = ref(false)

const confirmLogout = async () => {
  try {
    logoutBusy.value = true
    ls?.removeItem('token')
    ls?.removeItem('userName')
    ls?.removeItem('userId')
    displayName.value = 'Utente'
    router.push('/')
  } finally {
    logoutBusy.value = false
  }
}

/** Helpers (ricerca, profilo, ecc.) — invariati **/
const fetchUnreadCount = async () => {
  if (!currentUserId) return
  try {
    const { data } = await axios.get(`http://localhost:3000/api/notifiche/unread-count/${currentUserId}`)
    unreadNotifications.value = data.count
  } catch (err) { console.error('Errore nel recupero del conteggio notifiche:', err) }
}

const handleClickOutside = (event) => {
  if (searchBox.value && !searchBox.value.contains(event.target)) closeSearch()
  if (profileMenu.value && !profileMenu.value.contains(event.target)) showProfile.value = false
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    showProfile.value = false
    searchQuery.value = ''
    searchResults.value = []
    requestAnimationFrame(() => {
      const el = document.querySelector('#nav-search .search-input'); if (el) el.focus()
    })
  }
}
const closeSearch = () => { showSearch.value = false; searchQuery.value = ''; searchResults.value = [] }

const searchUsers = async () => {
  if (searchQuery.value.trim() === '') { searchResults.value = []; return }
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/search?query=${encodeURIComponent(searchQuery.value)}`)
    searchResults.value = data
  } catch (err) { console.error('Errore nella ricerca utenti:', err); searchResults.value = [] }
}

const openUserModal = async (userId) => {
  try {
    loadingUser.value = true; showModal.value = true; closeSearch(); showProfile.value = false
    const res = await axios.get(`http://localhost:3000/api/users/${userId}?viewerId=${encodeURIComponent(currentUserId)}`)
    selectedUser.value = res.data
  } catch (err) { console.error('Errore nel recupero utente:', err) }
  finally { loadingUser.value = false }
}

/** Menu profilo */
const toggleProfileMenu = () => { showProfile.value = !showProfile.value; if (showProfile.value) closeSearch() }
const closeProfileMenu = () => { showProfile.value = false }
const go = (path) => { closeProfileMenu(); router.push(path) }

/** Followers */

const openFollowersView = async () => {
  if (!selectedUser.value?.id) return

  // switch alla vista follower + stato iniziale pulito
  showFollowersView.value = true
  followersSelectedError.value = ''
  followersSelectedList.value = []
  followersSelectedLoading.value = true

  try {
    // adegua l’URL al tuo backend se diverso (es. data.followers)
    const { data } = await axios.get(
      `http://localhost:3000/api/users/${selectedUser.value.id}/followers`
    )
    followersSelectedList.value = Array.isArray(data?.followers) ? data.followers : data
  } catch (err) {
    console.error('Errore nel recupero dei follower:', err)
    followersSelectedError.value = 'Impossibile caricare i follower.'
  } finally {
    followersSelectedLoading.value = false
  }
}

const closeFollowersView = () => {
  showFollowersView.value = false
  followersSelectedList.value = []
  followersSelectedError.value = ''
}


/** Modal profilo */
const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
  showFollowersView.value = false
  followersSelectedList.value = []
  followersSelectedError.value = ''
}

/** Follow / Unfollow — invariati */
const seguiUtente = async (targetUserId) => {
  if (!currentUserId) return alert('Devi essere loggato')
  if (String(targetUserId) === String(currentUserId)) return
  if (selectedUser.value?.is_following) return
  const prev = { followers_count: selectedUser.value.followers_count, is_following: selectedUser.value.is_following }
  selectedUser.value.followers_count = (selectedUser.value.followers_count ?? 0) + 1
  selectedUser.value.is_following = true
  try {
    const { data } = await axios.post(`http://localhost:3000/api/users/${targetUserId}/follow`, { followerId: currentUserId })
    selectedUser.value.followers_count = data.followers_count ?? selectedUser.value.followers_count
  } catch (err) {
    console.error('Errore follow:', err)
    selectedUser.value.followers_count = prev.followers_count
    selectedUser.value.is_following = prev.is_following
    alert('❌ Errore durante il follow.')
  }
}
const smettiDiSeguire = async (targetUserId) => {
  if (!currentUserId) return
  if (!selectedUser.value?.is_following) return
  const prev = { followers_count: selectedUser.value.followers_count, is_following: selectedUser.value.is_following }
  selectedUser.value.followers_count = Math.max(0, (selectedUser.value.followers_count ?? 0) - 1)
  selectedUser.value.is_following = false
  try {
    const { data } = await axios.delete(`http://localhost:3000/api/users/${targetUserId}/follow`, { data: { followerId: currentUserId } })
    selectedUser.value.followers_count = data.followers_count ?? selectedUser.value.followers_count
  } catch (err) {
    console.error('Errore unfollow:', err)
    selectedUser.value.followers_count = prev.followers_count
    selectedUser.value.is_following = prev.is_following
  }
}

/** NEW: flusso conferma logout */
const openLogoutConfirm = () => {
  closeProfileMenu()
  showLogoutConfirm.value = true
  // porta il focus al bottone 'Annulla' appena il dialog appare
  requestAnimationFrame(() => {
    const el = document.querySelector('.confirm-card .btn-outline-secondary'); if (el) el.focus()
  })
}
const cancelLogout = () => { showLogoutConfirm.value = false }
/** Logout reale (invariato + aggiorna displayName) */
const logout = () => {
  ls?.removeItem('token')
  ls?.removeItem('userName')
  ls?.removeItem('userId')
  displayName.value = 'Utente'
  router.push('/')
}

/** Routing helpers */
const normalizePath = (p) => (p || '').replace(/\/+$/, '') || '/'
const isActive = (pathStart) => {
  try {
    const current = normalizePath(route.path)
    const target = normalizePath(pathStart)
    return current === target || current.startsWith(target + '/') || current.startsWith(target)
  } catch { return false }
}

/** Lifecycle */
let onStorage, onKey
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  onKey = (e) => {
    if (e.key === 'Escape') {
      if (showSearch.value) closeSearch()
      if (showProfile.value) closeProfileMenu()
      if (showLogoutConfirm.value) cancelLogout() // NEW: ESC chiude dialog
    }
  }
  document.addEventListener('keydown', onKey, { passive: true })

  onStorage = (e) => { if (e.key === 'userName') displayName.value = e.newValue || 'Utente' }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)

  fetchUnreadCount()
  notificationInterval = setInterval(fetchUnreadCount, 15000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (onKey) document.removeEventListener('keydown', onKey)
  if (typeof window !== 'undefined' && onStorage) window.removeEventListener('storage', onStorage)
  clearInterval(notificationInterval)
})
</script>
