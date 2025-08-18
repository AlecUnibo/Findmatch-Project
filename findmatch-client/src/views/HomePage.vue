<template>
  <div class="component-home">
    <div class="container mt-5">
      <!-- Benvenuto -->
      <div class="text-center mb-4">
        <h2>Benvenuto, {{ nomeUtente }}! 👋</h2>
        <p class="text-muted">Trova o unisciti alla tua prossima partita sportiva!</p>
      </div>

      <!-- Ricerca avanzata -->
      <div class="row justify-content-center mb-4 g-2">
        <div class="col-md-3">
          <input id="autocomplete-luogo" type="text" class="form-control" placeholder="Cerca luogo" />
        </div>

        <div class="col-md-3">
          <select v-model="sportFiltro" class="form-select">
            <option value="">Seleziona uno sport</option>
            <option>Calcio a 11</option>
            <option>Calcio a 5</option>
            <option>Basket</option>
            <option>Beach Volley</option>
            <option>Pallavolo</option>
            <option>Racchettoni</option>
            <option>Tennis</option>
            <option>Paddle</option>
          </select>
        </div>


        <div class="col-md-2">
          <input type="date" v-model="dataFiltro" class="form-control" />
        </div>

        <div class="col-md-2">
          <input type="time" v-model="orarioFiltro" class="form-control" />
        </div>

        <div class="col-auto d-flex gap-2">
          <button class="btn btn-outline-success" @click="cercaPartite">Cerca</button>
          <button class="btn btn-outline-danger" @click="pulisciFiltri">Pulisci</button>
        </div>

      </div>
      <!-- Tabs -->
      <ul class="nav nav-pills justify-content-center mb-3">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab==='disponibili' }" @click="tab='disponibili'">
            Disponibili
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab==='mie' }" @click="tab='mie'">
            Create da te
          </button>
        </li>
      </ul>

      <!-- Partite trovate -->
      <div class="mb-5" v-if="tab==='disponibili'">
        <h4 class="mb-3">📅 Partite disponibili</h4>
        <div v-if="partiteDisponibili.length">
          <div v-for="partita in partiteDisponibili" :key="partita.id" class="card mb-3 text-white" :class="getCardClass(partita.sport)">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title mb-1">{{ getSportIcon(partita.sport) }} {{ partita.sport }}</h5>
                <p class="card-text mb-0">
                  <!-- Stato posti -->
                  <strong>Data:</strong> {{ formatData(partita.date_time) }} –
                  <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
                  <strong>Luogo:</strong> {{ partita.location }}

                  <div class="d-flex align-items-center gap-2 mt-2">
                    <span class="badge bg-light text-dark">
                      {{ postiLiberi(partita) }} posti liberi
                    </span>
                  </div>
                  <div class="progress mt-2" style="height: 6px;">
                    <div class="progress-bar"
                        role="progressbar"
                        :class="progressBarClass(partita)"
                        :style="{ width: progressPercent(partita) + '%' }"
                        :aria-valuenow="partita.partecipanti"
                        :aria-valuemin="0"
                        :aria-valuemax="partita.max_players">
                    </div>
                  </div>
                </p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" @click="apriDettagli(partita)">Dettagli</button>
                <!-- già iscritto -->
                <button class="btn btn-sm btn-danger" v-if="partecipazioniUtente.includes(partita.id)" @click="abbandona(partita.id)">
                  Abbandona
                </button>
                <!-- puoi unirti -->
                <button class="btn btn-sm btn-success" v-else @click="unisciti(partita.id, partita.organizer_id, partita.sport)">
                  Unisciti
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted">Nessuna partita trovata.</div>
      </div>

      <div class="mb-5" v-else>
        <h4 class="mb-3">🛠️ Create da te</h4>
        <div v-if="partiteCreate.length">
          <div v-for="partita in partiteCreate" :key="partita.id" class="card mb-3 text-white" :class="getCardClass(partita.sport)">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title mb-1">
                  {{ getSportIcon(partita.sport) }} {{ partita.sport }}
                  <span class="badge bg-warning text-dark ms-2">Tua</span>
                </h5>
                <p class="card-text mb-0">

                  <!-- Stato posti -->
                  <div class="d-flex align-items-center gap-2 mt-2">
                    <span class="badge bg-light text-dark">
                      {{ postiLiberi(partita) }} posti liberi
                    </span>
                  </div>
                  <div class="progress mt-2" style="height: 6px;">
                    <div class="progress-bar"
                        role="progressbar"
                        :class="progressBarClass(partita)"
                        :style="{ width: progressPercent(partita) + '%' }"
                        :aria-valuenow="partita.partecipanti"
                        :aria-valuemin="0"
                        :aria-valuemax="partita.max_players">
                    </div>
                  </div>

                  <strong>Data:</strong> {{ formatData(partita.date_time) }} –
                  <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
                  <strong>Luogo:</strong> {{ partita.location }}
                </p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" @click="apriDettagli(partita)">Dettagli</button>
                <!-- opzionale: pulsante gestisci/elimina se già previsto nel backend -->
                <!-- <button class="btn btn-sm btn-outline-danger" @click="eliminaPartita(partita.id)">Elimina</button> -->
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted">Non hai ancora creato partite.</div>
      </div>


      <!-- MODALE DETTAGLI -->
      <div class="modal fade" id="modalDettagli" tabindex="-1" aria-labelledby="modalDettagliLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalDettagliLabel">{{ partitaSelezionata?.sport || 'Dettagli Partita' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
            </div>
            <div class="modal-body" v-if="partitaSelezionata">
              <p><strong>Data:</strong> {{ formatData(partitaSelezionata.date_time) }}</p>
              <p><strong>Ora:</strong> {{ formatOra(partitaSelezionata.date_time) }}</p>
              <p><strong>Luogo:</strong> {{ partitaSelezionata.location }}</p>
              <p><strong>Posti rimanenti:</strong> {{ partitaSelezionata.max_players - partitaSelezionata.partecipanti}} / {{ partitaSelezionata.max_players }}</p>
              <p><strong>Organizzatore:</strong> {{ partitaSelezionata.organizer_name }}</p>
              <p><strong>Descrizione:</strong> {{ partitaSelezionata.description || 'Nessuna descrizione disponibile.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TOAST -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 11000">
      <div
        ref="toastEl"
        class="toast align-items-center border-0 fade"  
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div :class="['toast-body', 'rounded-3', 'shadow-lg', toastVariantClass]">
          <strong class="me-2">{{ toastIcon }}</strong> {{ toastMessage }}
        </div>
      </div>
    </div>
    </div>

    <div class="emoji-rain-container" ref="emojiContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getPartite } from '../services/partiteService'
import * as bootstrap from 'bootstrap'
import axios from 'axios'

const nomeUtente = ref('')

const luogoFiltro = ref('')
const sportFiltro = ref('')
const orarioFiltro = ref('')
const dataFiltro = ref('')
const partite = ref([])
const partecipazioniUtente = ref([])
const partitaSelezionata = ref(null)
const userId = localStorage.getItem('userId')
const emojiContainer = ref(null)
const tab = ref('disponibili')

const sportEmojis = {
  'calcio a 5': '⚽',
  'calcio a 11': '⚽',
  'basket': '🏀',
  'beach volley': '🏐',
  'pallavolo': '🏐',
  'racchettoni': '🏓',
  'tennis': '🎾',
  'paddle': '🥎'
}

const postiLiberi = (p) => Math.max(0, (p.max_players ?? 0) - (p.partecipanti ?? 0))
const progressPercent = (p) => {
  const max = p.max_players ?? 0, cur = p.partecipanti ?? 0
  if (!max) return 0
  return Math.min(100, Math.round((cur / max) * 100))
}
const progressBarClass = (p) => {
  const left = postiLiberi(p)
  if (left === 0) return 'bg-danger'     // piena
  if (left <= 2) return 'bg-warning'     // quasi piena
  return 'bg-success'                    // buona disponibilità
}

const partiteCreate = computed(() =>
  partite.value.filter(p => String(p.organizer_id) === String(userId))
)

const partiteDisponibili = computed(() =>
  partite.value.filter(p =>
    String(p.organizer_id) !== String(userId) &&
    postiLiberi(p) > 0
  )
)

const cercaPartite = async () => {
  try {
    const data = await getPartite({
      sport: sportFiltro.value,
      luogo: luogoFiltro.value,
      data: dataFiltro.value,
      ora: orarioFiltro.value
    })

    // Ordina per data e ora crescenti
    partite.value = data.sort((a, b) => {
      const dateA = new Date(a.date_time)
      const dateB = new Date(b.date_time)
      return dateA - dateB
    })
  } catch (err) {
    console.error('Errore nel caricamento delle partite:', err)
  }
}

const pulisciFiltri = async () => {
  sportFiltro.value = ''
  luogoFiltro.value = ''
  dataFiltro.value = ''
  orarioFiltro.value = ''


  document.getElementById('autocomplete-luogo').value = ''

  await cercaPartite()
}

const unisciti = async (eventId, organizerId, sport) => {
  if (!userId) {
    showToast('Devi essere loggato per unirti a una partita.', 'warning', 6000)
    return
  }

  try {
    await axios.post('http://localhost:3000/api/partecipazioni', {
      user_id: userId,
      event_id: eventId
    })
    partecipazioniUtente.value.push(eventId)
    await cercaPartite()

    // Effetto Pioggia emoji
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉')
    showToast('Ti sei unito con successo!', 'success', 5000)
  } catch (err) {
    if (err.response?.status === 409) {
      showToast('Errore durante la registrazione.', 'danger')
    }
  }
}

// --- TOAST state ---
const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success') 

// Icone
const toastIcon = computed(() => {
  switch (toastVariant.value) {
    case 'success': return '✅'
    case 'danger':  return '🛑'
    case 'warning': return '⚠️'
    default:        return 'ℹ️'
  }
})

// Classi di colore (sfondo pieno + testo leggibile)
const toastVariantClass = computed(() => {
  switch (toastVariant.value) {
    case 'success': return 'bg-success text-white'
    case 'danger':  return 'bg-danger text-white'
    case 'warning': return 'bg-warning text-dark'
    default:        return 'bg-info text-white'
  }
})

// Durata più lunga + animazione
function showToast(message, variant = 'success', delayMs = 5000) {
  toastMessage.value = message
  toastVariant.value  = variant
  const t = new bootstrap.Toast(toastEl.value, {
    autohide: true,
    animation: true,
    delay: delayMs   // ⬅️ 5s
  })
  t.show()
}

function lanciaPioggia(emoji) {
  const container = emojiContainer.value
  if (!container) return

  for (let i = 0; i < 30; i++) {
    const el = document.createElement('span')
    el.textContent = emoji
    el.className = 'emoji-fall'
    el.style.left = Math.random() * 100 + 'vw'
    el.style.animationDuration = 2 + Math.random() * 2 + 's'
    container.appendChild(el)

    setTimeout(() => {
      container.removeChild(el)
    }, 4000)
  }
}

const caricaPartecipazioniUtente = async () => {
  try {

    const { data } = await axios.get(`http://localhost:3000/api/partecipazioni/mie/${userId}`)

    partecipazioniUtente.value = data
  } catch (err) {
    console.error('Errore caricamento partecipazioni:', err)
  }
}

const abbandona = async (eventId) => {
  try {

    await axios.delete(`http://localhost:3000/api/partecipazioni`, {

      data: {
        user_id: userId,
        event_id: eventId
      }
    })
    partecipazioniUtente.value = partecipazioniUtente.value.filter(id => id !== eventId)
    showToast('Hai abbandonato la partita.', 'danger', 5000)
    await cercaPartite()
  } catch (err) {
    console.error('Errore durante l\'abbandono:', err)
    showToast('Errore durante l\'abbandono. Riprova più tardi.', 'danger')
  }
}

const apriDettagli = (partita) => {
  partitaSelezionata.value = partita
  const modal = new bootstrap.Modal(document.getElementById('modalDettagli'))
  modal.show()
}

function formatData(datetime) {
  const date = new Date(datetime)
  return date.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

function formatOra(datetime) {
  const date = new Date(datetime)
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getSportIcon(sport) {
  switch (sport.toLowerCase()) {
    case 'calcio a 5':
    case 'calcio a 11':
      return '⚽'
    case 'basket':
      return '🏀'
    case 'beach volley':
    case 'pallavolo':
      return '🏐'
    case 'racchettoni':
      return '🏓'
    case 'tennis':
      return '🎾'
    case 'paddle':
      return '🥎'
    default:
      return '🎯'

  }
}

function getCardClass(sport) {
  switch (sport.toLowerCase()) {
    case 'tennis':
      return 'card-sport-tennis'
    case 'paddle':
      return 'card-sport-paddle'
    case 'racchettoni':
      return 'card-sport-racchettoni'
    case 'calcio a 5':
    case 'calcio a 11':
      return 'card-sport-calcio'
    case 'basket':
      return 'card-sport-basket'
    case 'pallavolo':
      return 'card-sport-volley'
    case 'beach volley':
      return 'card-sport-beach'
    default:
      return ''

  }
}

onMounted(async () => {
  nomeUtente.value = localStorage.getItem('userName') || 'Utente'
  await Promise.all([
    cercaPartite(),
    caricaPartecipazioniUtente()
  ])

  const input = document.getElementById('autocomplete-luogo')

if (window.google && google.maps && google.maps.places) {
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['geocode'],
    componentRestrictions: { country: 'it' }
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    luogoFiltro.value = place.formatted_address || input.value
  })
} else {
  console.warn('Google Maps API non è ancora pronta.')
}
})
</script>
