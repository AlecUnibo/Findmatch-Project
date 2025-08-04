<template>
  <div class="container mt-5">
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

      <div class="mb-3">
        <label class="form-label">Numero massimo di giocatori</label>
        <input type="number" v-model="form.max_players" class="form-control" required min="1" />
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

const creaPartita = async () => {
  try {
    const organizer_id = localStorage.getItem('userId')

    if (!organizer_id) {
      alert('Utente non autenticato.')
      return
    }

    const nuovaPartita = {
      ...form.value,
      organizer_id
    }

    await axios.post('http://localhost:3000/api/partite', nuovaPartita)

    messaggio.value = 'Partita creata con successo!'
    form.value = { sport: '', location: '', date_time: '', max_players: '', description: '' }
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

