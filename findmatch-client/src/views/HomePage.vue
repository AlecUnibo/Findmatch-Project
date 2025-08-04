<template>
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
        <button class="btn btn-success" @click="cercaPartite">Cerca</button>
        <button class="btn btn-outline-danger" @click="pulisciFiltri">Pulisci</button>
      </div>

    </div>

    <!-- Partite trovate -->
    <div class="mb-5">
      <h4 class="mb-3">📅 Partite disponibili</h4>
      <div v-if="partite.length">
        <div v-for="partita in partite" :key="partita.id" class="card mb-3 text-white" :class="getCardClass(partita.sport)">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1"> {{ getSportIcon(partita.sport) }} {{ partita.sport }} </h5>
              <p class="card-text mb-0">
                <strong>Data:</strong> {{ formatData(partita.date_time) }} –
                <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
                <strong>Luogo:</strong> {{ partita.location }}
              </p>
            </div>
            <div class="d-flex gap-2">
<<<<<<< HEAD
              <button class="btn btn-sm btn-outline-primary" @click="apriDettagli(partita)">Dettagli</button>
=======
              <button class="btn btn-sm btn-outline-info" @click="apriDettagli(partita)">Dettagli</button>
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
              <!-- Se sei il creatore -->
              <button class="btn btn-sm btn-secondary" v-if="String(partita.organizer_id) === userId" disabled>
                Creatore
              </button>
              <!-- Se sei già iscritto -->
              <button class="btn btn-sm btn-danger" v-else-if="partecipazioniUtente.includes(partita.id)" @click="abbandona(partita.id)">
                Abbandona
              </button>
              <!-- Se puoi unirti -->
              <button class="btn btn-sm btn-outline-success" v-else @click="unisciti(partita.id, partita.organizer_id)">
                Unisciti
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-muted">Nessuna partita trovata.</div>
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
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
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

const cercaPartite = async () => {
  try {
    const data = await getPartite({
      sport: sportFiltro.value,
      luogo: luogoFiltro.value,
      data: dataFiltro.value,
      ora: orarioFiltro.value
    })
    partite.value = data
  } catch (err) {
    console.error('Errore nel caricamento delle partite:', err)
  }
}

const pulisciFiltri = async () => {
  sportFiltro.value = ''
  luogoFiltro.value = ''
  dataFiltro.value = ''
  orarioFiltro.value = ''
<<<<<<< HEAD

  document.getElementById('autocomplete-luogo').value = ''

  await cercaPartite()
}


=======
  await cercaPartite()
}

>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
const unisciti = async (eventId, organizerId) => {
  if (!userId) {
    alert('Devi essere loggato per unirti a una partita.')
    return
  }

  if (String(userId) === String(organizerId)) {
    alert('❌ Non puoi unirti alla partita, sei il creatore.')
    return
  }

  try {
    await axios.post('http://localhost:3000/api/partecipazioni', {
      user_id: userId,
      event_id: eventId
    })
    partecipazioniUtente.value.push(eventId) // aggiorna localmente
    alert('✅ Ti sei unito con successo alla partita!')
    await cercaPartite()
  } catch (err) {
    if (err.response && err.response.status === 409) {
<<<<<<< HEAD
      alert('⚠️ Sei già iscritto a questa partita.')
=======
      alert('⚠ Sei già iscritto a questa partita.')
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
    } else {
      alert('❌ Errore durante la registrazione. Riprova più tardi.')
      console.error('Errore partecipazione:', err)
    }
  }
}

const caricaPartecipazioniUtente = async () => {
  try {
<<<<<<< HEAD
    const { data } = await axios.get(`http://localhost:3000/api/partecipazioni/mie/${userId}`)
=======
    const { data } = await axios.get('http://localhost:3000/api/partecipazioni/mie/${userId}')
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
    partecipazioniUtente.value = data
  } catch (err) {
    console.error('Errore caricamento partecipazioni:', err)
  }
}

const abbandona = async (eventId) => {
  try {
<<<<<<< HEAD
    await axios.delete(`http://localhost:3000/api/partecipazioni`, {
=======
    await axios.delete('http://localhost:3000/api/partecipazioni', {
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
      data: {
        user_id: userId,
        event_id: eventId
      }
    })
    partecipazioniUtente.value = partecipazioniUtente.value.filter(id => id !== eventId)
    alert('🚫 Hai abbandonato la partita.')
    await cercaPartite()
  } catch (err) {
    console.error('Errore durante l\'abbandono:', err)
    alert('❌ Errore durante l\'abbandono. Riprova più tardi.')
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
<<<<<<< HEAD
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
=======
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
  }
}

onMounted(async () => {
  nomeUtente.value = localStorage.getItem('userName') || 'Utente'
  await Promise.all([
    cercaPartite(),
    caricaPartecipazioniUtente()
  ])
<<<<<<< HEAD

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

<style scoped>
.card[class*='card-sport-'] {
  position: relative;
  overflow: hidden;
  background-color: transparent;
}

.card[class*='card-sport-']::before {
  content: '';
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: normal;
  z-index: 0;
}

.card .card-body {
  position: relative;
  z-index: 1;
}

/* Sfondo sfumato per tennis/paddle */
.card-sport-tennis::before {
  background-image:
    url('/public/images/tennis-mask.png');
}

.card-sport-paddle::before {
  background-image:
    url('/public/images/paddle-mask.png');
}

.card-sport-racchettoni::before {
  background-image:
    url('/public/images/racchettoni-mask.png');
}
/* Sfondo sfumato per calcio */
.card-sport-calcio::before {
  background-image:
    url('/public/images/calcio-mask.png');
}

/* Sfondo sfumato per basket */
.card-sport-basket::before {
  background-image:
    url('/public/images/basket-mask.png');
}

/* Sfondo sfumato per pallavolo */
.card-sport-volley::before {
  background-image:
    url('/public/images/pallavolo-mask.png');
}

.card-sport-beach::before {
  background-image:
    url('/public/images/beach-mask.png');
}

</style>
=======

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
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
