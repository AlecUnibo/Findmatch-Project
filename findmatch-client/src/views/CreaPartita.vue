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

        <!-- MAX PLAYERS (non calcio) -->
        <div v-if="!(form.sport === 'Calcio a 11' || form.sport === 'Calcio a 5')" class="mb-4">
          <label class="form-label fw-semibold">
            Numero massimo di giocatori
          </label>
          <input
            type="number"
            v-model.number="form.max_players"
            class="form-control fm-control"
            min="1"
            :max="maxSlots"
          />
          <div class="form-text">
            Nota: il valore inserito rappresenta i posti liberi per altri utenti — il sistema considera l'organizzatore a parte.
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
            >
              {{ sumRoles }} / {{ freeMaxSlots }}
            </div>
          </div>

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
                <!-- decrement -->
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

                <!-- increment -->
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

        <!-- DESCRIZIONE -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Altro</label>
          <textarea v-model="form.description" class="form-control fm-control" rows="3" placeholder="Info extra, specifiche luogo..."></textarea>
        </div>

        <!-- CTA -->
        <div class="text-end">
          <button type="submit" class="btn btn-primary btn-lg px-4 rounded-pill fm-submit" aria-label="Crea partita">
            <span class="me-1"><img src="/images/plus.svg" alt="Icona aggiungi partita" width="18" height="18" aria-hidden="true"/></span> Crea partita
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


const form = ref({
  sport: '',
  location: '',
  date_time: '',
  max_players: '',
  description: ''
})

const messaggio = ref('')
const now = new Date()
const pad = (n) => n.toString().padStart(2, '0')

 // Ruoli: includiamo tutte le possibili chiavi (calcio a 11 e calcio a 5)
const roles = ref({
  portiere: 0,
  difensore: 0,
  centrocampista: 0,
  attaccante: 0,
  all_around: 0
})

// liste etichette (usate per visualizzare solo i ruoli pertinenti)
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

// lista dinamica mostrata in template (a seconda dello sport)
const displayedRoleList = computed(() => {
  if (form.value.sport === 'Calcio a 11') return calcio11RoleList
  if (form.value.sport === 'Calcio a 5') return calcio5RoleList
  return []
})

// somma dei ruoli selezionati
const sumRoles = computed(() => {
  return Object.values(roles.value).reduce((s, v) => s + Number(v || 0), 0)
})

// Limiti massimi per ruolo in base allo sport
const roleCaps = computed(() => {
  if (form.value.sport === 'Calcio a 11') {
    return { portiere: 4, difensore: 10, centrocampista: 8, attaccante: 8, all_around: 0 }
  }
  if (form.value.sport === 'Calcio a 5') {
    return { portiere: 4, difensore: 0, centrocampista: 0, attaccante: 0, all_around: 10 }
  }
  // default (nessun limite applicato perché non si mostrano i ruoli)
  return { portiere: 0, difensore: 0, centrocampista: 0, attaccante: 0, all_around: 0 }
})

// Utility: il ruolo è al cap?
function isAtCap(roleKey) {
  const cap = roleCaps.value[roleKey] || 0
  if (!cap) return false
  return Number(roles.value[roleKey] || 0) >= cap
}

// maxSlots dinamico (TOTALE giocatori, incluso l'organizzatore)
const maxSlots = computed(() => {
  switch (form.value.sport) {
    case 'Calcio a 11':   return 31
    case 'Calcio a 5':    return 15
    case 'Basket':        return 12
    case 'Pallavolo':     return 14
    case 'Padel':         return 4
    case 'Tennis':        return 4
    case 'Beach Volley':  return 4
    case 'Beach Tennis':  return 4
    default:              return 0
  }
})


// freeMaxSlots: il numero di posti liberi che l'organizzatore può chiedere per ALTRI UTENTI
// esclude l'organizzatore stesso (-1). Usato per la validazione e la UI.
const freeMaxSlots = computed(() => {
  if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
    return Math.max(0, maxSlots.value - 1)
  }
  return 0
})

// remainingSlots: quanti posti liberi restano per i ruoli (calcio). È basato su freeMaxSlots.
const remainingSlots = computed(() => {
  if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
    return Math.max(0, freeMaxSlots.value - sumRoles.value)
  }
  return 0
})

// incrementa / decrementa (rispettando i limiti)
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


// RESET: azzera TUTTI i ruoli ogni volta che cambio sport (richiesta)
watch(() => form.value.sport, (nv, ov) => {
  // Azzeriamo sempre tutti i contatori dei ruoli quando cambia lo sport
  Object.keys(roles.value).forEach(k => roles.value[k] = 0)
})

const creaPartita = async () => {
  // --- VALIDAZIONE UNIFICATA ---
  if (!form.value.sport) {
    showToast('Devi selezionare uno sport.', 'warning');
    return;
  }
  const isCalcio = form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5';
  if (!isCalcio && (!form.value.max_players || form.value.max_players <= 0)) {
    showToast('Specifica il numero di giocatori.', 'warning');
    return;
  }
  if (isCalcio && sumRoles.value === 0) {
    showToast('Seleziona almeno un ruolo per il calcio.', 'warning');
    return;
  }
  if (!form.value.location.trim()) {
    showToast('Inserisci un luogo per la partita.', 'warning');
    return;
  }
  if (!form.value.date_time) {
    showToast('Specifica data e ora della partita.', 'warning');
    return;
  }
  if (!form.value.description.trim()) {
    showToast('Inserisci qualche informazione extra.', 'warning');
    return;
  }
  // --- FINE VALIDAZIONE ---

  try {
    const organizer_id = localStorage.getItem('userId')
    if (!organizer_id) {
      showToast('Devi essere loggato per creare una partita.', 'warning', 6000)
      return
    }

    // Validazione per calcio: la somma dei ruoli (posti per altri utenti) non può superare freeMaxSlots
    if ((form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') && sumRoles.value > freeMaxSlots.value) {
      showToast(`La somma dei ruoli non può superare ${freeMaxSlots.value} (escludendo il creatore).`, 'warning', 6000)
      return
    }

    let nuovaPartita = { ...form.value, organizer_id }

    if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
      const rolesNeededObj = {}
      Object.keys(roles.value).forEach(k => {
        const v = Number(roles.value[k] || 0)
        if (v > 0) rolesNeededObj[k] = v
      })
      nuovaPartita = { ...nuovaPartita, max_players: null, roles_needed: rolesNeededObj }
    } else {
      nuovaPartita.max_players = Number(form.value.max_players) ? Number(form.value.max_players) : null
    }


    // Check somma totale come già fai
    if ((form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') && sumRoles.value > freeMaxSlots.value) {
      showToast(`La somma dei ruoli non può superare ${freeMaxSlots.value} (escludendo il creatore).`, 'warning', 6000)
      return
    }

    // Check per-ruolo (difensivo; il + è già bloccato in UI)
    if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
      for (const [k, v] of Object.entries(roles.value)) {
        const cap = roleCaps.value[k] || Infinity
        if (v > 0 && v > cap) {
          showToast(`Hai superato il massimo per ${k.replace('_', ' ')} (${cap}).`, 'warning', 6000)
          return
        }
      }
    }

    await axios.post('http://localhost:3000/api/partite', nuovaPartita)

    showToast('Partita creata con successo!', 'success', 5000)

    // reset form
    form.value = { sport: '', location: '', date_time: '', max_players: '', description: '' }
    Object.keys(roles.value).forEach(k => roles.value[k] = 0)
  } catch (err) {
    console.error('Errore nella creazione della partita:', err)
    const msg = err.response?.data?.error || 'Errore durante la creazione della partita.'
    showToast(msg, 'danger', 6000)
  }
}

const minDateTime = computed(() => {
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success')

const toastIcon = computed(() => ({ success:'✅', danger:'🛑', warning:'⚠️' }[toastVariant.value] || 'ℹ️'))
const toastVariantClass = computed(() => ({
  success: 'bg-success text-white',
  danger:  'bg-danger text-white',
  warning: 'bg-warning text-dark'
}[toastVariant.value] || 'bg-info text-white')) 

function showToast(message, variant = 'success', delayMs = 5000) {
  toastMessage.value = message
  toastVariant.value = variant
  const t = new bootstrap.Toast(toastEl.value, { autohide: true, animation: true, delay: delayMs })
  t.show()
}


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
