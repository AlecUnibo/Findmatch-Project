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
        <input type="text" v-model="luogoFiltro" class="form-control" placeholder="Cerca luogo" />
      </div>

      <div class="col-md-3">
        <input type="text" v-model="sportFiltro" class="form-control" placeholder="Cerca sport" />
      </div>

      <div class="col-md-2">
        <input type="date" v-model="dataFiltro" class="form-control" />
      </div>

      <div class="col-md-2">
        <input type="time" v-model="orarioFiltro" class="form-control" />
      </div>

      <div class="col-auto">
        <button class="btn btn-success" @click="cercaPartite">Cerca</button>
      </div>
    </div>

    <!-- Partite trovate -->
    <div class="mb-5">
      <h4 class="mb-3">📅 Partite disponibili</h4>
      <div v-if="partite.length">
        <div v-for="partita in partite" :key="partita.id" class="card mb-3">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">{{ partita.sport }}</h5>
              <p class="card-text mb-0">
                <strong>Data:</strong> {{ formatData(partita.date_time) }} –
                <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
                <strong>Luogo:</strong> {{ partita.location }}
              </p>
            </div>
            <button class="btn btn-sm btn-outline-secondary" @click="apriDettagli(partita)">Dettagli</button>
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
            <p><strong>Posti massimi:</strong> {{ partitaSelezionata.max_players }}</p>
            <p><strong>Organizzatore:</strong> {{ partitaSelezionata.organizer_id }}</p>
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

const nomeUtente = ref('')

const luogoFiltro = ref('')
const sportFiltro = ref('')
const orarioFiltro = ref('')
const dataFiltro = ref('')
const partite = ref([])
const partitaSelezionata = ref(null)

const formattaData = (isoDate) => {
  return new Date(isoDate).toLocaleDateString()
}


const cercaPartite = async () => {
  const termine = [sportFiltro.value, luogoFiltro.value].filter(Boolean).join(' ')
  try {
    const data = await getPartite(termine, dataFiltro.value, orarioFiltro.value)
    partite.value = data
  } catch (err) {
    console.error('Errore nel caricamento delle partite:', err)
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


onMounted(async () => {
  nomeUtente.value = localStorage.getItem('userName') || 'Utente'
  const oggi = new Date().toISOString().split('T')[0]
  dataFiltro.value = oggi
  await cercaPartite()
})
</script>

