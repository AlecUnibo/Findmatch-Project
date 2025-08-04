<template>
  <div>
    <div v-if="partite.length">
<<<<<<< HEAD
      <div v-for="partita in partite" :key="partita.id" class="card mb-3 text-white" :class="getCardClass(partita.sport)">
=======
      <div v-for="partita in partite" :key="partita.id" class="card mb-3">
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="card-title mb-1">
              {{ getSportIcon(partita.sport) }} {{ partita.sport }}
            </h5>
            <p class="card-text mb-0">
              <strong>Data:</strong> {{ formatData(partita.date_time) }} –
              <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
              <strong>Luogo:</strong> {{ partita.location }}
            </p>
          </div>
          <div>
<<<<<<< HEAD
            <button 
              class="btn btn-outline-primary btn-sm me-2" 
              @click="mostraDettagli(partita)">
              Dettagli
            </button>
            <button 
              v-if="isPartitaCreataDaUtente(partita)" 
              class="btn btn-warning btn-sm me-2"
              @click="mostraModifica(partita)">
              Modifica
            </button>
            <button
              v-if="isPartitaCreataDaUtente(partita)" 
              class="btn btn-outline-danger btn-sm me-2"
              @click="eliminaPartita(partita.id)">
              Elimina
            </button>
            <button
              v-if="props.sezione === 'iscritto'"
              class="btn btn-outline-danger btn-sm me-2"
              @click="abbandona(partita.id)">
              Abbandona
            </button>
=======
            <button class="btn btn-outline-secondary btn-sm me-2" @click="mostraDettagli(partita)">Dettagli</button>
            <button 
              v-if="isPartitaCreataDaUtente(partita)" 
              class="btn btn-outline-primary btn-sm"
              @click="mostraModifica(partita)">
              Modifica
            </button>
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-muted">Nessuna partita in questa sezione.</div>

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
            <p><strong>Posti massimi:</strong> {{ partitaSelezionata.max_players }}</p>
            <p><strong>Descrizione:</strong> {{ partitaSelezionata.description || 'Nessuna descrizione.' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALE MODIFICA -->
    <div class="modal fade" id="modalModifica" tabindex="-1" aria-labelledby="modalModificaLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalModificaLabel">Modifica Partita</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body" v-if="partitaDaModificare">
            <form @submit.prevent="salvaModifiche">
              <div class="mb-3">
                <label class="form-label">Sport</label>
                <input v-model="partitaDaModificare.sport" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Luogo</label>
                <input v-model="partitaDaModificare.location" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Data e Ora</label>
<<<<<<< HEAD
                <input
                  type="datetime-local"
                  :value="formatDateTimeLocal(partitaDaModificare.date_time)"
                  @input="partitaDaModificare.date_time = $event.target.value"
                  :min="minDateTime"
                  class="form-control"
                  required
                />
=======
                <input type="datetime-local" :value="formatDateTimeLocal(partitaDaModificare.date_time)" @input="partitaDaModificare.date_time = $event.target.value" class="form-control" required />
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
              </div>
              <div class="mb-3">
                <label class="form-label">Posti Massimi</label>
                <input type="number" v-model="partitaDaModificare.max_players" class="form-control" required min="1" />
              </div>
              <div class="mb-3">
                <label class="form-label">Descrizione</label>
                <textarea v-model="partitaDaModificare.description" class="form-control"></textarea>
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
import { ref } from 'vue'
import * as bootstrap from 'bootstrap'
import axios from 'axios'
<<<<<<< HEAD
import { computed } from 'vue'

const props = defineProps({
  partite: Array,
  sezione: String
})

const minDateTime = computed(() => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
=======

const props = defineProps({
  partite: Array
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
})

const partitaSelezionata = ref(null)
const partitaDaModificare = ref(null)
const userId = localStorage.getItem('userId')

function mostraDettagli(partita) {
  partitaSelezionata.value = partita
  const modal = new bootstrap.Modal(document.getElementById('modalDettagli'))
  modal.show()
}

function mostraModifica(partita) {
  partitaDaModificare.value = { ...partita } 
  const modal = new bootstrap.Modal(document.getElementById('modalModifica'))
  modal.show()
}

async function salvaModifiche() {
  try {
<<<<<<< HEAD
    await axios.put(`http://localhost:3000/api/partite/${partitaDaModificare.value.id}`, partitaDaModificare.value)
=======
    await axios.put('http://localhost:3000/api/partite/${partitaDaModificare.value.id}', partitaDaModificare.value)
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
    alert('✅ Partita modificata con successo!')
    location.reload()
  } catch (err) {
    console.error('Errore durante la modifica:', err)
    alert('❌ Errore durante la modifica della partita.')
  }
}

<<<<<<< HEAD
async function eliminaPartita(partitaId) {
  if (!confirm('Sei sicuro di voler eliminare questa partita?')) return

  try {
    await axios.delete(`http://localhost:3000/api/partecipazioni/${partitaId}`)
    alert('✅ Partita eliminata con successo!')
    location.reload()
  } catch (err) {
    console.error('Errore eliminazione partita:', err)
    alert('❌ Errore durante l\'eliminazione della partita.')
  }
}

async function abbandona(eventId) {
  try {
    await axios.delete(`http://localhost:3000/api/partecipazioni`, {
      data: {
        user_id: userId,
        event_id: eventId
      }
    })
    alert('🚫 Hai abbandonato la partita.')
    location.reload()  // o meglio: emetti un evento per aggiornare la lista localmente
  } catch (err) {
    console.error("Errore durante l'abbandono:", err)
    alert('❌ Errore durante l\'abbandono. Riprova più tardi.')
  }
}

=======
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
function isPartitaCreataDaUtente(partita) {
  return partita.organizer_id == userId
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

function formatDateTimeLocal(datetime) {
  const date = new Date(datetime)
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
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
  }
}
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
  }
}
</script>
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
