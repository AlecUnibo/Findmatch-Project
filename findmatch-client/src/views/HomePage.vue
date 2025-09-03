<template>
  <div class="component-home">
    <div class="container mt-5">
      <!-- Benvenuto -->
      <div class="text-center mb-4">
        <h2>Benvenuto, {{ nomeUtente }}! 👋</h2>
        <p class="text-muted">Trova o unisciti alla tua prossima partita!</p>
      </div>

      <!-- Ricerca -->
      <HomeSearchBar
        :luogo="luogoFiltro"
        :sport="sportFiltro"
        :data="dataFiltro"
        :ora="orarioFiltro"
        @update:luogo="val => luogoFiltro = val"
        @update:sport="val => sportFiltro = val"
        @update:data="val => dataFiltro = val"
        @update:ora="val => orarioFiltro = val"
        @cerca="cercaPartite"
        @pulisci="pulisciFiltri"
      />

      <!-- Tabs -->
      <ul class="nav nav-pills justify-content-center mb-4 custom-pills">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: tab==='disponibili' }"
            @click="tab='disponibili'"
            aria-label="Mostra partite disponibili"
          >
            Disponibili
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: tab==='mie' }"
            @click="tab='mie'"
            aria-label="Mostra partite create da te"
          >
            Create da te
          </button>
        </li>
      </ul>

      <!-- Contenuto tab + micro transizione tra set risultati -->
      <Transition name="fade-blur" mode="out-in">
        <div :key="tab + '-' + resultsVersion">
          <!-- Partite disponibili -->
          <div class="mb-5" v-if="tab==='disponibili'">
            <PartiteListSection
              titolo="Partite disponibili"
              :partite="partiteDisponibili"
              :perPage="8"
              :showJoin="true"
              :getCardClass="getCardClass"
              :getSportIcon="getSportIcon"
              :formatData="formatData"
              :formatOra="formatOra"
              :postiLiberi="postiLiberi"
              :progressPercent="progressPercent"
              :progressBarClass="progressBarClass"
              :progressMax="progressMax"
              :isCalcio="isCalcio"
              :roleEntries="roleEntries"
              :ruoloLabel="ruoloLabel"
              @dettagli="apriDettagli"
              @unisciti="p => chiediUniscitiConControllo(p)"
              @uniscitiCalcio="({ partita, roleKey }) => chiediUniscitiCalcioConControllo(partita, roleKey)"
            />
          </div>

          <!-- Create da te -->
          <div class="mb-5" v-else>
            <PartiteListSection
              titolo="Create da te"
              :partite="partiteCreate"
              :perPage="8"
              :showJoin="false"
              :showManage="true"
              :getCardClass="getCardClass"
              :getSportIcon="getSportIcon"
              :formatData="formatData"
              :formatOra="formatOra"
              :postiLiberi="postiLiberi"
              :progressPercent="progressPercent"
              :progressBarClass="progressBarClass"
              :progressMax="progressMax"
              :isCalcio="isCalcio"
              :roleEntries="roleEntries"
              :ruoloLabel="ruoloLabel"
              @dettagli="apriDettagli"
              @modifica="apriModifica"
              @elimina="chiediElimina"
            />
          </div>
        </div>
      </Transition>

      <!-- MODALE DETTAGLI -->
      <teleport to="body">
      <div class="modal fade fm-modal" id="modalDettagli" tabindex="-1" aria-labelledby="modalDettagliLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-info text-white">
              <h5 class="modal-title" id="modalDettagliLabel">Dettagli partita</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Chiudi"></button>
            </div>

            <div class="modal-body" v-if="partitaSelezionata">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Sport</label>
                  <input type="text" class="form-control" :value="partitaSelezionata.sport" disabled />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Organizzatore</label>
                  <input type="text" class="form-control" :value="partitaSelezionata.organizer_name" disabled />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Data</label>
                  <input type="text" class="form-control" :value="formatData(partitaSelezionata.date_time)" disabled />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ora</label>
                  <input type="text" class="form-control" :value="formatOra(partitaSelezionata.date_time)" disabled />
                </div>

                <div class="col-12">
                  <label class="form-label">Luogo</label>
                  <input type="text" class="form-control" :value="partitaSelezionata.location" disabled />
                </div>

                <!-- NON calcio: posti -->
                <div class="col-12" v-if="!isCalcio(partitaSelezionata)">
                  <label class="form-label">Posti rimanenti</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="`${postiLiberi(partitaSelezionata)} / ${(partitaSelezionata.max_players ?? 0)}`"
                    disabled
                  />
                </div>

                <!-- Calcio: ruoli -->
                <div class="col-12" v-else>
                  <label class="form-label">Ruoli mancanti</label>
                  <div class="row g-2">
                    <div class="col-md-3" v-for="r in roleEntries(partitaSelezionata)" :key="r.key">
                      <div class="input-group">
                        <span class="input-group-text">{{ ruoloLabel(r.key) }}</span>
                        <input type="text" class="form-control" :value="r.count" disabled />
                      </div>
                    </div>
                  </div>
                  <small class="text-muted d-block mt-1">
                    Totale ruoli richiesti: {{ sumRolesNeeded(partitaSelezionata) }}
                  </small>
                </div>

                <div class="col-12">
                  <label class="form-label">Descrizione</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    :value="partitaSelezionata.description || 'Nessuna descrizione disponibile.'"
                    disabled
                  ></textarea>
                </div>
              </div>

              <hr class="my-4" />

              <h6 class="mb-2">Invita un utente</h6>
              <div class="input-group">
                <input
                  type="text"
                  v-model="searchUserQuery"
                  @input="searchUsersForInvite"
                  class="form-control"
                  placeholder="Cerca utente da invitare..."
                  aria-label="Cerca utente da invitare"
                />
                <button
                  class="btn text-white border-0 bg-info"
                  type="button"
                  @click="sendInvite"
                  :disabled="!selectedUserToInvite"
                  aria-label="Invita utente selezionato"
                >
                  Invita
                </button>
              </div>

              <ul v-if="userSearchResults.length" class="list-group mt-2">
                <li
                  v-for="user in userSearchResults"
                  :key="user.id"
                  @click="selectUserToInvite(user)"
                  @keydown.enter="selectUserToInvite(user)"
                  class="list-group-item list-group-item-action"
                  role="button"
                  tabindex="0"
                  :aria-label="`Seleziona ${user.username} per invito`"
                >
                  {{ user.username }}
                </li>
              </ul>
            </div>

            <div class="modal-footer">
            </div>
          </div>
        </div>
      </div>
      </teleport>


      <!-- Modale conferma -->
      <teleport to="body">
      <div class="modal fade" id="modalConferma" tabindex="-1" aria-labelledby="modalConfermaLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" :class="confirmHeaderClass">
              <h5 class="modal-title" id="modalConfermaLabel">{{ confirmTitle }}</h5>
            </div>
            <div class="modal-body">
              <p class="mb-2" v-html="confirmMessage"></p>
              <small v-if="confirmSubMessage" class="text-muted" v-html="confirmSubMessage"></small>
            </div>
            <div class="modal-footer">
              <!-- CANCEL: ora sfondo rosso e testo nero -->
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="confirmBusy" aria-label="Annulla conferma">
                Annulla
              </button>
              <button type="button" class="btn" :class="confirmCtaClass" @click="doConfirm" :disabled="confirmBusy" :aria-label="confirmCtaText">
                <span v-if="confirmBusy" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ confirmCtaText }}
              </button>
            </div>
          </div>
        </div>
      </div>
      </teleport>

<!-- MODALE MODIFICA PARTITA -->
  <teleport to="body">
    <div class="modal fade fm-modal" id="modalModifica" tabindex="-1" aria-labelledby="modalModificaLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title" id="modalModificaLabel">Modifica partita</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>

          <form @submit.prevent="salvaModifiche">
            <div class="modal-body">
              <div class="row g-3">
                <!-- Sport (editable) -->
                <div class="col-md-6">
                  <label class="form-label">Sport</label>
                  <input type="text" class="form-control" :value="editForm.sport" disabled />
                </div>

                <!-- Luogo -->
                <div class="col-md-6">
                  <label class="form-label">Luogo</label>
                  <input v-model="editForm.location" type="text" class="form-control" placeholder="Via, città..." required />
                </div>

                <!-- Data -->
                <div class="col-md-6">
                  <label class="form-label">Data</label>
                  <input v-model="editForm.date" type="date" class="form-control" required />
                </div>

                <!-- Ora -->
                <div class="col-md-6">
                  <label class="form-label">Ora</label>
                  <input v-model="editForm.time" type="time" class="form-control" required />
                </div>

                <!-- Se NON è calcio: numero giocatori -->
                <div class="col-md-6" v-if="!isEditCalcio">
                  <label class="form-label">Numero giocatori</label>
                  <input v-model.number="editForm.max_players" type="number" min="1" class="form-control" required />
                </div>

                <!-- Se è calcio a 5: ruoli -->
                <div class="col-12" v-if="editForm.sport.toLowerCase() === 'calcio a 5'">
                  <label class="form-label">Ruoli (Calcio a 5)</label>
                  <div class="row g-2">
                    <div class="col-md-4">
                      <div class="input-group">
                        <span class="input-group-text">Portiere</span>
                        <input v-model.number="editForm.roles_needed.portiere" type="number" min="0" class="form-control" />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="input-group">
                        <span class="input-group-text">All-around</span>
                        <input v-model.number="editForm.roles_needed.all_around" type="number" min="0" class="form-control" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Se è calcio a 11: ruoli -->
                <div class="col-12" v-if="editForm.sport.toLowerCase() === 'calcio a 11'">
                  <label class="form-label">Ruoli (Calcio a 11)</label>
                  <div class="row g-2">
                    <div class="col-md-3">
                      <div class="input-group">
                        <span class="input-group-text">Portiere</span>
                        <input v-model.number="editForm.roles_needed.portiere" type="number" min="0" class="form-control" />
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="input-group">
                        <span class="input-group-text">Difensore</span>
                        <input v-model.number="editForm.roles_needed.difensore" type="number" min="0" class="form-control" />
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="input-group">
                        <span class="input-group-text">Centroc.</span>
                        <input v-model.number="editForm.roles_needed.centrocampista" type="number" min="0" class="form-control" />
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="input-group">
                        <span class="input-group-text">Attaccante</span>
                        <input v-model.number="editForm.roles_needed.attaccante" type="number" min="0" class="form-control" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Descrizione -->
                <div class="col-12">
                  <label class="form-label">Descrizione</label>
                  <textarea v-model="editForm.description" rows="3" class="form-control" placeholder="Dettagli utili..."></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Annulla modifica">Annulla</button>
              <button type="submit" class="btn btn-success" :disabled="savingEdit" aria-label="Salva modifiche">
                <span v-if="savingEdit" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Salva modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </teleport>

      <!-- TOAST -->
      <div class="toast-container position-fixed bottom-0 end-0 p-3">
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
    
    <div
      class="join-banner"
      v-show="showJoinBanner"
      :class="{ 'is-animating': joinBannerAnimating }"
      aria-hidden="true"
    >
      Ci vediamo in campo
    </div>
  </div>
</template>

<script setup>
/* (script unchanged) */
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as bootstrap from 'bootstrap'
import axios from 'axios'

import HomeSearchBar from '@/components/HomeSearchBar.vue'
import PartiteListSection from '@/components/PartiteListSection.vue'
import { getPartite, getPartitaById } from '../services/partiteService'

const route = useRoute()
const isSearching = ref(false)
const resultsVersion = ref(0)

// Stato base
const nomeUtente = ref('')
const luogoFiltro = ref('')
const sportFiltro = ref('')
const orarioFiltro = ref('')
const dataFiltro = ref('')

const partite = ref([])
const partecipazioniUtente = ref([])           // solo ID
const partecipazioniUtenteDetails = ref([])    // oggetti partita (per controllo ±2h)

const partitaSelezionata = ref(null)
const userId = localStorage.getItem('userId')
const emojiContainer = ref(null)
const tab = ref('disponibili')

// Inviti
const searchUserQuery = ref('')
const userSearchResults = ref([])
const selectedUserToInvite = ref(null)

// Modale conferma
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmSubMessage = ref('')
const confirmCtaText = ref('Conferma')
const confirmCtaClass = ref('btn-primary')
const confirmHeaderClass = ref('bg-primary text-white')
const confirmBusy = ref(false)
let confirmOnOk = null

// --- Stato MODIFICA ---
const editForm = ref({
  id: null,
  sport: '',
  location: '',
  date: '',
  time: '',
  max_players: 0,
  roles_needed: {},
  description: '',
})
const savingEdit = ref(false)
const isEditCalcio = computed(() => {
  const s = (editForm.value.sport || '').toLowerCase()
  return s === 'calcio a 5' || s === 'calcio a 11'
})

// Utility: combina data+ora in stringa ISO-like per backend
function combineDateTime(dateStr, timeStr) {
  // backend friendly: "YYYY-MM-DD HH:mm:00"
  return `${dateStr} ${timeStr}:00`
}

function normalizeRoles(sport, roles = {}) {
  const s = (sport || '').toLowerCase()
  if (s === 'calcio a 5') {
    return {
      portiere: Number(roles.portiere ?? 0),
      all_around: Number(roles.all_around ?? 0),
    }
  }
  if (s === 'calcio a 11') {
    return {
      portiere: Number(roles.portiere ?? 0),
      difensore: Number(roles.difensore ?? 0),
      centrocampista: Number(roles.centrocampista ?? 0),
      attaccante: Number(roles.attaccante ?? 0),
    }
  }
  return {}
}

// --- Emoji
const sportEmojis = {
  'calcio a 5': '⚽', 'calcio a 11': '⚽', 'basket': '🏀',
  'beach volley': '🏐', 'pallavolo': '🏐', 'racchettoni': '🏓',
  'tennis': '🎾', 'paddle': '🥎'
}

// --- Helpers posti/progress
const postiLiberi = (p) => (isCalcio(p) ? sumRolesNeeded(p) : Math.max(0, (p.max_players ?? 0) - (p.partecipanti ?? 0)))
const progressMax = (p) => (isCalcio(p) ? (p.partecipanti ?? 0) + sumRolesNeeded(p) : (p.max_players ?? 0))
const progressPercent = (p) => {
  const max = progressMax(p); const cur = p.partecipanti ?? 0
  if (!max) return 0
  return Math.min(100, Math.round((cur / max) * 100))
}
const progressBarClass = (p) => {
  const left = postiLiberi(p)
  if (left === 0) return 'bg-danger'
  if (left <= 2) return 'bg-warning'
  return 'bg-success'
}

// Iscrizioni
const isIscritto = (eventId) => partecipazioniUtente.value.some(id => String(id) === String(eventId))

// Filtri per liste
const startOfToday = computed(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
const isTodayOrFuture = (dt) => new Date(dt) >= startOfToday.value

const partiteCreate = computed(() =>
  partite.value.filter(p => String(p.organizer_id) === String(userId) && isTodayOrFuture(p.date_time))
)
const partiteDisponibili = computed(() =>
  partite.value.filter(p =>
    String(p.organizer_id) !== String(userId) &&
    !isIscritto(p.id) &&
    postiLiberi(p) > 0
  )
)

// Caricamenti
const cercaPartite = async () => {
  isSearching.value = true
  try {
    const data = await getPartite({
      sport: sportFiltro.value,
      luogo: luogoFiltro.value,
      data: dataFiltro.value,
      ora: orarioFiltro.value,
      exclude_user_id: userId
    })
    partite.value = data
      .filter(p => isTodayOrFuture(p.date_time))
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
  } catch (err) {
    console.error('Errore nel caricamento delle partite:', err)
  } finally {
    resultsVersion.value++  
    isSearching.value = false
  }
}

const pulisciFiltri = async () => {
  sportFiltro.value = ''
  luogoFiltro.value = ''
  dataFiltro.value = ''
  orarioFiltro.value = ''
  const el = document.getElementById('autocomplete-luogo')
  if (el) el.value = ''
  await cercaPartite()
}

const caricaPartecipazioniUtente = async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/partecipazioni/mie/${userId}`)
    partecipazioniUtente.value = []
    partecipazioniUtenteDetails.value = []
    if (!Array.isArray(data)) return

    if (data.length > 0 && typeof data[0] === 'object' && (data[0].date_time || data[0].id)) {
      data.forEach(item => {
        const eventObj = item.date_time ? item : (item.event || item.partita || item)
        if (eventObj && eventObj.id) {
          partecipazioniUtente.value.push(eventObj.id)
          partecipazioniUtenteDetails.value.push(eventObj)
        }
      })
    } else {
      const ids = data
      partecipazioniUtente.value = ids.map(id => id)
      const results = await Promise.all(ids.map(async (id) => {
        try { return await getPartitaById(id) } catch { return null }
      }))
      partecipazioniUtenteDetails.value = results.filter(Boolean)
    }
  } catch (err) {
    console.error('Errore caricamento partecipazioni:', err)
  }
}

const addParticipationDetails = async (eventId) => {
  try {
    const p = await getPartitaById(eventId)
    if (p) partecipazioniUtenteDetails.value.push(p)
  } catch (e) {
    console.warn('Errore fetching dettagli partita appena iscritta', e)
  }
}

// --- Controllo conflitto temporale (±2h)
const TWO_HOURS_MS = 2 * 60 * 60 * 1000
function findTemporalConflict(targetPartita) {
  if (!targetPartita || !targetPartita.date_time) return null
  const targetTs = new Date(targetPartita.date_time).getTime()
  for (const p of partecipazioniUtenteDetails.value) {
    if (!p || !p.date_time) continue
    if (String(p.id) === String(targetPartita.id)) continue
    const otherTs = new Date(p.date_time).getTime()
    if (Math.abs(targetTs - otherTs) < TWO_HOURS_MS) return p
  }
  return null
}

// Conferme
function openConfirm({ title, message, subMessage = '', ctaText = 'Conferma', theme = 'primary', onOk }) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmSubMessage.value = subMessage
  confirmCtaText.value = ctaText
  confirmCtaClass.value = `btn-${theme}`
  confirmHeaderClass.value = `bg-${theme} ${theme === 'warning' ? 'text-dark' : 'text-white'}`
  confirmBusy.value = false
  confirmOnOk = onOk
  new bootstrap.Modal(document.getElementById('modalConferma')).show()
}
async function doConfirm() {
  if (!confirmOnOk) return
  confirmBusy.value = true
  const modalEl = document.getElementById('modalConferma')
  try {
    await confirmOnOk()
    bootstrap.Modal.getInstance(modalEl)?.hide()
  } finally {
    confirmBusy.value = false
    confirmOnOk = null
  }
}

// --- Eliminazione partita ---
async function eliminaPartita(eventId) {
  try {
    await axios.delete(`http://localhost:3000/api/partite/${eventId}`)
    showToast('Partita eliminata con successo.', 'success')
    await cercaPartite() // ricarica liste
  } catch (err) {
    console.error('Errore eliminazione partita:', err)
    const msg = err.response?.data?.error || 'Errore durante l’eliminazione.'
    showToast(msg, 'danger')
  }
}

/**
 * Può ricevere l'oggetto partita o solo l'id (emesso dal child).
 */
function chiediElimina(partitaOrId) {
  const id = typeof partitaOrId === 'object' ? partitaOrId.id : partitaOrId
  const p  = typeof partitaOrId === 'object'
    ? partitaOrId
    : (partite.value.find(x => String(x.id) === String(id)) || {})

  const when  = p.date_time ? `${formatData(p.date_time)} alle ${formatOra(p.date_time)} – ${p.location || ''}` : ''
  const sport = p.sport || 'la partita'

  openConfirm({
    title: 'Eliminare la partita?',
    message: `Confermi l’eliminazione di <strong>${sport}</strong>?`,
    subMessage: when,
    ctaText: 'Elimina',
    theme: 'danger',
    onOk: () => eliminaPartita(id),
  })
}


// Join
const unisciti = async (eventId, organizerId, sport) => {
  if (!userId) return showToast('Devi essere loggato per unirti a una partita.', 'warning', 6000)
  try {
    await axios.post('http://localhost:3000/api/partecipazioni', { user_id: userId, event_id: eventId })
    partecipazioniUtente.value.push(eventId)
    await addParticipationDetails(eventId)
    await cercaPartite()
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉')
    playJoinBanner()
    showToast('Ti sei unito con successo!', 'success', 5000)
  } catch (err) {
    showToast(err.response?.status === 409 ? 'Sei già iscritto a questa partita.' : 'Errore durante la registrazione.', 'danger')
  }
}

const uniscitiCalcio = async (eventId, organizerId, sport, roleKey) => {
  if (!userId) return showToast('Devi essere loggato per unirti a una partita.', 'warning', 6000)
  try {
    const { data } = await axios.post('http://localhost:3000/api/partecipazioni', { user_id: userId, event_id: eventId, role: roleKey })
    partecipazioniUtente.value.push(eventId)
    await addParticipationDetails(eventId)
    await cercaPartite()
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉')
    playJoinBanner()
    showToast(`Iscritto! Ruolo: ${ruoloLabel(data.role) || 'assegnato'}`, 'success', 5000)
  } catch (err) {
    const msg = err.response?.data?.error || 'Errore durante la registrazione.'
    showToast(msg, 'danger')
  }
}

function chiediUniscitiConControllo(partita) {
  const conflict = findTemporalConflict(partita)
  if (conflict) {
    const msg = `Sei già iscritto ad una partita di <strong>${conflict.sport}</strong> il <strong>${formatData(conflict.date_time)}</strong> alle <strong>${formatOra(conflict.date_time)}</strong>. Sei sicuro di volerti iscrivere?`
    openConfirm({ title: 'Conflitto orario', message: msg, ctaText: 'Iscrivimi', theme: 'warning', onOk: () => unisciti(partita.id, partita.organizer_id, partita.sport) })
  } else {
    const when = `${formatData(partita.date_time)} alle ${formatOra(partita.date_time)} – ${partita.location}`
    openConfirm({ title: `Unirti a ${partita.sport}?`, message: `Confermi l’iscrizione a <strong>${partita.sport}</strong>?`, subMessage: when, ctaText: 'Sì, uniscimi', theme: 'success', onOk: () => unisciti(partita.id, partita.organizer_id, partita.sport) })
  }
}

function chiediUniscitiCalcioConControllo(partita, roleKey) {
  const conflict = findTemporalConflict(partita)
  const roleMap = { random: 'Assegnazione casuale', portiere: 'Portiere', difensore: 'Difensore', centrocampista: 'Centrocampista', attaccante: 'Attaccante', all_around: 'All-around' }
  const roleLabelText = roleMap[roleKey] || ruoloLabel(roleKey)

  if (conflict) {
    const msg = `Sei già iscritto ad una partita di <strong>${conflict.sport}</strong> il <strong>${formatData(conflict.date_time)}</strong> alle <strong>${formatOra(conflict.date_time)}</strong>. Sei sicuro di volerti iscrivere come <strong>${roleLabelText}</strong>?`
    openConfirm({ title: 'Conflitto orario', message: msg, ctaText: 'Iscrivimi', theme: 'warning', onOk: () => uniscitiCalcio(partita.id, partita.organizer_id, partita.sport, roleKey) })
  } else {
    const when = `${formatData(partita.date_time)} alle ${formatOra(partita.date_time)} – ${partita.location}`
    openConfirm({ title: `Unirti a ${partita.sport}?`, message: `Confermi l’iscrizione come <strong>${roleLabelText}</strong>?`, subMessage: when, ctaText: 'Sì, uniscimi', theme: 'success', onOk: () => uniscitiCalcio(partita.id, partita.organizer_id, partita.sport, roleKey) })
  }
}

// Modale DETTAGLI + inviti
const apriDettagli = (partita) => {
  partitaSelezionata.value = partita
  searchUserQuery.value = ''
  userSearchResults.value = []
  selectedUserToInvite.value = null
  const modalEl = document.getElementById('modalDettagli')
  if (modalEl) new bootstrap.Modal(modalEl).show()
}

const searchUsersForInvite = async () => {
  if (searchUserQuery.value.trim() === '') { userSearchResults.value = []; return }
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/search?query=${searchUserQuery.value}`)
    userSearchResults.value = data.filter(user => user.id.toString() !== userId)
  } catch (error) {
    console.error('Errore ricerca utenti per invito:', error)
  }
}
const selectUserToInvite = (user) => { selectedUserToInvite.value = user; searchUserQuery.value = user.username; userSearchResults.value = [] }
const sendInvite = async () => {
  if (!selectedUserToInvite.value || !partitaSelezionata.value) return
  try {
    await axios.post(`http://localhost:3000/api/partite/${partitaSelezionata.value.id}/invite`, { inviterId: userId, inviteeId: selectedUserToInvite.value.id })
    showToast(`Invito inviato a ${selectedUserToInvite.value.username}!`, 'success')
    searchUserQuery.value = ''; selectedUserToInvite.value = null
  } catch (error) {
    console.error('Errore invio invito:', error)
    showToast('Errore durante l\'invio dell\'invito.', 'danger')
  }
}

// --- helper Calcio/Ruoli ---
const isCalcio = (p) => {
  const s = (p?.sport || '').toLowerCase()
  return s === 'calcio a 11' || s === 'calcio a 5'
}
const sumRolesNeeded = (p) => {
  const r = p?.roles_needed || {}
  return Object.values(r).reduce((acc, v) => acc + Number(v || 0), 0)
}
const formatRuoli = (roles) => {
  if (!roles || Object.keys(roles).length === 0) return '—'
  const labels = { portiere: 'Portiere', difensore: 'Difensori', centrocampista: 'Centrocampisti', attaccante: 'Attaccanti', all_around: 'All-around' }
  return Object.entries(roles).filter(([_, v]) => Number(v) > 0).map(([k, v]) => `${labels[k] || k}: ${v}`).join(', ')
}
const ruoloLabel = (key) => ({ portiere: 'Portiere', difensore: 'Difensore', centrocampista: 'Centrocampista', attaccante: 'Attaccante', all_around: 'All-around' }[key] || key)
const roleEntries = (p) => {
  const o = p?.roles_needed || {}
  return Object.keys(o).map(k => ({ key: k, count: Number(o[k] || 0) })).filter(r => r.count > 0)
}

// --- MODIFICA: apertura e precompilazione
function apriModifica(partita) {
  partitaSelezionata.value = partita

  // Date/Time locali (no UTC shift)
  const d = new Date(partita.date_time)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')

  const roles = JSON.parse(JSON.stringify(partita.roles_needed || {}))

  editForm.value = {
    id: partita.id,
    sport: partita.sport || '',
    location: partita.location || '',
    date: `${y}-${m}-${day}`,
    time: `${hh}:${mm}`,
    max_players: partita.max_players ?? 0,
    roles_needed: roles,
    description: partita.description || '',
  }

  const modalEl = document.getElementById('modalModifica')
  if (modalEl) new bootstrap.Modal(modalEl).show()
}

// Allinea i ruoli quando cambia sport
watch(() => editForm.value.sport, (newVal) => {
  const s = (newVal || '').toLowerCase()
  if (s === 'calcio a 5') {
    editForm.value.roles_needed = {
      portiere: Number(editForm.value.roles_needed.portiere || 0),
      all_around: Number(editForm.value.roles_needed.all_around || 0),
    }
  } else if (s === 'calcio a 11') {
    editForm.value.roles_needed = {
      portiere: Number(editForm.value.roles_needed.portiere || 0),
      difensore: Number(editForm.value.roles_needed.difensore || 0),
      centrocampista: Number(editForm.value.roles_needed.centrocampista || 0),
      attaccante: Number(editForm.value.roles_needed.attaccante || 0),
    }
  } else {
    editForm.value.roles_needed = {}
  }
})

// Salvataggio modifiche
async function salvaModifiche() {
  try {
    savingEdit.value = true

    // Validazioni minime lato client
    if (!editForm.value.location?.trim() || !editForm.value.date || !editForm.value.time) {
      showToast('Compila tutti i campi obbligatori (luogo, data, ora).', 'warning')
      return
    }

    const sportLower = (editForm.value.sport || '').toLowerCase()

    const basePayload = {
      sport: editForm.value.sport, // <-- importante per il validator del backend
      location: editForm.value.location.trim(),
      date_time: combineDateTime(editForm.value.date, editForm.value.time),
      description: editForm.value.description ?? ''
    }

    let payload
    if (sportLower === 'calcio a 5' || sportLower === 'calcio a 11') {
      // ruoli normalizzati con tutte le chiavi necessarie
      const roles = normalizeRoles(editForm.value.sport, editForm.value.roles_needed)
      payload = { ...basePayload, roles_needed: roles }
      // NON mandare max_players in questo caso
    } else {
      const maxPlayers = Number(editForm.value.max_players || 0)
      if (!Number.isFinite(maxPlayers) || maxPlayers <= 0) {
        showToast('Imposta un numero giocatori valido (> 0).', 'warning')
        return
      }
      payload = { ...basePayload, max_players: maxPlayers }
      // NON mandare roles_needed in questo caso
    }

    await axios.put(`http://localhost:3000/api/partite/${editForm.value.id}`, payload/*, {
      headers: { 'Content-Type': 'application/json' }
    }*/)

    showToast('Partita aggiornata con successo!', 'success')
    await cercaPartite()

    const modalEl = document.getElementById('modalModifica')
    bootstrap.Modal.getInstance(modalEl)?.hide()
  } catch (err) {
    console.error('Errore salvataggio modifica:', err)
    const msg = err.response?.data?.error || 'Errore durante il salvataggio.'
    showToast(msg, 'danger')
  } finally {
    savingEdit.value = false
  }
}


// Toast
const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success')
const toastIcon = computed(() => ({ success: '✅', danger: '🛑', warning: '⚠️' }[toastVariant.value] || 'ℹ️'))
const toastVariantClass = computed(() =>
  ({ success: 'bg-success text-white', danger: 'bg-danger text-white', warning: 'bg-warning text-dark' }[toastVariant.value] || 'bg-info text-white')
)
function showToast(message, variant = 'success', delayMs = 5000) {
  toastMessage.value = message
  toastVariant.value = variant
  const t = new bootstrap.Toast(toastEl.value, { autohide: true, animation: true, delay: delayMs })
  t.show()
}

// Effetto pioggia emoji
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
    setTimeout(() => container.removeChild(el), 4000)
  }
}

// --- Banner "Ci vediamo in campo"
const showJoinBanner = ref(false)
const joinBannerAnimating = ref(false)
let joinBannerTimeout = null

function playJoinBanner() {
  // Mostra il banner e riavvia l'animazione (forza reflow)
  showJoinBanner.value = true
  joinBannerAnimating.value = false
  // force reflow per ri-triggerare la CSS animation
  requestAnimationFrame(() => {
    // piccolo delay per garantire il toggle della classe
    requestAnimationFrame(() => {
      joinBannerAnimating.value = true
    })
  })

  // Durata totale dell'animazione = deve combaciare con @keyframes (vedi CSS)
  clearTimeout(joinBannerTimeout)
  joinBannerTimeout = setTimeout(() => {
    joinBannerAnimating.value = false
    showJoinBanner.value = false
  }, 2200) // 2.2s come negli styles
}


// Formattazioni/Icone
function formatData(datetime) {
  const date = new Date(datetime)
  return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatOra(datetime) {
  const date = new Date(datetime)
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}
function getSportIcon(sport) {
  switch ((sport || '').toLowerCase()) {
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
  switch ((sport || '').toLowerCase()) {
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

// Mount
onMounted(async () => {
  nomeUtente.value = localStorage.getItem('userName') || 'Utente'
  await Promise.all([cercaPartite(), caricaPartecipazioniUtente()])

  const eventIdToOpen = route.query.open_event
  if (eventIdToOpen) {
    try {
      const partita = await getPartitaById(eventIdToOpen)
      apriDettagli(partita)
    } catch (error) {
      console.error('Impossibile aprire la partita dalla notifica:', error)
      showToast('Impossibile trovare la partita selezionata.', 'danger')
    }
  }

  // Google Places Autocomplete sul campo luogo
  const input = document.getElementById('autocomplete-luogo')
  if (input && window.google && google.maps && google.maps.places) {
    const autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode'], componentRestrictions: { country: 'it' } })
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      luogoFiltro.value = place.formatted_address || input.value
    })
  } else {
    console.warn('Google Maps API non è ancora pronta.')
  }
})
</script>
