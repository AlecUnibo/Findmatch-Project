<template>
  <div>
    <div v-if="partite.length">
      <div v-for="partita in partite" :key="partita.id" class="card mb-3">
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
            <button class="btn btn-outline-secondary btn-sm me-2" @click="mostraDettagli(partita)">Dettagli</button>
            <button 
              v-if="isPartitaCreataDaUtente(partita)" 
              class="btn btn-outline-primary btn-sm"
              @click="mostraModifica(partita)">
              Modifica
            </button>
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
                <input type="datetime-local" :value="formatDateTimeLocal(partitaDaModificare.date_time)" @input="partitaDaModificare.date_time = $event.target.value" class="form-control" required />
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

const props = defineProps({
  partite: Array
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
    await axios.put('http://localhost:3000/api/partite/${partitaDaModificare.value.id}', partitaDaModificare.value)
    alert('✅ Partita modificata con successo!')
    location.reload()
  } catch (err) {
    console.error('Errore durante la modifica:', err)
    alert('❌ Errore durante la modifica della partita.')
  }
}

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
  }
}
</script>