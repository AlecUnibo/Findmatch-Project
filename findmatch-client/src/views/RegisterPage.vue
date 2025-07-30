<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card shadow p-4" style="width: 400px;">
      <h3 class="mb-4 text-center">Registrati su Findmatch</h3>

      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label for="nome" class="form-label">Nome:</label>
          <input type="text" id="nome" v-model="nome" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="cognome" class="form-label">Cognome:</label>
          <input type="text" id="cognome" v-model="cognome" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="username" class="form-label">Nome utente:</label>
          <input type="text" id="username" v-model="username" class="form-control" required />
        </div>
        
        <div class="mb-3">
          <label for="email" class="form-label">Email:</label>
          <input type="email" id="email" v-model="email" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password:</label>
          <input type="password" id="password" v-model="password" class="form-control" required />
        </div>

        <button type="submit" class="btn btn-success w-100">Registrati</button>

        <p class="text-danger mt-3 text-center" v-if="errorMessage">{{ errorMessage }}</p>
      </form>

      <div class="text-center mt-3">
        <router-link to="/">Torna al login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../services/authService'

const router = useRouter()

const nome = ref('')
const cognome = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  try {
    await registerUser(nome.value, cognome.value, username.value, email.value, password.value)
    router.push('/')
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Errore durante la registrazione.'
  }
}
</script>
