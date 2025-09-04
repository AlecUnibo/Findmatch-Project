<template>
  <div class="component-settings container mt-5">
    <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
      <!-- Header -->
      <div class="settings-header p-4 p-md-5 d-flex align-items-center justify-content-between">
        <div>
          <h2 class="mb-1 text-white">Impostazioni account</h2>
          <p class="mb-0 text-white-50 small">Gestisci profilo, sicurezza e preferenze.</p>
        </div>
      </div>

      <div class="p-4 p-md-5">
        <!-- Profilo -->
        <section class="setting-section mb-4">
          <div class="section-title mb-3">
            <h3 class="mb-0">Profilo</h3>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <div class="info-tile">
                <div class="label">Username</div>
                <div class="value">{{ username }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-tile">
                <div class="label">Email</div>
                <div class="value">{{ email }}</div>
              </div>
            </div>
          </div>
        </section>

        <hr class="settings-divider" />

        <!-- Cambio password -->
        <section class="setting-section mb-4">
          <div class="section-title mb-3">
            <h3 class="mb-0">Cambia password</h3>
          </div>

          <form @submit.prevent="cambiaPassword" class="row g-3" aria-label="Cambia password">
            <div class="col-12 col-md-4">
              <div class="form-floating">
                <input v-model="oldPassword" type="password" class="form-control fm-control" id="oldPwd" placeholder="Password attuale" required />
                <label for="oldPwd">Password attuale</label>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="form-floating">
                <input v-model="newPassword" type="password" class="form-control fm-control" id="newPwd" placeholder="Nuova password" required />
                <label for="newPwd">Nuova password</label>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="form-floating">
                <input v-model="confirmPassword" type="password" class="form-control fm-control" id="confirmPwd" placeholder="Conferma nuova password" required />
                <label for="confirmPwd">Conferma nuova password</label>
              </div>
            </div>

            <div class="col-12">
              <div class="d-flex align-items-center gap-3">
                <button type="submit" class="btn btn-gradient-primary px-4" aria-label="Aggiorna password">
                  Aggiorna password
                </button>
                <small class="text-muted">
                  Suggerimento: usa almeno 12 caratteri con numeri e simboli.
                </small>
              </div>
            </div>
          </form>
        </section>

        <hr class="settings-divider" />

        <!-- Notifiche -->
        <section class="setting-section mb-4">
          <div class="section-title mb-3">
            <h3 class="mb-0">Notifiche</h3>
          </div>

          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" v-model="emailNotifiche" id="notificheEmail" aria-label="Attiva notifiche via email">
              <label class="form-check-label" for="notificheEmail">
                Ricevi notifiche via email - FUTURA IMPLEMENTAZIONE
              </label>
            </div>
            <p class="text-muted small mb-0 mt-2">
              Ti avviseremo per nuove iscrizioni, commenti ed aggiornamenti sulle partite.
            </p>
          </div>
        </section>

        <hr class="settings-divider" />

        <!-- Eliminazione account -->
        <section class="setting-section">
          <div class="section-title mb-3">
            <span class="section-icon" aria-hidden="true">⚠️</span>
            <h3 class="mb-0 text-danger">Elimina account</h3>
          </div>

          <div class="alert alert-danger-soft d-flex align-items-start gap-2 mb-3" role="alert">
            <div>
              <strong>Attenzione:</strong> questa azione è irreversibile. Tutti i tuoi dati verranno cancellati.
            </div>
          </div>

          <button class="btn btn-outline-danger btn-pill" @click="confermaEliminazione = true" aria-label="Avvia eliminazione account">
            Elimina account
          </button>

          <div v-if="confermaEliminazione" class="confirm-panel mt-3" role="region" aria-label="Conferma eliminazione account">
            <div class="confirm-header">
              <span>Sei sicuro? Questa azione è permanente.</span>
            </div>
            <div class="confirm-actions">
              <button class="btn btn-danger me-2" @click="eliminaAccount" aria-label="Conferma eliminazione account">Conferma eliminazione</button>
              <button class="btn btn-secondary" @click="confermaEliminazione = false" aria-label="Annulla eliminazione account">Annulla</button>
            </div>
          </div>
        </section>
      </div>
    </div>
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
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'

const userId = localStorage.getItem('userId')
const username = localStorage.getItem('userName')
const email = ref('')

// Cambio password
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const cambiaPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    showToast('Le nuove password non corrispondono.', 'warning')
    return
  }

  try {
    await axios.put(`http://localhost:3000/api/users/change-password`, {
      userId: userId,
      currentPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    showToast('Password aggiornata con successo.', 'success')
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Errore durante il cambio password.'
    showToast(errorMsg, 'danger')
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
    // Non mostriamo il toast qui perché la pagina verrà ricaricata
    localStorage.clear()
    window.location.href = '/'
  } catch (err) {
    showToast('Errore durante l\'eliminazione dell\'account.', 'danger')
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

// --- LOGICA TOAST ---
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
  const toast = new bootstrap.Toast(toastEl.value, { autohide: true, delay: delayMs })
  toast.show()
}
</script>
