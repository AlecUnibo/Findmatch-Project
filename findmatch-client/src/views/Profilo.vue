<template>
  <div class="container mt-5 mb-5">
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
          <h3 class="mb-0">{{ user.username }}</h3>
          <button class="btn btn-primary btn-sm mt-2" @click="apriModaleModifica">
            Modifica
          </button>
        </div>
      </div>

      <hr />

      <div class="row text-center mb-3">
        <div class="col">
          <div class="card shadow-sm p-3">
            <div class="small text-muted">Partite giocate</div>
            <div class="fs-4 fw-bold">{{ matchesPlayed }}</div>
          </div>
        </div>
        <div class="col">
          <div class="card shadow-sm p-3">
            <div class="small text-muted">Follower</div>
            <div class="fs-4 fw-bold">{{ followersCount }}</div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h5>📝 Biografia</h5>
        <p v-if="user.bio && user.bio.trim().length" class="mb-0" style="white-space: pre-wrap;">
          {{ user.bio }}
        </p>
        <p v-else class="text-muted mb-0">
          Nessuna biografia. Clicca “Modifica” per aggiungerla.
        </p>
      </div>

      <hr class="my-4" />

      <!-- Nav Tab -->
      <ul class="nav nav-tabs justify-content-center mb-4">
        <li class="nav-item" v-for="tab in tabs" :key="tab.value">
          <button
            class="nav-link"
            :class="{ active: currentTab === tab.value }"
            @click="currentTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <!-- Contenuto tab -->
      <PartiteSection
        v-if="currentTab === 'storico'"
        :partite="playedMatches"
        sezione="storico"
      />

      <div v-else-if="currentTab === 'stats'" class="text-center text-muted py-4">
        Nessuna statistica disponibile.
      </div>
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
                <button type="submit" class="btn btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'
import PartiteSection from '@/components/PartiteSection.vue' // percorso da adattare

const userId = localStorage.getItem('userId')

const user = ref({
  username: '',
  profilePicture: '',
  bio: ''
})

const followersCount = ref(0)
const matchesPlayed = ref(0)
const playedMatches = ref([]) // partite giocate (storico)

const modalBio = ref('')

// stato tab
const currentTab = ref(localStorage.getItem('profiloTab') || 'storico')
const tabs = [
  { label: '📖 Storico partecipazioni', value: 'storico' },
  { label: '📊 Statistiche', value: 'stats' }
]
watch(currentTab, (val) => localStorage.setItem('profiloTab', val))

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}`)
    user.value.username = data.username || ''
    user.value.bio = data.bio || ''
    followersCount.value = data.followers_count ?? 0
    matchesPlayed.value = data.matches_played ?? 0

    // carica lo storico partite dell'utente loggato
    const storicoRes = await axios.get(`http://localhost:3000/api/partecipazioni/storico/${userId}`)
    playedMatches.value = storicoRes.data
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
</script>

<style scoped>
img.rounded-circle {
  object-fit: cover;
  border: 2px solid #ddd;
}

.nav-tabs .nav-link {
  color: black;
}

.nav-tabs .nav-link.active {
  color: #0d6efd !important;
  font-weight: bold;
}
</style>
