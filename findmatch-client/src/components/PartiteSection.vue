<template>
  <div class="component-partite">
    <!-- LISTA STANDARD (es. "A cui sei iscritto") -->
    <template v-if="props.sezione !== 'storico'">
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

              <div class="d-flex align-items-center gap-2 mt-2">
                <span class="badge bg-light text-dark">
                  {{ postiLiberi(partita) }} posti liberi
                </span>
              </div>
              <div class="progress fm-progress rounded-pill mt-2" role="progressbar" 
                  :aria-valuenow="Number(partita.partecipanti) || 0"
                  aria-valuemin="0"
                  :aria-valuemax="progressMax(partita)">
                <div
                  class="progress-bar fm-progress-bar rounded-pill"
                  :class="progressBarClass(partita)"
                  :style="{ width: progressPercent(partita) + '%' }">
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center">
              <button
                class="btn btn-join me-2"
                @click="mostraDettagli(partita)"
                :aria-label="`Dettagli: ${partita.sport} ${formatData(partita.date_time)} ${formatOra(partita.date_time)}`"
              >
                Dettagli
              </button>

              <button
                v-if="props.sezione === 'iscritto'"
                class="d-flex align-items-center btn-leave"
                @click="chiediConfermaAbbandona(partita.id)"
                :aria-label="`Abbandona: ${partita.sport} ${formatData(partita.date_time)} ${formatOra(partita.date_time)}`"
              >
                Abbandona
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-muted">Nessuna partita in questa sezione.</div>
    </template>

    <!-- STORICO PARTECIPAZIONI: due sottosezioni -->
    <template v-else>
      <div v-if="storicoPartecipate.length || storicoCreateDaTe.length">

        <!-- Partecipate -->
        <div class="storico-card mb-4">
          <div class="storico-header">Partecipate</div>
          <div v-if="storicoPartecipate.length" class="storico-body scrollable-section">
            <div
              v-for="partita in storicoPartecipate"
              :key="`p-${partita.id}`"
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
                </div>
                <div class="d-flex align-items-center">
                  <button class="btn btn-join btn-sm" @click="mostraDettagli(partita)">
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted p-3">Nessuna partita partecipata.</div>
        </div>

        <!-- Create da te -->
        <div class="storico-card mb-4">
          <div class="storico-header">Create da te</div>
          <div v-if="storicoCreateDaTe.length" class="storico-body scrollable-section">
            <div
              v-for="partita in storicoCreateDaTe"
              :key="`m-${partita.id}`"
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
                </div>
                <div class="d-flex align-items-center">
                  <button class="btn btn-join btn-sm" @click="mostraDettagli(partita)">
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted p-3">Nessuna partita passata creata da te.</div>
        </div>

      </div>

      <div v-else class="text-muted">Nessuna partita nello storico.</div>
    </template>



    <!-- MODALI & TOAST -->
     <teleport to="body">
    <div class="modal fade" id="modalDettagli" tabindex="-1" aria-labelledby="modalDettagliLabel" aria-hidden="true">
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
              <div class="col-md-6" v-if="partitaSelezionata.organizer_name">
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

              <!-- Non calcio: posti -->
              <div class="col-12" v-if="!isCalcio(partitaSelezionata)">
                <label class="form-label">Posti rimanenti</label>
                <input
                  type="text"
                  class="form-control"
                  :value="`${postiLiberi(partitaSelezionata)} / ${progressMax(partitaSelezionata)}`"
                  disabled
                />
              </div>

              <!-- Calcio: ruoli -->
              <div class="col-12" v-else>
                <label class="form-label">Ruoli mancanti</label>
                <div class="row g-2">
                  <div class="col-md-3" v-for="(v, k) in extractRolesNeeded(partitaSelezionata)" :key="k" v-if="Number(v) > 0">
                    <div class="input-group">
                      <span class="input-group-text">{{ ruoloLabel(k) }}</span>
                      <input type="text" class="form-control" :value="v" disabled />
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
          </div>
        </div>
      </div>
    </div>
    </teleport>

    <!-- MODALE CONFERMA ABBANDONO -->
     <teleport to="body">
    <div class="modal fade" id="modalConfermaAbbandono" tabindex="-1" aria-labelledby="modalConfermaAbbandonoLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header bg-danger text-dark">
            <h5 class="modal-title" id="modalConfermaAbbandonoLabel">Abbandonare la partita?</h5>
          </div>
          <div class="modal-body">
            <p class="mb-2">Se abbandoni perderai il tuo posto in questa partita.</p>
            <small class="text-muted">L’azione è immediata.</small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="abbandonando" aria-label="Annulla abbandono">
              Annulla
            </button>
            <button type="button" class="btn btn-danger text-white" @click="confermaAbbandono" :disabled="abbandonando" aria-label="Conferma abbandono della partita">
              <span v-if="abbandonando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Abbandona
            </button>
          </div>
        </div>
      </div>
    </div>
    </teleport>

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
  sezione: String,               // 'iscritto' | 'storico' | altro
  fetchEventoById: Function
})

const userId = localStorage.getItem('userId')

/* ======================= Filtri base ======================= */
function filterBySection(arr = []) {
  // "A cui sei iscritto": escludi quelle che ho creato io
  if (props.sezione === 'iscritto') {
    return arr.filter(p => String(p.organizer_id) !== String(userId))
  }
  return arr
}

const emit = defineEmits(['partita-aggiornata', 'partita-abbandonata'])

const lista = ref(filterBySection(props.partite ?? []))
watch(() => props.partite, (nv) => {
  lista.value = filterBySection(nv ?? [])
  if (typeof props.fetchEventoById === 'function') {
    syncAllCounts().catch(() => {})
  }
}, { deep: true })

/* ======================= Storico: split in due sottoliste ======================= */
const nowIso = computed(() => new Date().toISOString())
const isPassata = (p) => new Date(p?.date_time).toISOString() < nowIso.value

const storicoPartecipate = computed(() =>
  (lista.value || []).filter(p => isPassata(p) && String(p.organizer_id) !== String(userId))
)

const storicoCreateDaTe = computed(() =>
  (lista.value || []).filter(p => isPassata(p) && String(p.organizer_id) === String(userId))
)

/* ======================= Posti/progress ======================= */
function isCalcio(p) {
  const s = String(p?.sport || '').toLowerCase()
  return s === 'calcio a 5' || s === 'calcio a 11'
}
function extractRolesNeeded(p) {
  const rn = p?.roles_needed
  if (rn && typeof rn === 'object') {
    return {
      portiere: Number(rn.portiere ?? 0),
      difensore: Number(rn.difensore ?? 0),
      centrocampista: Number(rn.centrocampista ?? 0),
      attaccante: Number(rn.attaccante ?? 0),
      all_around: Number(rn.all_around ?? 0)
    }
  }
  const max = {
    portiere: Number(p?.role_max_portiere ?? p?.roles?.max?.portiere ?? 0),
    difensore: Number(p?.role_max_difensore ?? p?.roles?.max?.difensore ?? 0),
    centrocampista: Number(p?.role_max_centrocampista ?? p?.roles?.max?.centrocampista ?? 0),
    attaccante: Number(p?.role_max_attaccante ?? p?.roles?.max?.attaccante ?? 0),
    all_around: Number(p?.roles?.max?.all_around ?? 0)
  }
  const filled = {
    portiere: Number(p?.role_filled_portiere ?? p?.roles?.filled?.portiere ?? 0),
    difensore: Number(p?.role_filled_difensore ?? p?.roles?.filled?.difensore ?? 0),
    centrocampista: Number(p?.role_filled_centrocampista ?? p?.roles?.filled?.centrocampista ?? 0),
    attaccante: Number(p?.role_filled_attaccante ?? p?.roles?.filled?.attaccante ?? 0),
    all_around: Number(p?.roles?.filled?.all_around ?? 0)
  }
  const needed = {}
  for (const k of Object.keys(max)) needed[k] = Math.max(0, (max[k] || 0) - (filled[k] || 0))
  return needed
}
const sumRolesNeeded = (p) => Object.values(extractRolesNeeded(p)).reduce((a, b) => a + Number(b || 0), 0)

const postiLiberi = (p) => {
  if (isCalcio(p)) return sumRolesNeeded(p)
  return Math.max(0, (Number(p.max_players) || 0) - (Number(p.partecipanti) || 0))
}
const progressMax = (p) => {
  if (isCalcio(p)) return (Number(p.partecipanti) || 0) + sumRolesNeeded(p)
  return Number(p.max_players) || 0
}
const progressPercent = (p) => {
  const max = progressMax(p)
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

/* ======================= Ruoli UI ======================= */
const ruoloLabel = (key) => ({
  portiere: 'Portiere',
  difensore: 'Difensore',
  centrocampista: 'Centrocampista',
  attaccante: 'Attaccante',
  all_around: 'All-around'
}[key] || key)
const formatRuoli = (roles) => {
  if (!roles || Object.keys(roles).length === 0) return '—'
  return Object.entries(roles)
    .filter(([_, v]) => Number(v) > 0)
    .map(([k, v]) => `${ruoloLabel(k)}: ${v}`)
    .join(', ')
}

/* ======================= Aggiornamenti locali / sync ======================= */
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
async function syncEvento(id) {
  if (typeof props.fetchEventoById !== 'function') return
  try {
    const fresh = await props.fetchEventoById(id)
    if (!fresh) return
    const idx = lista.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      lista.value[idx] = { ...lista.value[idx], ...fresh }
      if (partitaSelezionata.value?.id === id) {
        partitaSelezionata.value = { ...lista.value[idx] }
      }
    }
  } catch {}
}
async function syncAllCounts() {
  const ids = lista.value.map(p => p.id)
  await Promise.all(ids.map(syncEvento))
}

/* ======================= Stato editing calcio ======================= */
const ruoliEditCalcio = ref({ portiere:0, difensore:0, centrocampista:0, attaccante:0, all_around:0 })
const sommaRuoliCalcio = computed(() =>
  ['portiere','difensore','centrocampista','attaccante','all_around']
    .map(k => Number(ruoliEditCalcio.value[k] || 0))
    .reduce((a,b) => a + b, 0)
)

/* ======================= Modali ======================= */
const minDateTime = computed(() => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
})
const partitaSelezionata = ref(null)

function mostraDettagli(partita) {
  partitaSelezionata.value = partita
  const modal = new bootstrap.Modal(document.getElementById('modalDettagli'))
  modal.show()
}

/* ======================= Azioni ======================= */
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

/* ======================= Toast ======================= */
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

/* ======================= Utils ======================= */
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
