<template>
  <div class="component-login d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card shadow p-4 text-center" style="width: 400px;">
      
      <!-- LOGO -->
      <div class="d-flex justify-content-center mb-3">
        <img src="/images/logo_login.png" alt="Logo Findmatch" class="login-logo" />
      </div>

      <h3 class="mb-4">Accedi</h3>

      <form @submit.prevent="handleLogin">
        <div class="mb-3 text-start">
          <label for="email" class="form-label">Email:</label>
          <input type="email" id="email" v-model="email" class="form-control" required />
        </div>

        <div class="mb-3 text-start">
          <label for="password" class="form-label">Password:</label>
          <input type="password" id="password" v-model="password" class="form-control" required />
        </div>

        <button type="submit" class="btn btn-primary w-100">Accedi</button>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <router-link to="/register" class="small">Registrati</router-link>
          <div class="form-check">
            <input type="checkbox" id="remember" class="form-check-input" />
            <label for="remember" class="form-check-label small">Ricordami</label>
          </div>
        </div>

        <p class="text-danger mt-3 text-center" v-if="errorMessage">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { loginUser } from '../services/authService'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await loginUser(email.value, password.value)
    localStorage.setItem('token', response.token)
    localStorage.setItem('userName', response.user.username)
    localStorage.setItem('userId', response.user.id)

    // Reindirizza alla pagina home
    router.push('/home')
  } catch (error) {
    errorMessage.value = 'Email o password non validi.'
  }
}
</script>
