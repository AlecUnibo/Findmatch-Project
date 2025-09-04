<template>
  <div class="component-crea-partita container mt-5">
    <form @submit.prevent="creaPartita" class="card fm-card shadow-lg border-0 rounded-4 overflow-hidden mb-5">
      <!-- Banner -->
      <div class="fm-header p-4">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h4 class="mb-1 text-white">Crea una nuova partita</h4>
            <p class="mb-0 text-white-50">Compila i campi qui sotto. Puoi sempre modificarli in seguito.</p>
          </div>
        </div>
      </div>

      <div class="p-4 p-md-5">

        <!-- ===================== Dettagli partita ===================== -->
        <h6 class="fm-section-title">Dettagli partita</h6>

        <!-- SPORT -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Sport</label>
          <select v-model="form.sport" class="form-select form-select-lg fm-control">
            <option value="">Seleziona uno sport</option>
            <option>Calcio a 11</option>
            <option>Calcio a 5</option>
            <option>Basket</option>
            <option>Beach Volley</option>
            <option>Pallavolo</option>
            <option>Racchettoni</option>
            <option>Tennis</option>
            <option>Padel</option>
          </select>
        </div>

        <!-- TIPOLOGIA (solo Basket/Tennis) -->
        <div v-if="form.sport === 'Basket' || form.sport === 'Tennis'" class="mb-4">
          <label class="form-label fw-semibold">Tipologia</label>
          <select v-model="form.tipologia" class="form-select form-select-lg fm-control" required>
            <option value="">Seleziona una tipologia</option>
            <template v-if="form.sport === 'Basket'">
              <option>1v1 metà campo</option>
              <option>2v2 metà campo</option>
              <option>3v3 metà campo</option>
              <option>5v5 metà campo</option>
            </template>
            <template v-else>
              <option>Singolo</option>
              <option>Doppio</option>
            </template>
          </select>
          <div class="form-text">Campo obbligatorio per {{ form.sport }}.</div>
        </div>

        <!-- CASACCHE (Calcio/Basket: due colori) -->
        <div
          v-if="form.sport === 'Calcio a 11' || form.sport === 'Calcio a 5' || form.sport === 'Basket'"
          class="mb-4"
        >
          <label class="form-label fw-semibold d-block">Colore casacche (Squadra A vs Squadra B)</label>
          <div class="row g-3">
            <div class="col-md-6">
              <select v-model="form.coloreDivisaA" class="form-select form-select-lg fm-control" required>
                <option value="">Seleziona colore Squadra A</option>
                <option>Bianco</option>
                <option>Nero</option>
                <option>Blu</option>
                <option>Rosso</option>
                <option>Verde</option>
                <option>Giallo</option>
                <option>Arancione</option>
                <option>Viola</option>
                <option>Rosa</option>
                <option>Grigio</option>
              </select>
            </div>
            <div class="col-md-6">
              <select v-model="form.coloreDivisaB" class="form-select form-select-lg fm-control" required>
                <option value="">Seleziona colore Squadra B</option>
                <option>Bianco</option>
                <option>Nero</option>
                <option>Blu</option>
                <option>Rosso</option>
                <option>Verde</option>
                <option>Giallo</option>
                <option>Arancione</option>
                <option>Viola</option>
                <option>Rosa</option>
                <option>Grigio</option>
              </select>
            </div>
          </div>
          <div class="form-text">Obbligatorio per {{ form.sport }}. I colori devono essere diversi.</div>
        </div>

        <!-- COLORE (altri sport: un colore) -->
        <div
          v-else-if="form.sport && !(form.sport === 'Calcio a 11' || form.sport === 'Calcio a 5' || form.sport === 'Basket')"
          class="mb-4"
        >
          <label class="form-label fw-semibold">Colore divisa/casacca</label>
          <select v-model="form.coloreDivisa" class="form-select form-select-lg fm-control" required>
            <option value="">Seleziona un colore</option>
            <option>Bianco</option>
            <option>Nero</option>
            <option>Blu</option>
            <option>Rosso</option>
            <option>Verde</option>
            <option>Giallo</option>
            <option>Arancione</option>
            <option>Viola</option>
            <option>Rosa</option>
            <option>Grigio</option>
          </select>
          <div class="form-text">Campo obbligatorio.</div>
        </div>

        <hr class="fm-divider-brand" />

        <!-- ===================== Quando & Dove ===================== -->
        <h6 class="fm-section-title">Quando & Dove</h6>

        <!-- LUOGO + DATA/ORA -->
        <div class="row g-3 mb-4">
          <div class="col-md-7">
            <label class="form-label fw-semibold">Luogo</label>
            <div class="input-group">
              <span class="input-group-text" aria-hidden="true">📍</span>
              <input id="autocomplete" type="text" class="form-control fm-control" placeholder="Inserisci luogo" v-model="form.location" />
            </div>
          </div>

          <div class="col-md-5">
            <label class="form-label fw-semibold">Data e ora</label>
            <div class="input-group">
              <span class="input-group-text" aria-hidden="true">🗓️</span>
              <input type="datetime-local" v-model="form.date_time" :min="minDateTime" class="form-control fm-control" />
            </div>
          </div>
        </div>

        <!-- INDICAZIONI PRECISE DEL CAMPO -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Indirizzo/indicazioni precise del campo</label>
          <input
            type="text"
            v-model.trim="form.indicazioniCampo"
            class="form-control fm-control"
            placeholder="Es. Via dei Caduti 113, cancello lato nord — oppure 'Spiaggia23'"
            required
          />
          <div class="form-text">Campo obbligatorio: aiuta i partecipanti a trovare esattamente il punto d’incontro.</div>
        </div>

        <hr class="fm-divider-brand" />

        <!-- ===================== Iscrizioni ===================== -->
        <h6 class="fm-section-title">Iscrizioni</h6>

        <!-- MAX PLAYERS (non calcio) -->
        <div v-if="!(form.sport === 'Calcio a 11' || form.sport === 'Calcio a 5')" class="mb-4">
          <label class="form-label fw-semibold">Numero massimo di giocatori</label>
          <input
            type="number"
            v-model.number="form.max_players"
            class="form-control fm-control"
            min="1"
            :max="maxSlots"
          />
          <div class="form-text">
            Nota: il valore inserito rappresenta i posti liberi per altri utenti — l'organizzatore è contato a parte.
          </div>
        </div>

        <!-- RUOLI (calcio) -->
        <div v-else class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label fw-semibold mb-0">Scegli i ruoli che mancano</label>
            <small class="text-muted" v-if="freeMaxSlots > 0">Posti ruoli rimanenti: <strong>{{ remainingSlots }}</strong> / {{ freeMaxSlots }}</small>
          </div>

          <!-- Progress ruoli -->
          <div v-if="freeMaxSlots > 0" class="progress rounded-pill bg-light mb-3 fm-progress">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: (sumRoles && freeMaxSlots ? Math.round((sumRoles / freeMaxSlots) * 100) : 0) + '%' }"
              :aria-valuenow="sumRoles"
              aria-valuemin="0"
              :aria-valuemax="freeMaxSlots"
              :aria-label="`Ruoli selezionati: ${sumRoles} su ${freeMaxSlots}`"
            >
              {{ sumRoles }} / {{ freeMaxSlots }}
            </div>
          </div>

          <!-- Lista ruoli -->
          <div class="list-group fm-roles">
            <div
              v-for="role in displayedRoleList"
              :key="role.key"
              class="list-group-item d-flex align-items-center justify-content-between rounded-3 mb-2 border-0 shadow-sm"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="role-label">
                  <span class="badge fm-role-badge me-2">🎯</span>
                  <strong>{{ role.label }}</strong>
                </div>
                <small class="text-muted d-none d-md-inline">
                  Max {{ roleCaps[role.key] || '—' }}
                </small>
              </div>

              <div class="d-flex align-items-center gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary fm-qty"
                  :aria-label="`Decrementa ${role.label}`"
                  @click="decrementRole(role.key)"
                  :disabled="roles[role.key] === 0"
                >−</button>

                <div class="role-count fm-count" aria-live="polite" aria-atomic="true">
                  {{ roles[role.key] }}
                </div>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary fm-qty"
                  :aria-label="`Incrementa ${role.label}`"
                  @click="incrementRole(role.key)"
                  :disabled="remainingSlots === 0 || isAtCap(role.key)"
                >+</button>
              </div>
            </div>
          </div>

          <div class="form-text mt-2">
            La somma totale di tutti i ruoli non può superare <strong>{{ freeMaxSlots }}</strong>. I conteggi non possono scendere sotto 0.
          </div>
        </div>

        <hr class="fm-divider-brand" />

        <!-- ===================== Extra ===================== -->
        <h6 class="fm-section-title">Extra</h6>

        <!-- PREZZO CAMPO -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Prezzo campo</label>
          <div class="input-group">
            <span class="input-group-text" aria-hidden="true">€</span>
            <input
              type="text"
              v-model.trim="form.prezzoCampo"
              class="form-control fm-control"
              inputmode="decimal"
              placeholder="Es. 2,50 oppure 3.50"
              aria-describedby="help-prezzo"
              required
            />
          </div>
          <div id="help-prezzo" class="form-text">
            Inserisci il prezzo (puoi usare virgola o punto).
          </div>
        </div>

        <!-- DESCRIZIONE -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Altro</label>
          <textarea v-model="form.description" class="form-control fm-control" rows="3" placeholder="Info extra, specifiche luogo..."></textarea>
          <div class="form-text">Le info selezionate sopra (tipologia, prezzo, casacche, indicazioni) verranno inserite automaticamente qui al salvataggio.</div>
        </div>

        <!-- CTA -->
        <div class="text-end">
          <button type="submit" class="btn btn-primary btn-lg px-4 rounded-pill fm-submit" aria-label="Crea partita">
            <span class="me-1">
              <img src="/images/plus.svg" alt="Icona aggiungi partita" width="18" height="18" aria-hidden="true"/>
            </span>
            Crea partita
          </button>
        </div>
      </div>
    </form>

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
</template>



<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'

// ---------------------------
// Stato form
// ---------------------------
const form = ref({
  sport: '',
  location: '',
  date_time: '',
  max_players: '',
  description: '',
  // nuovi/aggiornati
  tipologia: '',          // obbligatoria per Basket/Tennis (dove previsto)
  prezzoCampo: '',        // obbligatoria sempre
  // colori: per Calcio/Basket servono due casacche, per gli altri uno
  coloreDivisa: '',       // usato per sport non a squadre
  coloreDivisaA: '',      // squadra A (Calcio/Basket)
  coloreDivisaB: '',      // squadra B (Calcio/Basket)
  indicazioniCampo: ''    // indirizzo/indicazioni precise (obbligatorio)
})

const messaggio = ref('')
const now = new Date()
const pad = (n) => n.toString().padStart(2, '0')

// ---------------------------
// Ruoli calcio
// ---------------------------
const roles = ref({
  portiere: 0,
  difensore: 0,
  centrocampista: 0,
  attaccante: 0,
  all_around: 0
})

const calcio11RoleList = [
  { key: 'portiere', label: 'Portiere' },
  { key: 'difensore', label: 'Difensore' },
  { key: 'centrocampista', label: 'Centrocampista' },
  { key: 'attaccante', label: 'Attaccante' }
]
const calcio5RoleList = [
  { key: 'portiere', label: 'Portiere' },
  { key: 'all_around', label: 'All-Around' }
]

const displayedRoleList = computed(() => {
  if (form.value.sport === 'Calcio a 11') return calcio11RoleList
  if (form.value.sport === 'Calcio a 5') return calcio5RoleList
  return []
})

const sumRoles = computed(() => {
  return Object.values(roles.value).reduce((s, v) => s + Number(v || 0), 0)
})

const roleCaps = computed(() => {
  if (form.value.sport === 'Calcio a 11') {
    return { portiere: 4, difensore: 10, centrocampista: 8, attaccante: 8, all_around: 0 }
  }
  if (form.value.sport === 'Calcio a 5') {
    return { portiere: 4, difensore: 0, centrocampista: 0, attaccante: 0, all_around: 10 }
  }
  return { portiere: 0, difensore: 0, centrocampista: 0, attaccante: 0, all_around: 0 }
})

function isAtCap(roleKey) {
  const cap = roleCaps.value[roleKey] || 0
  if (!cap) return false
  return Number(roles.value[roleKey] || 0) >= cap
}

// ---------------------------
// Slot e limiti
// ---------------------------
const TEAM_SPORTS = ['Calcio a 11', 'Calcio a 5', 'Basket']
const isTeamSport = computed(() => TEAM_SPORTS.includes(form.value.sport))

const maxSlots = computed(() => {
  switch (form.value.sport) {
    case 'Calcio a 11':   return 30
    case 'Calcio a 5':    return 14
    case 'Basket': {
      // vincolo 1v1 → max 1 posto libero (organizzatore escluso)
      const tip = (form.value.tipologia || '').toLowerCase()
      if (tip.includes('1v1')) return 1
      return 11
    }
    case 'Pallavolo':     return 13
    case 'Padel':         return 3
    case 'Tennis':        return 3
    case 'Beach Volley':  return 3
    case 'Racchettoni':   return 3
    default:              return 0
  }
})

// calcio usa freeMaxSlots/roles, non il campo numerico
const freeMaxSlots = computed(() => {
  if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
    return Math.max(0, maxSlots.value - 1) // esclude l'organizzatore
  }
  return 0
})

const remainingSlots = computed(() => {
  if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
    return Math.max(0, freeMaxSlots.value - sumRoles.value)
  }
  return 0
})

function incrementRole(roleKey) {
  if (freeMaxSlots.value === 0) return
  if (remainingSlots.value <= 0) return
  const cap = roleCaps.value[roleKey] || Infinity
  if (Number(roles.value[roleKey] || 0) >= cap) return
  roles.value[roleKey] = Number(roles.value[roleKey] || 0) + 1
}
function decrementRole(roleKey) {
  roles.value[roleKey] = Math.max(0, Number(roles.value[roleKey] || 0) - 1)
}

// reset quando cambia sport
watch(() => form.value.sport, () => {
  Object.keys(roles.value).forEach(k => (roles.value[k] = 0))
  form.value.tipologia = ''
  form.value.coloreDivisa = ''
  form.value.coloreDivisaA = ''
  form.value.coloreDivisaB = ''
})

// clamp per Basket 1v1
watch(
  () => [form.value.sport, form.value.tipologia],
  () => {
    if (form.value.sport === 'Basket' && (form.value.tipologia || '').toLowerCase().includes('1v1')) {
      form.value.max_players = 1
    }
  },
  { immediate: true }
)

// ---------------------------
// Helper nuovi campi
// ---------------------------
function normalizeAndFormatEuro(value) {
  if (!value) return null
  const n = Number(String(value).replace(',', '.'))
  if (Number.isNaN(n)) return null
  return n.toFixed(2).replace('.', ',') // formato "X,YY"
}

function buildExtraDescription() {
  const pezzi = []

  // Tipologia (se applicabile)
  if (form.value.sport === 'Basket' || form.value.sport === 'Tennis') {
    pezzi.push(`Tipologia: ${form.value.tipologia}`)
  }

  // Prezzo
  const prezzoFmt = normalizeAndFormatEuro(form.value.prezzoCampo)
  pezzi.push(`Prezzo campo: € ${prezzoFmt}`)

  // Casacche / Colori
  if (isTeamSport.value) {
    pezzi.push(`Casacche: ${form.value.coloreDivisaA} vs ${form.value.coloreDivisaB}`)
  } else {
    pezzi.push(`Colore divisa: ${form.value.coloreDivisa}`)
  }

  // Indicazioni precise del campo
  pezzi.push(`Indicazioni campo: ${form.value.indicazioniCampo}`)

  return pezzi.join('\n')
}

// ---------------------------
// Submit
// ---------------------------
const creaPartita = async () => {
  // Validazioni base
  if (!form.value.sport) {
    showToast('Devi selezionare uno sport.', 'warning')
    return
  }

  const isCalcio = form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5'

  // Tipologia obbligatoria per Basket/Tennis
  if ((form.value.sport === 'Basket' || form.value.sport === 'Tennis') && !form.value.tipologia) {
    showToast('Seleziona la tipologia.', 'warning')
    return
  }

  // Prezzo campo obbligatorio + formato
  const prezzoFmt = normalizeAndFormatEuro(form.value.prezzoCampo)
  if (!prezzoFmt) {
    showToast('Inserisci un prezzo valido (es. 2,50 o 2.50).', 'warning')
    return
  }

  // Colori obbligatori
  if (isTeamSport.value) {
    if (!form.value.coloreDivisaA || !form.value.coloreDivisaB) {
      showToast('Seleziona i colori di entrambe le casacche.', 'warning')
      return
    }
    if (form.value.coloreDivisaA === form.value.coloreDivisaB) {
      showToast('Le due casacche devono avere colori diversi.', 'warning')
      return
    }
  } else {
    if (!form.value.coloreDivisa) {
      showToast('Seleziona il colore della divisa/casacca.', 'warning')
      return
    }
  }

  // Indicazioni campo obbligatorie
  if (!form.value.indicazioniCampo || !form.value.indicazioniCampo.trim()) {
    showToast('Inserisci l’indirizzo o indicazioni precise del campo.', 'warning')
    return
  }

  // max_players/ruoli
  if (!isCalcio) {
    if (!form.value.max_players || form.value.max_players <= 0) {
      showToast('Specifica il numero di giocatori.', 'warning')
      return
    }
    // Basket 1v1 → deve essere 1
    if (form.value.sport === 'Basket' && (form.value.tipologia || '').toLowerCase().includes('1v1') && Number(form.value.max_players) !== 1) {
      showToast('Per 1v1 il numero deve essere 1.', 'warning')
      form.value.max_players = 1
      return
    }
  } else {
    if (sumRoles.value === 0) {
      showToast('Seleziona almeno un ruolo per il calcio.', 'warning')
      return
    }
  }

  if (!form.value.location.trim()) {
    showToast('Inserisci un luogo per la partita.', 'warning')
    return
  }
  if (!form.value.date_time) {
    showToast('Specifica data e ora della partita.', 'warning')
    return
  }

  try {
    const organizer_id = localStorage.getItem('userId')
    if (!organizer_id) {
      showToast('Devi essere loggato per creare una partita.', 'warning', 6000)
      return
    }

    // vincoli calcio
    if (isCalcio && sumRoles.value > freeMaxSlots.value) {
      showToast(`La somma dei ruoli non può superare ${freeMaxSlots.value} (escludendo il creatore).`, 'warning', 6000)
      return
    }
    if (isCalcio) {
      for (const [k, v] of Object.entries(roles.value)) {
        const cap = roleCaps.value[k] || Infinity
        if (v > 0 && v > cap) {
          showToast(`Hai superato il massimo per ${k.replace('_', ' ')} (${cap}).`, 'warning', 6000)
          return
        }
      }
    }

    // Componi descrizione finale
    const extraBlock = buildExtraDescription()
    const userText = form.value.description?.trim()
    const finalDescription = extraBlock + (userText ? `\n\n${userText}` : '')

    // payload
    let nuovaPartita = {
      sport: form.value.sport,
      location: form.value.location,
      date_time: form.value.date_time,
      description: finalDescription,
      organizer_id
    }

    if (isCalcio) {
      const rolesNeededObj = {}
      Object.keys(roles.value).forEach(k => {
        const v = Number(roles.value[k] || 0)
        if (v > 0) rolesNeededObj[k] = v
      })
      nuovaPartita.max_players = null
      nuovaPartita.roles_needed = rolesNeededObj
    } else {
      const uiFree = Number(form.value.max_players) || 0
      nuovaPartita.max_players = uiFree > 0 ? uiFree + 1 : null // include l'organizzatore
    }

    await axios.post('http://localhost:3000/api/partite', nuovaPartita)

    showToast('Partita creata con successo!', 'success', 5000)

    // reset form e ruoli
    form.value = {
      sport: '',
      location: '',
      date_time: '',
      max_players: '',
      description: '',
      tipologia: '',
      prezzoCampo: '',
      coloreDivisa: '',
      coloreDivisaA: '',
      coloreDivisaB: '',
      indicazioniCampo: ''
    }
    Object.keys(roles.value).forEach(k => (roles.value[k] = 0))
  } catch (err) {
    console.error('Errore nella creazione della partita:', err)
    const msg = err.response?.data?.error || 'Errore durante la creazione della partita.'
    showToast(msg, 'danger', 6000)
  }
}

// ---------------------------
// Min datetime per il picker
// ---------------------------
const minDateTime = computed(() => {
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

// ---------------------------
// Toast
// ---------------------------
const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success')

const toastIcon = computed(() => ({
  success: '✅',
  danger: '🛑',
  warning: '⚠️'
}[toastVariant.value] || 'ℹ️'))

const toastVariantClass = computed(() => ({
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-dark'
}[toastVariant.value] || 'bg-info text-white'))

function showToast(message, variant = 'success', delayMs = 5000) {
  toastMessage.value = message
  toastVariant.value = variant
  const t = new bootstrap.Toast(toastEl.value, { autohide: true, animation: true, delay: delayMs })
  t.show()
}

// ---------------------------
// Google Places Autocomplete
// ---------------------------
onMounted(() => {
  const input = document.getElementById('autocomplete')

  if (window.google && google.maps && google.maps.places) {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['geocode'],
      componentRestrictions: { country: 'it' }
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      form.value.location = place.formatted_address || input.value
    })
  } else {
    console.warn('Google Maps API non è ancora pronta.')
  }
})
</script>