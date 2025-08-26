<template>
  <div class="component-partite">
    <div v-if="lista.length">
      <div
        v-for="partita in lista"
        :key="partita.id"
        class="card mb-3 text-white"
        :class="getCardClass(partita.sport)"
      >
        <div class="card-body d-flex justify-content-between align-items-center">
          <div class="me-3 flex-grow-1">
            <h5 class="card-title mb-1">
              {{ getSportIcon(partita.sport) }} {{ partita.sport }}
            </h5>

            <p class="card-text mb-0">
              <strong>Data:</strong> {{ formatData(partita.date_time) }} –
              <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
              <strong>Luogo:</strong> {{ partita.location }}
            </p>

            <!-- Stato posti: badge + barra avanzamento -->
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
                   :aria-valuenow="Number(partita.partecipanti) || 0"
                   :aria-valuemin="0"
                   :aria-valuemax="Number(partita.max_players) || 0">
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center">
            <button
              class="btn btn-primary btn-sm me-2"
              @click="mostraDettagli(partita)"
            >
              Dettagli
            </button>

            <!-- Azioni per "Create da te" -->
            <template v-if="isPartitaCreataDaUtente(partita)">
              <button class="btn btn-warning btn-sm me-2" @click="mostraModifica(partita)">Modifica</button>
              <button class="btn btn-danger btn-sm me-2" @click="chiediConfermaElimina(partita.id)">Elimina</button>
            </template>

            <!-- Azione per sezione "A cui sei iscritto" -->
            <button
              v-if="props.sezione === 'iscritto'"
              class="btn btn-danger btn-sm me-2"
              @click="chiediConfermaAbbandona(partita.id)"
            >
              Abbandona
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
                <input
                  type="datetime-local"
                  :value="formatDateTimeLocal(partitaDaModificare.date_time)"
                  @input="partitaDaModificare.date_time = $event.target.value"
                  :min="minDateTime"
                  class="form-control"
                  required
                />
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

    <!-- MODALE CONFERMA ELIMINAZIONE -->
    <div class="modal fade" id="modalConfermaElimina" tabindex="-1" aria-labelledby="modalConfermaEliminaLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="modalConfermaEliminaLabel">Eliminare la partita?</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Questa azione è <strong>definitiva</strong> e non può essere annullata.</p>
            <small class="text-muted">La partita non sarà più visibile agli altri utenti.</small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="eliminando">
              Annulla
            </button>
            <button type="button" class="btn btn-danger" @click="confermaEliminazione" :disabled="eliminando">
              <span v-if="eliminando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Elimina definitivamente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALE CONFERMA ABBANDONO -->
    <div class="modal fade" id="modalConfermaAbbandono" tabindex="-1" aria-labelledby="modalConfermaAbbandonoLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header bg-danger text-dark">
            <h5 class="modal-title" id="modalConfermaAbbandonoLabel">Abbandonare la partita?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Se abbandoni perderai il tuo posto in questa partita.</p>
            <small class="text-muted">L’azione è immediata.</small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="abbandonando">
              Annulla
            </button>
            <button type="button" class="btn btn-danger text-dark" @click="confermaAbbandono" :disabled="abbandonando">
              <span v-if="abbandonando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Abbandona
            </button>
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import * as bootstrap from 'bootstrap'
import axios from 'axios'

const props = defineProps({
  partite: Array,
  sezione: String,               // 'mie' | 'iscritto' | altro
  fetchEventoById: Function      // opzionale: (id) => Promise<eventoFresh>
})

const userId = localStorage.getItem('userId')

// Filtra in base alla sezione: nella sezione "iscritto" escludi quelle create da me
function filterBySection(arr = []) {
  if (props.sezione === 'iscritto') {
    return arr.filter(p => String(p.organizer_id) !== String(userId))
  }
  return arr
}

// Emits verso il parent
const emit = defineEmits(['partita-aggiornata', 'partita-eliminata', 'partita-abbandonata'])

// Lista locale reattiva (clonata da props)
const lista = ref(filterBySection(props.partite ?? []))
watch(() => props.partite, (nv) => {
  lista.value = filterBySection(nv ?? [])
  if (typeof props.fetchEventoById === 'function') {
    syncAllCounts().catch(() => {})
  }
}, { deep: true })


const minDateTime = computed(() => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
})

const partitaSelezionata = ref(null)
const partitaDaModificare = ref(null)

// ---- Utility posti / progress
const postiLiberi = (p) => Math.max(0, (Number(p.max_players) || 0) - (Number(p.partecipanti) || 0))
const progressPercent = (p) => {
  const max = Number(p.max_players) || 0
  const cur = Number(p.partecipanti) || 0
  if (!max) return 0
  return Math.min(100, Math.round((cur / max) * 100))
}
const progressBarClass = (p) => {
  const left = postiLiberi(p)
  if (left === 0) return 'bg-danger'
  if (left <= 2) return 'bg-warning'
  return 'bg-success'
}

// ✅ aggiorna contatore localmente
function updatePartecipantiLocal(id, delta) {
  const i = lista.value.findIndex(p => p.id === id)
  if (i !== -1) {
    const cur = Number(lista.value[i].partecipanti) || 0
    lista.value[i] = { ...lista.value[i], partecipanti: Math.max(0, cur + delta) }
  }
  if (partitaSelezionata.value?.id === id) {
    const cur = Number(partitaSelezionata.value.partecipanti) || 0
    partitaSelezionata.value = { ...partitaSelezionata.value, partecipanti: Math.max(0, cur + delta) }
  }
}

// ---- (OPZIONALE) Sync fresh dei conteggi dal server tramite funzione passata dal parent
async function syncEvento(id) {
  if (typeof props.fetchEventoById !== 'function') return
  try {
    const fresh = await props.fetchEventoById(id)   // il parent decide l'endpoint
    if (!fresh) return
    const idx = lista.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      lista.value[idx] = { ...lista.value[idx], ...fresh }
      if (partitaSelezionata.value?.id === id) {
        partitaSelezionata.value = { ...lista.value[idx] }
      }
    }
  } catch (e) {
    // silenzioso: se fallisce non vogliamo errori in console
  }
}
async function syncAllCounts() {
  const ids = lista.value.map(p => p.id)
  await Promise.all(ids.map(syncEvento))
}

// ---- Modali
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

// ---- Azioni
async function salvaModifiche() {
  try {
    const id = partitaDaModificare.value.id
    const payload = { ...partitaDaModificare.value }

    const { data: updated } = await axios.put(`http://localhost:3000/api/partite/${id}`, payload)

    const idx = lista.value.findIndex(p => p.id === id)
    const nuovo = updated ?? payload
    if (idx !== -1) {
      lista.value[idx] = { ...lista.value[idx], ...nuovo }
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalModifica'))
    modal?.hide()

    if (partitaSelezionata.value?.id === id) {
      partitaSelezionata.value = { ...lista.value[idx] }
    }

    emit('partita-aggiornata', { id, updated: lista.value[idx] })
    showToast('Partita modificata con successo! ✏️', 'warning', 5000)

    // sync fresh se disponibile (es. se il backend ricalcola i partecipanti)
    syncEvento(id)
  } catch (err) {
    console.error('Errore durante la modifica:', err)
    showToast('Errore durante la modifica della partita.', 'danger', 5000)
  }
}

const idDaEliminare = ref(null)
const eliminando = ref(false)

function chiediConfermaElimina(id) {
  idDaEliminare.value = id
  const modal = new bootstrap.Modal(document.getElementById('modalConfermaElimina'))
  modal.show()
}

async function confermaEliminazione() {
  if (!idDaEliminare.value) return
  eliminando.value = true
  const modalEl = document.getElementById('modalConfermaElimina')
  try {
    // Invia l'ID dell'utente nel body della DELETE (come facevi già)
    await axios.delete(`http://localhost:3000/api/partite/${idDaEliminare.value}`, {
      data: { userId: userId }
    })
    // aggiorna lista e UI
    lista.value = lista.value.filter(p => p.id !== idDaEliminare.value)
    emit('partita-eliminata', idDaEliminare.value)

    // chiudi modale
    bootstrap.Modal.getInstance(modalEl)?.hide()

    showToast('Partita eliminata con successo!', 'danger', 5000)
  } catch (err) {
    console.error('Errore eliminazione partita:', err)
    showToast('Errore durante l\'eliminazione della partita.', 'danger', 5000)
  } finally {
    eliminando.value = false
    idDaEliminare.value = null
  }
}


const idDaAbbandonare = ref(null)
const abbandonando = ref(false)

function chiediConfermaAbbandona(id) {
  idDaAbbandonare.value = id
  const modal = new bootstrap.Modal(document.getElementById('modalConfermaAbbandono'))
  modal.show()
}

async function confermaAbbandono() {
  if (!idDaAbbandonare.value) return
  abbandonando.value = true
  const modalEl = document.getElementById('modalConfermaAbbandono')
  try {
    await axios.delete(`http://localhost:3000/api/partecipazioni`, {
      data: { user_id: userId, event_id: idDaAbbandonare.value }
    })

    if (props.sezione === 'iscritto') {
      lista.value = lista.value.filter(p => p.id !== idDaAbbandonare.value)
      emit('partita-abbandonata', idDaAbbandonare.value)
    } else {
      updatePartecipantiLocal(idDaAbbandonare.value, -1)
    }

    bootstrap.Modal.getInstance(modalEl)?.hide()
    showToast('Hai abbandonato la partita.', 'danger', 5000)

    syncEvento(idDaAbbandonare.value)
  } catch (err) {
    console.error("Errore durante l'abbandono:", err)
    showToast('Errore durante l\'abbandono. Riprova più tardi.', 'danger')
  } finally {
    abbandonando.value = false
    idDaAbbandonare.value = null
  }
}

async function abbandona(eventId) {
  try {
    await axios.delete(`http://localhost:3000/api/partecipazioni`, {
      data: { user_id: userId, event_id: eventId }
    })

    if (props.sezione === 'iscritto') {
      // rimuovo dalla vista "iscritto"
      lista.value = lista.value.filter(p => p.id !== eventId)
      emit('partita-abbandonata', eventId)
    } else {
      // altrimenti aggiorno solo il contatore locale
      updatePartecipantiLocal(eventId, -1)
    }

    showToast('Hai abbandonato la partita.', 'danger', 5000)

    // sync fresh se il parent ce la fornisce
    syncEvento(eventId)
  } catch (err) {
    console.error("Errore durante l'abbandono:", err)
    showToast('Errore durante l\'abbandono. Riprova più tardi.', 'danger', 5000)
  }
}

// ---- Toast
const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success')

const toastIcon = computed(() => {
  switch (toastVariant.value) {
    case 'success': return '✅'
    case 'danger':  return '🛑'
    case 'warning': return '⚠️'
    default:        return 'ℹ️'
  }
})
const toastVariantClass = computed(() => {
  switch (toastVariant.value) {
    case 'success': return 'bg-success text-white'
    case 'danger':  return 'bg-danger text-white'
    case 'warning': return 'bg-warning text-dark'
    default:        return 'bg-info text-white'
  }
})
function showToast(message, variant = 'success', delayMs = 5000, afterHide = null) {
  toastMessage.value = message
  toastVariant.value = variant
  const el = toastEl.value
  const t = new bootstrap.Toast(el, { autohide: true, animation: true, delay: delayMs })
  const handler = () => {
    el.removeEventListener('hidden.bs.toast', handler)
    if (typeof afterHide === 'function') afterHide()
  }
  el.addEventListener('hidden.bs.toast', handler)
  t.show()
}

// ---- Utils
function isPartitaCreataDaUtente(partita) {
  return String(partita.organizer_id) === String(userId)
}
function formatData(datetime) {
  const date = new Date(datetime)
  return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatOra(datetime) {
  const date = new Date(datetime)
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}
function formatDateTimeLocal(datetime) {
  const date = new Date(datetime)
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}
function getSportIcon(sport) {
  switch (String(sport).toLowerCase()) {
    case 'calcio a 5':
    case 'calcio a 11': return '⚽'
    case 'basket': return '🏀'
    case 'beach volley':
    case 'pallavolo': return '🏐'
    case 'racchettoni': return '🏓'
    case 'tennis': return '🎾'
    case 'paddle': return '🥎'
    default: return '🎯'
  }
}
function getCardClass(sport) {
  switch (String(sport).toLowerCase()) {
    case 'tennis': return 'card-sport-tennis'
    case 'paddle': return 'card-sport-paddle'
    case 'racchettoni': return 'card-sport-racchettoni'
    case 'calcio a 5':
    case 'calcio a 11': return 'card-sport-calcio'
    case 'basket': return 'card-sport-basket'
    case 'pallavolo': return 'card-sport-volley'
    case 'beach volley': return 'card-sport-beach'
    default: return ''
  }
}
</script>
