<template>
  <div class="component-crea-partita container mt-5">
    <h2 class="mb-4 text-center">📝 Crea una nuova partita</h2>

    <form @submit.prevent="creaPartita" class="card p-4 shadow mb-5">
      <div class="mb-3">
        <label class="form-label">Sport</label>
        <select v-model="form.sport" class="form-select" required>
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

      <!-- Se sport NON è Calcio a 11 o Calcio a 5 mostra numero massimo -->
      <div v-if="!(form.sport === 'Calcio a 11' || form.sport === 'Calcio a 5')" class="mb-3">
        <label class="form-label">Numero massimo di giocatori</label>
        <input type="number" v-model.number="form.max_players" class="form-control" required min="1" />
      </div>

      <!-- Se sport è Calcio a 11 o Calcio a 5 mostra selezione ruoli mancanti -->
      <div v-else class="mb-3">
        <label class="form-label">Scegli i ruoli che mancano</label>

        <div class="mb-2" v-if="maxSlots > 0">
          <small class="text-muted">Posti ruoli rimanenti: <strong>{{ remainingSlots }}</strong> / {{ maxSlots }}</small>
        </div>

        <div class="list-group">
          <div
            v-for="role in displayedRoleList"
            :key="role.key"
            class="list-group-item d-flex align-items-center justify-content-between"
          >
            <div class="d-flex align-items-center gap-3">
              <div class="role-label">
                <strong>{{ role.label }}</strong>
              </div>
              <small class="text-muted">Puoi inserire 0 o più.</small>
            </div>

            <div class="d-flex align-items-center gap-2">
              <!-- decrement -->
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                :aria-label="`Decrementa ${role.label}`"
                @click="decrementRole(role.key)"
                :disabled="roles[role.key] === 0"
              >
                ▼
              </button>

              <div class="role-count border rounded px-3 py-1 text-center">
                {{ roles[role.key] }}
              </div>

              <!-- increment -->
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                :aria-label="`Incrementa ${role.label}`"
                @click="incrementRole(role.key)"
                :disabled="remainingSlots === 0"
              >
                ▲
              </button>
            </div>
          </div>
        </div>

        <div class="form-text mt-2">
          Nota: la somma totale di tutti i ruoli non può superare <strong>{{ maxSlots }}</strong>. I conteggi non possono scendere sotto 0.
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Luogo</label>
        <input id="autocomplete" type="text" class="form-control" placeholder="Inserisci luogo" v-model="form.location" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Data e ora</label>
        <input type="datetime-local" v-model="form.date_time" :min="minDateTime" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Altro</label>
        <textarea v-model="form.description" class="form-control" rows="3" placeholder="Info extra, specifiche luogo..."></textarea>
      </div>

      <div class="text-end">
        <button type="submit" class="btn btn-primary">Crea partita</button>
      </div>
    </form>

    <div v-if="messaggio" class="alert alert-success mt-3 text-center">
      {{ messaggio }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

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

// maxSlots dinamico: 21 per Calcio a 11, 9 per Calcio a 5, altrimenti 0
const maxSlots = computed(() => {
  if (form.value.sport === 'Calcio a 11') return 21
  if (form.value.sport === 'Calcio a 5') return 9
  return 0
})

const remainingSlots = computed(() => Math.max(0, maxSlots.value - sumRoles.value))

// incrementa / decrementa (rispettando i limiti)
function incrementRole(roleKey) {
  if (maxSlots.value === 0) return
  if (remainingSlots.value <= 0) return
  roles.value[roleKey] = Number(roles.value[roleKey] || 0) + 1
}

function decrementRole(roleKey) {
  roles.value[roleKey] = Math.max(0, Number(roles.value[roleKey] || 0) - 1)
}

// RESET: azzera TUTTI i ruoli ogni volta che cambio sport (richiesta)
watch(() => form.value.sport, (nv, ov) => {
  // Azzeriamo sempre tutti i contatori dei ruoli quando cambia lo sport
  Object.keys(roles.value).forEach(k => roles.value[k] = 0)

  // (Opzionale) se vuoi resettare anche max_players quando passi a calcio, puoi farlo qui:
  // if (nv === 'Calcio a 11' || nv === 'Calcio a 5') form.value.max_players = ''
  // else form.value.max_players = form.value.max_players
})

const creaPartita = async () => {
  try {
    const organizer_id = localStorage.getItem('userId')

    if (!organizer_id) {
      alert('Utente non autenticato.')
      return
    }

    if ((form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') && sumRoles.value > maxSlots.value) {
      alert(`La somma dei ruoli non può superare ${maxSlots.value}.`)
      return
    }

    // Costruisci il payload
    let nuovaPartita = {
      ...form.value,
      organizer_id
    }

    if (form.value.sport === 'Calcio a 11' || form.value.sport === 'Calcio a 5') {
      // roles_needed = oggetto con ruoli con valore > 0 (chiavi come in roles)
      const rolesNeededObj = {}
      Object.keys(roles.value).forEach(k => {
        const v = Number(roles.value[k] || 0)
        if (v > 0) rolesNeededObj[k] = v
      })

      nuovaPartita = {
        ...nuovaPartita,
        max_players: null,
        roles_needed: rolesNeededObj
      }
    } else {
      nuovaPartita.max_players = Number(form.value.max_players) || null
    }

    await axios.post('http://localhost:3000/api/partite', nuovaPartita)

    messaggio.value = 'Partita creata con successo!'
    form.value = { sport: '', location: '', date_time: '', max_players: '', description: '' }
    Object.keys(roles.value).forEach(k => roles.value[k] = 0)
  } catch (err) {
    console.error('Errore nella creazione della partita:', err)
    alert('Errore durante la creazione della partita.')
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
