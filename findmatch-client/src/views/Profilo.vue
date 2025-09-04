<template>
  <div class="component-profilo container mt-5 mb-5">
    <div class="card p-4 shadow-sm">
      <div class="d-flex align-items-center">
        <div class="me-4">
          <img
            src="/images/immagine_profilo.jpg"
            class="rounded-circle"
            alt="Foto profilo"
            width="100"
            height="100"
          />
        </div>
        <div>
          <!-- Nome utente + badge + barra -->
          <h2 class="mb-0 d-flex align-items-center gap-3">
            {{ user.username }}

            <div
              v-if="userLeague"
              class="d-flex align-items-center gap-2 league-badge-container"
            >
              <span class="badge" :class="leagueClass">{{ userLeague }}</span>
              <div class="progress league-progress">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: leagueProgress.percent + '%' }"
                  :aria-valuenow="leagueProgress.percent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="`Progresso per la lega successiva: ${Math.round(leagueProgress.percent)}%`"
                ></div>
              </div>
            </div>
          </h2>

          <button
            class="btn text-white border-0 bg-details btn-pill mt-2"
            @click="apriModaleModifica"
            aria-label="Modifica profilo"
          >
            Modifica
          </button>
        </div>
      </div>

      <hr />
      <!-- Partite - Follower - Seguiti -->
      <div class="row text-center mb-3 g-3">
        <div class="col-12 col-md-4">
          <div class="card shadow-sm p-3">
            <div class="small text-muted">Partite giocate</div>
            <div class="fs-4 fw-bold">{{ matchesPlayed }}</div>
          </div>
        </div>
         <div class="col-6 col-md-4">
          <div
            class="card shadow-sm p-3 clickable"
            @click="apriModaleFollower"
            role="button"
            tabindex="0"
            aria-label="Mostra follower"
          >
            <div class="small text-muted">Follower</div>
            <div class="fs-4 fw-bold">{{ followersCount }}</div>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div
            class="card shadow-sm p-3 clickable"
            @click="apriModaleSeguiti"
            role="button"
            tabindex="0"
            aria-label="Mostra seguiti"
          >
            <div class="small text-muted">Seguiti</div>
            <div class="fs-4 fw-bold">{{ followingCount }}</div>
          </div>
        </div>
      </div>

      <!-- Biografia -->
      <div class="mb-4">
      <h3>📝 Biografia</h3>
        <p v-if="user.bio && user.bio.trim().length" class="mb-0 bio-text">
          {{ user.bio }}
        </p>
        <p v-else class="text-muted mb-0">
          Nessuna biografia. Clicca “Modifica” per aggiungerla.
        </p>
      </div>

      <hr class="my-4" />

      <!-- Nav Tab -->
      <ul class="nav nav-pills justify-content-center mb-4 custom-pills">
        <li class="nav-item" v-for="tab in tabs" :key="tab.value">
          <button
            class="nav-link"
            :class="{ active: currentTab === tab.value }"
            @click="currentTab = tab.value"
            :aria-label="`Vai alla tab ${tab.label}`"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>


      <!-- Contenuto tab con micro-transizione -->
      <Transition name="fade-blur" mode="out-in">
        <div :key="currentTab">
          <PartiteSection
            v-if="currentTab === 'storico'"
            :partite="playedMatches"
            sezione="storico"
          />

          <div v-else class="text-center text-muted py-4">
            Futura implementazione
          </div>
        </div>
      </Transition>
    </div>

    <!-- MODALE MODIFICA PROFILO -->
    <div
      class="modal fade"
      id="modalModificaProfilo"
      tabindex="-1"
      aria-labelledby="modalModificaProfiloLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalModificaProfiloLabel">Modifica Profilo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvaModifiche">
              <div class="mb-3">
                <label class="form-label">Biografia</label>
                <textarea
                  v-model="modalBio"
                  class="form-control"
                  rows="4"
                ></textarea>
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-primary" aria-label="Salva biografia">Salva</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALE SEGUÌTI -->
    <div
      class="modal fade"
      id="modalSeguiti"
      tabindex="-1"
      aria-labelledby="modalSeguitiLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalSeguitiLabel">Utenti seguiti</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingFollowing" class="text-center py-2">
              <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              Caricamento...
            </div>

            <div v-else>
              <ul v-if="followingList.length" class="list-group">
                <li
                  v-for="u in followingList"
                  :key="u.id"
                  class="list-group-item d-flex align-items-center"
                >
                  <img
                    src="/images/immagine_profilo.jpg"
                    :alt="`${u.username} avatar`"
                    width="36"
                    height="36"
                    class="rounded-circle me-2"
                  />
                  <div class="flex-grow-1">
                    <div class="fw-semibold">{{ u.username }}</div>
                    <small class="text-muted">{{ u.email }}</small>
                  </div>
                </li>
              </ul>
              <p v-else class="text-muted mb-0">Non stai seguendo nessuno.</p>
            </div>

            <p v-if="followingError" class="text-danger small mt-2">{{ followingError }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALE FOLLOWER -->
    <div
      class="modal fade"
      id="modalFollower"
      tabindex="-1"
      aria-labelledby="modalFollowerLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalFollowerLabel">I tuoi follower</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>

          <div class="modal-body">
            <div v-if="loadingFollowers" class="text-center py-2">
              <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              Caricamento...
            </div>

            <div v-else>
              <ul v-if="followersList.length" class="list-group">
                <li
                  v-for="u in followersList"
                  :key="u.id"
                  class="list-group-item d-flex align-items-center"
                >
                  <img
                    src="/images/immagine_profilo.jpg"
                    :alt="`${u.username} avatar`"
                    width="36"
                    height="36"
                    class="rounded-circle me-2"
                  />
                  <div class="flex-grow-1">
                    <div class="fw-semibold">{{ u.username }}</div>
                    <small class="text-muted">{{ u.email }}</small>
                  </div>
                </li>
              </ul>
              <p v-else class="text-muted mb-0">Nessun follower.</p>
            </div>

            <p v-if="followersError" class="text-danger small mt-2">{{ followersError }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'
import PartiteSection from '@/components/PartiteSection.vue'

const userId = localStorage.getItem('userId')

const user = ref({
  username: '',
  profilePicture: '',
  bio: ''
})

const followersCount = ref(0)
const followingCount = ref(0)     
const matchesPlayed = ref(0)       // partite giocate
const matchesCreated = ref(0)      // partite create
const playedMatches = ref([])

const modalBio = ref('')

const currentTab = ref(localStorage.getItem('profiloTab') || 'storico')
const tabs = [
  { label: '📖 Storico partecipazioni', value: 'storico' },
  { label: '📊 Statistiche', value: 'stats' }
]
watch(currentTab, (val) => localStorage.setItem('profiloTab', val))

// Stato per "Seguiti"
const followingList = ref([])
const loadingFollowing = ref(false)
const followingError = ref('')

// Stato per "Follower"
const followersList = ref([])
const loadingFollowers = ref(false)
const followersError = ref('')

// Computed per badge LEGA
const leagueThresholds = [0, 5, 10, 15, 20, 9999]

const userLeague = computed(() => {
  const total = Number(matchesPlayed.value) + Number(matchesCreated.value)
  if (total >= 0 && total <= 5) return 'Lega 5'
  if (total >= 6 && total <= 10) return 'Lega 4'
  if (total >= 11 && total <= 15) return 'Lega 3'
  if (total >= 16 && total <= 20) return 'Lega 2'
  if (total >= 21) return 'Lega 1'
  return null
})

const leagueProgress = computed(() => {
  const total = Number(matchesPlayed.value) + Number(matchesCreated.value)
  for (let i = 0; i < leagueThresholds.length - 1; i++) {
    if (total > leagueThresholds[i] && total <= leagueThresholds[i + 1]) {
      const min = leagueThresholds[i] + 1
      const max = leagueThresholds[i + 1]
      const progress = ((total - min) / (max - min)) * 100
      return { level: i + 1, percent: progress }
    }
  }
  return { level: 0, percent: 0 }
})

// Classe dinamica del badge
const leagueClass = computed(() => {
  if (!userLeague.value) return 'badge-normal'
  if (userLeague.value === 'Lega 3') return 'badge-flames'
  if (userLeague.value === 'Lega 2') return 'badge-flames-strong'
  if (userLeague.value === 'Lega 1') return 'badge-flames-ultimate'
  return 'badge-normal'
})


onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}`)
    user.value.username = data.username || ''
    user.value.bio = data.bio || ''
    followersCount.value = Number(data.followers_count) || 0

    // matches_played potrebbe arrivare come numero o come array
    if (Array.isArray(data.matches_played)) {
      matchesPlayed.value = data.matches_played.length
    } else {
      matchesPlayed.value = Number(data.matches_played) || 0
    }

    // Seguiti
    if (typeof data.following_count !== 'undefined') {
      followingCount.value = Number(data.following_count) || 0
    } else {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${userId}/following`)
        followingList.value = res.data || []
        followingCount.value = followingList.value.length
      } catch (e) {
        followingList.value = []
        followingCount.value = 0
      }
    }

    // Storico partite
    const storicoRes = await axios.get(`http://localhost:3000/api/partecipazioni/storico/${userId}`)
    playedMatches.value = Array.isArray(storicoRes.data) ? storicoRes.data : []

    // Partite create
    const createRes = await axios.get(`http://localhost:3000/api/partite/created/${userId}`)
    matchesCreated.value = parseInt(createRes.data.count ?? 0, 10)

  } catch (err) {
    console.error('Errore nel recupero utente o partite:', err)
  }
})

function apriModaleModifica() {
  modalBio.value = user.value.bio || ''
  const modal = new bootstrap.Modal(document.getElementById('modalModificaProfilo'))
  modal.show()
}

async function salvaModifiche() {
  try {
    await axios.put(`http://localhost:3000/api/users/${userId}`, { bio: modalBio.value })
    user.value.bio = modalBio.value
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificaProfilo'))
    modal.hide()
  } catch (err) {
    console.error('Errore salvataggio bio:', err)
    alert('❌ Errore durante il salvataggio della biografia.')
  }
}

// Apri modale "Seguiti"
async function apriModaleSeguiti() {
  followingError.value = ''
  loadingFollowing.value = true

  const el = document.getElementById('modalSeguiti')
  if (!el) return
  const modal = new bootstrap.Modal(el)
  modal.show()

  try {
    const res = await axios.get(`http://localhost:3000/api/users/${userId}/following`)
    followingList.value = res.data || []
    followingCount.value = followingList.value.length
  } catch (err) {
    console.error('Errore nel recupero seguiti:', err)
    followingError.value = 'Impossibile caricare la lista dei seguiti.'
    followingList.value = []
  } finally {
    loadingFollowing.value = false
  }
}

// Apri modale "Follower"
async function apriModaleFollower() {
  followersError.value = ''
  loadingFollowers.value = true

  const el = document.getElementById('modalFollower')
  if (!el) return
  const modal = new bootstrap.Modal(el)
  modal.show()

  try {
    const res = await axios.get(`http://localhost:3000/api/users/${userId}/followers`)
    followersList.value = res.data || []
  } catch (err) {
    console.error('Errore nel recupero follower:', err)
    followersError.value = 'Impossibile caricare la lista dei follower.'
    followersList.value = []
  } finally {
    loadingFollowers.value = false
  }
}
</script>

<style scoped>
img.rounded-circle {
  object-fit: cover;
  border: 2px solid #ddd;
}
.bio-text {
  white-space: pre-wrap;
}
</style>
