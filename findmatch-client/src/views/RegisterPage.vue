<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <!-- Toasts -->
    <div class="fm-toast-container " aria-live="polite" aria-atomic="true">
      <transition-group name="toast" tag="div">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="fm-toast shadow-lg"
          :class="t.type === 'success' ? 'fm-toast--success' : 'fm-toast--error'"
          role="status"
        >
          <div class="fm-toast-icon" aria-hidden="true">
            <span v-if="t.type === 'success'">✔️</span>
            <span v-else>❌</span>
          </div>
          <div class="fm-toast-body">
            <strong class="d-block mb-1">{{ t.title }}</strong>
            <div class="small">{{ t.message }}</div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Card registrazione -->
    <div class="card shadow p-4 register-card">
      <h3 class="mb-4 text-center">Registrati su Findmatch</h3>

      <form @submit.prevent="handleRegister" aria-label="Modulo registrazione">
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

        <button type="submit" class="btn w-100 text-white fw-semibold fm-btn-primary" :disabled="isSubmitting" aria-label="Registrati">
          <span v-if="!isSubmitting">Registrati</span>
          <span v-else>Registrazione in corso…</span>
        </button>

        <!-- Messaggio testuale accessibile (oltre al toast) -->
        <p class="text-danger mt-3 text-center" v-if="errorMessage" role="status" aria-live="polite">
          {{ errorMessage }}
        </p>
      </form>

      <div class="text-center mt-3">
        <router-link to="/" aria-label="Torna al login">Torna alla Welcome Page</router-link>
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

const isSubmitting = ref(false)

/* ---------------------------
   Mini-sistema Toast locale
----------------------------*/
const toasts = ref([])
let toastId = 0

function showToast({ type = 'success', title = '', message = '', timeout = 3500 }) {
  const id = ++toastId
  toasts.value.push({ id, type, title, message })

  // autodismiss
  setTimeout(() => dismissToast(id), timeout)
}

function dismissToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

/* ---------------------------
   Submit Registrazione
----------------------------*/
const handleRegister = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await registerUser(nome.value, cognome.value, username.value, email.value, password.value)

    showToast({
      type: 'success',
      title: 'Registrazione completata',
      message: 'Account creato con successo! Ora puoi accedere.'
    })

    // Mostra il toast e poi vai al login
    setTimeout(() => router.push('/'), 900)
  } catch (err) {
    const msg =
      err?.response?.data?.message
      || err?.message
      || 'Errore durante la registrazione.'

    errorMessage.value = msg

    showToast({
      type: 'error',
      title: 'Registrazione fallita',
      message: msg
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>