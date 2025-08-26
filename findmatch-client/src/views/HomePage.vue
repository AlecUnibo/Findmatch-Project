<template>
  <div class="component-home">
    <div class="container mt-5">
      <!-- Benvenuto -->
      <div class="text-center mb-4">
        <h2>Benvenuto, {{ nomeUtente }}! 👋</h2>
        <p class="text-muted">Trova o unisciti alla tua prossima partita sportiva!</p>
      </div>

      <!-- Ricerca (estratta in componente) -->
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

      <!-- Partite disponibili -->
      <div class="mb-5" v-if="tab==='disponibili'">
        <PartiteListSection
          titolo="📅 Partite disponibili"
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
          titolo="🛠️ Create da te"
          :partite="partiteCreate"
          :perPage="8"
          :showJoin="false"
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

              <!-- Se NON è calcio: mostra posti -->
              <p v-if="!isCalcio(partitaSelezionata)">
                <strong>Posti rimanenti:</strong>
                {{ postiLiberi(partitaSelezionata) }} / {{ partitaSelezionata.max_players ?? 0 }}
              </p>

              <!-- Se è calcio: mostra ruoli -->
              <div v-else>
                <p class="mb-1">
                  <strong>Ruoli mancanti:</strong>
                  {{ formatRuoli(partitaSelezionata.roles_needed) }}
                </p>
                <p class="mb-1 text-muted">
                  <strong>- Totale ruoli richiesti:</strong> {{ sumRolesNeeded(partitaSelezionata) }}
                </p>
              </div>

              <p><strong>Organizzatore:</strong> {{ partitaSelezionata.organizer_name }}</p>
              <p><strong>Descrizione:</strong> {{ partitaSelezionata.description || 'Nessuna descrizione disponibile.' }}</p>

              <hr />
              <h6>Invita un utente</h6>
              <div class="input-group">
                <input
                  type="text"
                  v-model="searchUserQuery"
                  @input="searchUsersForInvite"
                  class="form-control"
                  placeholder="Cerca utente da invitare..."
                />
                <button class="btn btn-outline-secondary" type="button" @click="sendInvite" :disabled="!selectedUserToInvite">
                  Invita
                </button>
              </div>
              <ul v-if="userSearchResults.length" class="list-group mt-2">
                <li
                  v-for="user in userSearchResults"
                  :key="user.id"
                  @click="selectUserToInvite(user)"
                  class="list-group-item list-group-item-action"
                  style="cursor: pointer;"
                >
                  {{ user.username }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale conferma -->
      <div class="modal fade" id="modalConferma" tabindex="-1" aria-labelledby="modalConfermaLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0">
            <div class="modal-header" :class="confirmHeaderClass">
              <h5 class="modal-title" id="modalConfermaLabel">{{ confirmTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                :class="confirmHeaderClass.includes('text-white') ? 'btn-close-white' : ''"
                data-bs-dismiss="modal"
                aria-label="Chiudi"
              ></button>
            </div>
            <div class="modal-body">
              <p class="mb-2" v-html="confirmMessage"></p>
              <small v-if="confirmSubMessage" class="text-muted" v-html="confirmSubMessage"></small>
            </div>
            <div class="modal-footer">
              <!-- CANCEL: ora sfondo rosso e testo nero -->
              <button type="button" class="btn btn-cancel" data-bs-dismiss="modal" :disabled="confirmBusy">
                Annulla
              </button>
              <button type="button" class="btn" :class="confirmCtaClass" @click="doConfirm" :disabled="confirmBusy">
                <span v-if="confirmBusy" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ confirmCtaText }}
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

    <div class="emoji-rain-container" ref="emojiContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import * as bootstrap from 'bootstrap'
import axios from 'axios'

import HomeSearchBar from '@/components/HomeSearchBar.vue'
import PartiteListSection from '@/components/PartiteListSection.vue'

import { getPartite, getPartitaById } from '../services/partiteService'

const route = useRoute()

// Stato base
const nomeUtente = ref('')
const luogoFiltro = ref('')
const sportFiltro = ref('')
const orarioFiltro = ref('')
const dataFiltro = ref('')

const partite = ref([])
// partecUtenteIds mantiene solo gli ID (usato per isIscritto)
const partecipazioniUtente = ref([])
// partecipazioniUtenteDetails mantiene gli oggetti partita a cui l'utente è iscritto (necessario per il check ±2h)
const partecipazioniUtenteDetails = ref([])

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

// --- Emoji per pioggia
const sportEmojis = {
  'calcio a 5': '⚽', 'calcio a 11': '⚽', 'basket': '🏀',
  'beach volley': '🏐', 'pallavolo': '🏐', 'racchettoni': '🏓',
  'tennis': '🎾', 'paddle': '🥎'
}

// --- Helpers posti/progress
const postiLiberi = (p) => {
  if (isCalcio(p)) return sumRolesNeeded(p)
  return Math.max(0, (p.max_players ?? 0) - (p.partecipanti ?? 0))
}
const progressMax = (p) => {
  if (isCalcio(p)) return (p.partecipanti ?? 0) + sumRolesNeeded(p)
  return p.max_players ?? 0
}
const progressPercent = (p) => {
  const max = progressMax(p)
  const cur = p.partecipanti ?? 0
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
const isIscritto = (eventId) =>
  partecipazioniUtente.value.some(id => String(id) === String(eventId))

// Filtri per liste
const startOfToday = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})
const isTodayOrFuture = (dt) => new Date(dt) >= startOfToday.value

const partiteCreate = computed(() =>
  partite.value.filter(p =>
    String(p.organizer_id) === String(userId) &&
    isTodayOrFuture(p.date_time)
  )
)

const partiteDisponibili = computed(() =>
  partite.value.filter(p =>
    String(p.organizer_id) !== String(userId) &&   // non mie
    !isIscritto(p.id) &&                           // non già iscritto
    postiLiberi(p) > 0                             // non piene
  )
)

// Caricamenti
const cercaPartite = async () => {
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
    // Chiediamo all'API le partecipazioni dell'utente.
    // Gestiamo due possibili formati di risposta:
    // 1) array di ID (es: [1,2,3])
    // 2) array di oggetti partecipazione/partita con almeno id, date_time, sport
    const { data } = await axios.get(`http://localhost:3000/api/partecipazioni/mie/${userId}`)
    // reset
    partecipazioniUtente.value = []
    partecipazioniUtenteDetails.value = []

    if (!Array.isArray(data)) return

    // Se gli elementi sono oggetti con proprietà utili (id, date_time), usali direttamente
    if (data.length > 0 && typeof data[0] === 'object' && (data[0].date_time || data[0].id)) {
      // assumiamo che ogni elemento sia un oggetto con almeno id e date_time (o che abbia event o partita al suo interno)
      data.forEach(item => {
        const eventObj = item.date_time ? item : (item.event || item.partita || item)
        if (eventObj && eventObj.id) {
          partecipazioniUtente.value.push(eventObj.id)
          partecipazioniUtenteDetails.value.push(eventObj)
        }
      })
    } else {
      // altrimenti assumiamo che siano ID e facciamo fetch per ogni partita
      const ids = data
      partecipazioniUtente.value = ids.map(id => id)
      // carichiamo i dettagli in parallelo (tolleriamo errori singoli)
      const promises = ids.map(async (id) => {
        try {
          const p = await getPartitaById(id)
          return p
        } catch (e) {
          console.warn('Impossibile caricare partita partecipazione id:', id, e)
          return null
        }
      })
      const results = await Promise.all(promises)
      partecipazioniUtenteDetails.value = results.filter(r => r)
    }
  } catch (err) {
    console.error('Errore caricamento partecipazioni:', err)
  }
}

// Aggiunge al dettaglio delle partecipazioni l'evento appena iscritto (fetcha dettagli)
const addParticipationDetails = async (eventId) => {
  try {
    const p = await getPartitaById(eventId)
    if (p) partecipazioniUtenteDetails.value.push(p)
  } catch (e) {
    console.warn('Errore fetching dettagli partita appena iscritta', e)
  }
}

// --- Temporal conflict check (±2 ore) ---
const TWO_HOURS_MS = 2 * 60 * 60 * 1000
function findTemporalConflict(targetPartita) {
  if (!targetPartita || !targetPartita.date_time) return null
  const targetTs = new Date(targetPartita.date_time).getTime()
  for (const p of partecipazioniUtenteDetails.value) {
    if (!p || !p.date_time) continue
    // saltare se è la stessa partita (non ha senso controllare)
    if (String(p.id) === String(targetPartita.id)) continue
    const otherTs = new Date(p.date_time).getTime()
    const diff = Math.abs(targetTs - otherTs)
    if (diff < TWO_HOURS_MS) {
      return p
    }
  }
  return null
}

// Conferme & join (modificate per inserire il controllo temporale)
function openConfirm({ title, message, subMessage = '', ctaText = 'Conferma', theme = 'primary', onOk }) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmSubMessage.value = subMessage
  confirmCtaText.value = ctaText
  confirmCtaClass.value = `btn-${theme}`
  confirmHeaderClass.value = `bg-${theme} ${theme === 'warning' ? 'text-dark' : 'text-white'}`
  confirmBusy.value = false
  confirmOnOk = onOk

  const modal = new bootstrap.Modal(document.getElementById('modalConferma'))
  // Bootstrapped modal backdrop will be appended to body; CSS globale garantisce che sia davanti.
  modal.show()
}

async function doConfirm() {
  if (!confirmOnOk) return
  confirmBusy.value = true
  const modalEl = document.getElementById('modalConferma')
  try {
    await confirmOnOk()
    bootstrap.Modal.getInstance(modalEl)?.hide()
  } catch (e) {
    // gestito a monte
  } finally {
    confirmBusy.value = false
    confirmOnOk = null
  }
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
    // aggiungiamo anche i dettagli della partecipazione appena fatta
    await addParticipationDetails(eventId)
    await cercaPartite()
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉')
    showToast('Ti sei unito con successo!', 'success', 5000)
  } catch (err) {
    showToast(err.response?.status === 409 ? 'Sei già iscritto a questa partita.' : 'Errore durante la registrazione.', 'danger')
  }
}

const uniscitiCalcio = async (eventId, organizerId, sport, roleKey) => {
  if (!userId) {
    showToast('Devi essere loggato per unirti a una partita.', 'warning', 6000)
    return
  }
  try {
    const { data } = await axios.post('http://localhost:3000/api/partecipazioni', {
      user_id: userId,
      event_id: eventId,
      role: roleKey
    })
    partecipazioniUtente.value.push(eventId)
    await addParticipationDetails(eventId)
    await cercaPartite()
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉')
    showToast(`Iscritto! Ruolo: ${ruoloLabel(data.role) || 'assegnato'}`, 'success', 5000)
  } catch (err) {
    const msg = err.response?.data?.error || 'Errore durante la registrazione.'
    showToast(msg, 'danger')
  }
}

// Funzioni che gestiscono la richiesta di iscrizione + controllo temporale
function chiediUniscitiConControllo(partita) {
  // controlliamo conflitti con le altre partecipazioni (±2 ore)
  const conflict = findTemporalConflict(partita)
  if (conflict) {
    // Mostriamo il pop-up di avvertimento richiesto con "Annulla" e "Iscrivimi"
    const msg = `Sei già iscritto ad una partita di <strong>${conflict.sport}</strong> il <strong>${formatData(conflict.date_time)}</strong> alle <strong>${formatOra(conflict.date_time)}</strong>. Sei sicuro di volerti iscrivere?`
    openConfirm({
      title: 'Conflitto orario',
      message: msg,
      subMessage: '',
      ctaText: 'Iscrivimi',
      theme: 'warning',
      onOk: () => unisciti(partita.id, partita.organizer_id, partita.sport)
    })
  } else {
    // nessun conflitto, procediamo con la normale conferma (come prima)
    const when = `${formatData(partita.date_time)} alle ${formatOra(partita.date_time)} – ${partita.location}`
    openConfirm({
      title: `Unirti a ${partita.sport}?`,
      message: `Confermi l’iscrizione a <strong>${partita.sport}</strong>?`,
      subMessage: when,
      ctaText: 'Sì, uniscimi',
      theme: 'success',
      onOk: () => unisciti(partita.id, partita.organizer_id, partita.sport),
    })
  }
}

function chiediUniscitiCalcioConControllo(partita, roleKey) {
  const conflict = findTemporalConflict(partita)
  const roleMap = {
    random: 'Assegnazione casuale',
    portiere: 'Portiere',
    difensore: 'Difensore',
    centrocampista: 'Centrocampista',
    attaccante: 'Attaccante',
    all_around: 'All-around',
  }
  const roleLabelText = roleMap[roleKey] || ruoloLabel(roleKey)

  if (conflict) {
    const msg = `Sei già iscritto ad una partita di <strong>${conflict.sport}</strong> il <strong>${formatData(conflict.date_time)}</strong> alle <strong>${formatOra(conflict.date_time)}</strong>. Sei sicuro di volerti iscrivere come <strong>${roleLabelText}</strong>?`
    openConfirm({
      title: 'Conflitto orario',
      message: msg,
      subMessage: '',
      ctaText: 'Iscrivimi',
      theme: 'warning',
      onOk: () => uniscitiCalcio(partita.id, partita.organizer_id, partita.sport, roleKey)
    })
  } else {
    const when = `${formatData(partita.date_time)} alle ${formatOra(partita.date_time)} – ${partita.location}`
    openConfirm({
      title: `Unirti a ${partita.sport}?`,
      message: `Confermi l’iscrizione come <strong>${roleLabelText}</strong>?`,
      subMessage: when,
      ctaText: 'Sì, uniscimi',
      theme: 'success',
      onOk: () => uniscitiCalcio(partita.id, partita.organizer_id, partita.sport, roleKey),
    })
  }
}

// Modale dettagli + inviti
const apriDettagli = (partita) => {
  partitaSelezionata.value = partita
  searchUserQuery.value = ''
  userSearchResults.value = []
  selectedUserToInvite.value = null
  const modalEl = document.getElementById('modalDettagli')
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl)
    modal.show()
  }
}

const searchUsersForInvite = async () => {
  if (searchUserQuery.value.trim() === '') {
    userSearchResults.value = []
    return
  }
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/search?query=${searchUserQuery.value}`)
    userSearchResults.value = data.filter(user => user.id.toString() !== userId)
  } catch (error) {
    console.error("Errore ricerca utenti per invito:", error)
  }
}

const selectUserToInvite = (user) => {
  selectedUserToInvite.value = user
  searchUserQuery.value = user.username
  userSearchResults.value = []
}

const sendInvite = async () => {
  if (!selectedUserToInvite.value || !partitaSelezionata.value) return
  try {
    await axios.post(`http://localhost:3000/api/partite/${partitaSelezionata.value.id}/invite`, {
      inviterId: userId,
      inviteeId: selectedUserToInvite.value.id
    })
    showToast(`Invito inviato a ${selectedUserToInvite.value.username}!`, 'success')
    searchUserQuery.value = ''
    selectedUserToInvite.value = null
  } catch (error) {
    console.error("Errore invio invito:", error)
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
  const labels = {
    portiere: 'Portiere',
    difensore: 'Difensori',
    centrocampista: 'Centrocampisti',
    attaccante: 'Attaccanti',
    all_around: 'All-around'
  }
  return Object.entries(roles)
    .filter(([_, v]) => Number(v) > 0)
    .map(([k, v]) => `${labels[k] || k}: ${v}`)
    .join(', ')
}
const ruoloLabel = (key) => ({
  portiere: 'Portiere',
  difensore: 'Difensore',
  centrocampista: 'Centrocampista',
  attaccante: 'Attaccante',
  all_around: 'All-around'
}[key] || key)
const roleEntries = (p) => {
  const o = p?.roles_needed || {}
  return Object.keys(o)
    .map(k => ({ key: k, count: Number(o[k] || 0) }))
    .filter(r => r.count > 0)
}

// Toast
const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success')
const toastIcon = computed(() => ({ 'success': '✅', 'danger': '🛑', 'warning': '⚠️' })[toastVariant.value] || 'ℹ️')
const toastVariantClass = computed(() =>
  ({ 'success': 'bg-success text-white', 'danger': 'bg-danger text-white', 'warning': 'bg-warning text-dark' }[toastVariant.value] || 'bg-info text-white')
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
  switch ((sport || '').toLowerCase()) {
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
      console.error("Impossibile aprire la partita dalla notifica:", error)
      showToast('Impossibile trovare la partita selezionata.', 'danger')
    }
  }

  // Google Places Autocomplete sul campo luogo
  const input = document.getElementById('autocomplete-luogo')
  if (input && window.google && google.maps && google.maps.places) {
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
/* piccolo styling per le emoji (se già presenti nel progetto, ignora) */
.emoji-fall {
  position: fixed;
  top: -2rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 12000;
  animation-name: fall;
  animation-timing-function: linear;
}
@keyframes fall {
  to {
    transform: translateY(110vh);
    opacity: 0;
  }
}

/* stile btn-cancel solo all'interno del componente (scoped) */
.btn-cancel {
  background-color: #ff4d4d;
  color: #000 !important;
  border: none;
}
.btn-cancel:hover,
.btn-cancel:focus {
  background-color: #e04343;
  color: #000 !important;
  box-shadow: none;
}
</style>

<!-- Regole globali per forzare i modal in primo piano rispetto a card/dropdown -->
<style>
/* Metti i modal davanti a tutto (sovrascrive Bootstrap se necessario) */
.modal,
.modal.show {
  z-index: 20000 !important;
}

/* backdrop appena sotto il modal, ma sopra il contenuto della pagina */
.modal-backdrop {
  z-index: 19990 !important;
}

/* caso specifico: il dialog può anche avere z-index sul dialog */
.modal-dialog {
  z-index: 20001 !important;
}

/* assicurati che lo scrollbar non interferisca */
body.modal-open {
  overflow: hidden;
}
</style>
