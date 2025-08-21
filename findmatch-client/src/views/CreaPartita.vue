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

      <div class="mb-3">
        <label class="form-label">Luogo</label>
        <input id="autocomplete" type="text" class="form-control" placeholder="Inserisci luogo" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Data e ora</label>
        <input type="datetime-local" v-model="form.date_time" :min="minDateTime" class="form-control" required />
      </div>

      <!-- Se sport != Calcio a 11 mostra numero massimo (comportamento originale) -->
      <div v-if="form.sport !== 'Calcio a 11'" class="mb-3">
        <label class="form-label">Numero massimo di giocatori</label>
        <input type="number" v-model.number="form.max_players" class="form-control" required min="1" />
      </div>

      <!-- Se sport == Calcio a 11 mostra selezione ruoli mancanti (ora supporta più ruoli e conteggi) -->
      <div v-else class="mb-3">
        <label class="form-label">Scegli i ruoli che mancano</label>

        <div class="mb-2">
          <small class="text-muted">Posti ruoli rimanenti: <strong>{{ remainingSlots }}</strong> / 10</small>
        </div>

        <div class="list-group">
          <div
            v-for="role in roleList"
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

              <!-- valore (readonly) -->
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
          Nota: la somma totale di tutti i ruoli non può superare <strong>10</strong>. I conteggi non possono scendere sotto 0.
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Info & Luogo</label>
        <textarea v-model="form.description" class="form-control" rows="3" required></textarea>
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
import { ref, onMounted, computed } from 'vue'
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

// Ruoli per Calcio a 11: ora possono avere valori >= 0
const roles = ref({
  portiere: 0,
  difensore: 0,
  centrocampista: 0,
  attaccante: 0
})

// array per iterazione con label leggibile
const roleList = [
  { key: 'portiere', label: 'Portiere' },
  { key: 'difensore', label: 'Difensore' },
  { key: 'centrocampista', label: 'Centrocampista' },
  { key: 'attaccante', label: 'Attaccante' }
]

// somma dei ruoli selezionati (utile per logica di abilitazione)
const sumRoles = computed(() => {
  return Object.values(roles.value).reduce((s, v) => s + Number(v || 0), 0)
})

// remaining slots (10 è il limite totale)
const remainingSlots = computed(() => Math.max(0, 10 - sumRoles.value))

// incrementa: aumenta di 1 il ruolo (fino al limite totale)
function incrementRole(roleKey) {
  if (remainingSlots.value <= 0) return
  // incrementa il singolo ruolo
  roles.value[roleKey] = Number(roles.value[roleKey] || 0) + 1
}

// decrementa: diminuisce di 1 il ruolo (mai sotto 0)
function decrementRole(roleKey) {
  roles.value[roleKey] = Math.max(0, Number(roles.value[roleKey] || 0) - 1)
}

const creaPartita = async () => {
  try {
    const organizer_id = localStorage.getItem('userId')

    if (!organizer_id) {
      alert('Utente non autenticato.')
      return
    }

    // Validazione lato client: per calcio a 11, assicurati che la somma non superi 10 (dovrebbe essere garantito dalla UI)
    if (form.value.sport === 'Calcio a 11' && sumRoles.value > 10) {
      alert('La somma dei ruoli non può superare 10.')
      return
    }

    // Costruisci il payload
    let nuovaPartita = {
      ...form.value,
      organizer_id
    }

    if (form.value.sport === 'Calcio a 11') {
      // roles_needed = oggetto con ruoli con valore > 0
      const rolesNeededObj = {}
      Object.keys(roles.value).forEach(k => {
        const v = Number(roles.value[k] || 0)
        if (v > 0) rolesNeededObj[k] = v
      })

      nuovaPartita = {
        ...nuovaPartita,
        // rimuoviamo max_players perché non rilevante per questo sport
        max_players: null,
        roles_needed: rolesNeededObj
      }
    } else {
      // assicurati che max_players sia un numero valido
      nuovaPartita.max_players = Number(form.value.max_players) || null
    }

    await axios.post('http://localhost:3000/api/partite', nuovaPartita)

    messaggio.value = 'Partita creata con successo!'
    form.value = { sport: '', location: '', date_time: '', max_players: '', description: '' }
    // reset ruoli quando torni al form vuoto
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
