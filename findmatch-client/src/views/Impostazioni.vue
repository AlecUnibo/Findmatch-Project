<template>
  <div class="container mt-5">
    <div class="card shadow p-4">
      <h2 class="mb-4">Impostazioni account</h2>

      <!-- Sezione Profilo -->
      <div class="mb-4">
        <h5>Profilo</h5>
        <p><strong>• Username:</strong> {{ username }}</p>
        <p><strong>• Email:</strong> {{ email }}</p>
      </div>

      <hr />

      <!-- Cambio password -->
      <div class="mb-4">
        <h5>Cambia password</h5>
        <form @submit.prevent="cambiaPassword">
          <div class="mb-2">
            <input v-model="oldPassword" type="password" class="form-control" placeholder="Password attuale" required />
          </div>
          <div class="mb-2">
            <input v-model="newPassword" type="password" class="form-control" placeholder="Nuova password" required />
          </div>
          <div class="mb-3">
            <input v-model="confirmPassword" type="password" class="form-control" placeholder="Conferma nuova password" required />
          </div>
          <button type="submit" class="btn btn-primary">Aggiorna password</button>
        </form>
      </div>

      <hr />

      <!-- Notifiche -->
      <div class="mb-4">
        <h5>Notifiche</h5>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="emailNotifiche" id="notificheEmail">
          <label class="form-check-label" for="notificheEmail">
            Ricevi notifiche via email
          </label>
        </div>
      </div>

      <hr />

      <!-- Eliminazione account -->
      <div class="mb-2">
        <h5 class="text-danger">Elimina account</h5>
        <p class="text-muted small">Questa azione è irreversibile. Tutti i tuoi dati verranno cancellati.</p>
        <button class="btn btn-outline-danger" @click="confermaEliminazione = true">Elimina account</button>

        <div v-if="confermaEliminazione" class="mt-3">
          <p>Sei sicuro? Questa azione è permanente.</p>
          <button class="btn btn-danger me-2" @click="eliminaAccount">Conferma eliminazione</button>
          <button class="btn btn-secondary" @click="confermaEliminazione = false">Annulla</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const userId = localStorage.getItem('userId')
const username = localStorage.getItem('userName')
const email = ref('')

// Cambio password
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const cambiaPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('❌ Le password non corrispondono.')
    return
  }

  try {
    await axios.put(`http://localhost:3000/api/users/change-password`, {
      userId: userId,
      currentPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    alert('Password aggiornata con successo.')
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    alert('❌ Errore durante il cambio password.')
    console.error(err)
  }
}

// Notifiche
const emailNotifiche = ref(true)

// Eliminazione account
const confermaEliminazione = ref(false)

const eliminaAccount = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/users/${userId}`)
    alert('Account eliminato.')
    localStorage.clear()
    window.location.href = '/'
  } catch (err) {
    alert('❌ Errore durante l\'eliminazione account.')
    console.error(err)
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}`)
    email.value = data.email
  } catch (err) {
    console.error('Errore nel recupero email:', err)
  }
})

</script>

<style scoped>
.card h5 {
  font-weight: 600;
}
</style>
