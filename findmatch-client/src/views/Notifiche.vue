<template>
  <div class="container mt-5 component-notifiche">
    <div class="card p-4 shadow-sm mb-5">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="mb-0">🔔 Centro notifiche</h2>
        <div v-if="currentTab === 'notifiche'" class="d-flex gap-2">
          <button
            v-if="hasUnread"
            @click="markAllAsRead"
            class="btn btn-pill-action btn-mark-read"
            :disabled="actionInProgress"
            aria-label="Segna tutte le notifiche come lette"
          >
            Segna tutte come lette
          </button>

          <button
            v-if="(notifiche?.length || 0) > 0"
            @click="deleteAllNotifications"
            class="btn btn-pill-action btn-delete-all"
            :disabled="actionInProgress"
            aria-label="Elimina tutte le notifiche"
          >
            Elimina tutte
          </button>
        </div>
      </div>

      <hr class="mb-3" />

      <!-- Nav Tab -->
      <ul class="nav nav-pills justify-content-center mb-4 custom-pills">
        <li class="nav-item" v-for="tab in tabs" :key="tab.value">
          <button
            class="nav-link"
            :class="{ active: currentTab === tab.value }"
            @click="currentTab = tab.value"
            :aria-label="`Vai alla tab ${tab.label}`"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <!-- TAB: NOTIFICHE -->
      <Transition name="fade-blur" mode="out-in">
        <div :key="currentTab">
          <!-- TAB: NOTIFICHE -->
          <div v-if="currentTab === 'notifiche'">
            <div v-if="loading" class="text-center text-muted mt-5">
              <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
              <p class="mt-2">Caricamento...</p>
            </div>

            <div v-else-if="(notifiche?.length || 0) === 0" class="text-center text-muted mt-5">
              <p>Non ci sono nuove notifiche.</p>
            </div>

            <!-- vedi patch 2 sotto per animare la lista -->
            <div v-else class="list-group" role="list">
              <div
                v-for="notifica in notifiche"
                :key="notifica.id"
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{ 'notification-read': notifica.is_read }"
                role="listitem"
              >
            <div class="me-3 fs-4" aria-hidden="true">{{ getIcona(notifica.type) }}</div>

            <div class="flex-grow-1">
              <p class="mb-0" v-html="formattaMessaggio(notifica)"></p>
              <small>{{ formattaData(notifica.created_at) }}</small>
            </div>

            <div class="d-flex align-items-center notification-inline-actions">
              <div v-if="notifica.type === 'invito_partita'" class="d-flex gap-2">
                <button
                  @click.prevent.stop="uniscitiPartita(notifica.event_id)"
                  class="btn btn-sm btn-success"
                  :aria-label="`Unisciti alla partita ${notifica.event_id}`"
                >
                  Unisciti
                </button>
                <router-link
                  :to="`/home?open_event=${notifica.event_id}`"
                  class="btn btn-sm btn-outline-secondary"
                  :aria-label="`Dettagli partita ${notifica.event_id}`"
                >
                  Dettagli
                </router-link>
              </div>

              <router-link
                v-else-if="notifica.event_id"
                :to="`/home?open_event=${notifica.event_id}`"
                class="btn btn-sm btn-outline-secondary"
                :aria-label="`Visualizza evento ${notifica.event_id}`"
              >
                Visualizza
              </router-link>
            </div>

            <div class="ms-3 d-flex align-items-center gap-2 notification-actions">
              <button
                v-if="!notifica.is_read"
                @click.prevent.stop="markOneAsRead(notifica)"
                class="btn btn-sm btn-outline-success rounded-circle notif-action-circle"
                title="Segna come letto"
                :disabled="actionInProgress"
                aria-label="Segna notifica come letta"
              >
                ✓
              </button>
              <button
                @click.prevent.stop="deleteNotification(notifica.id)"
                class="btn btn-sm btn-outline-danger rounded-circle notif-action-circle"
                title="Elimina notifica"
                :disabled="actionInProgress"
                aria-label="Elimina notifica"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB CHAT -->
       <div v-else-if="currentTab === 'chat'" class="py-4">
      <h3 class="h5 mb-3">Chat</h3>
      <p class="text-muted">Futura implementazione.</p>
    </div>
  </div>
</Transition>
    </div>
    <!-- TOAST -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div ref="toastEl" class="toast align-items-center border-0 fade" role="status" aria-live="polite" aria-atomic="true">
        <div :class="['toast-body', 'rounded-3', 'shadow-lg', toastVariantClass]">
          <strong class="me-2">{{ toastIcon }}</strong> {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>

  <!-- MODALE DI CONFERMA -->
<div class="modal fade" tabindex="-1" ref="confirmModalEl" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow">
      <div class="modal-header bg-danger text-white">
        <h5 class="modal-title">{{ confirmTitle }}</h5>
        <button type="button" class="btn-close" @click="resolveConfirm(false)" aria-label="Chiudi"></button>
      </div>
      <div class="modal-body">
        <p class="mb-0">{{ confirmMessage }}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" @click="resolveConfirm(false)" aria-label="Annulla">Annulla</button>
        <button type="button" class="btn" :class="confirmBtnClass" @click="resolveConfirm(true)" :aria-label="confirmBtnText">
          {{ confirmBtnText }}
        </button>
      </div>
    </div>
  </div>
</div>

</template>

<script setup>
/* (script unchanged) */
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'

const currentTab = ref(localStorage.getItem('notificheTab') || 'notifiche')
const tabs = [
  { label: '🔔 Notifiche', value: 'notifiche' },
  { label: '💬 Chat', value: 'chat' }
]
watch(currentTab, (val) => localStorage.setItem('notificheTab', val))

const notifiche = ref([])
const loading = ref(true)
const actionInProgress = ref(false)
const userId = localStorage.getItem('userId')

/* ---- MODALE DI CONFERMA ELIMINAZIONE NOTIFICjE ---- */
const confirmModalEl = ref(null)
let confirmModalInstance = null
const confirmTitle = ref('Conferma azione')
const confirmMessage = ref('Sei sicuro?')
const confirmBtnText = ref('Conferma')
const confirmBtnClass = ref('btn-danger')

let _confirmResolver = null

function askConfirm({
  title = 'Conferma azione',
  message = 'Sei sicuro?',
  confirmText = 'Conferma',
  variant = 'danger', // 'danger' | 'primary' | 'warning'
} = {}) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmBtnText.value = confirmText
  confirmBtnClass.value = variant === 'warning'
    ? 'btn-warning'
    : variant === 'primary'
    ? 'btn-primary'
    : 'btn-danger'

  if (!confirmModalInstance) {
    confirmModalInstance = new bootstrap.Modal(confirmModalEl.value, { backdrop: 'static', keyboard: false })
  }
  confirmModalInstance.show()

  return new Promise((resolve) => { _confirmResolver = resolve })
}

function resolveConfirm(answer) {
  if (confirmModalInstance) confirmModalInstance.hide()
  if (_confirmResolver) {
    _confirmResolver(answer)
    _confirmResolver = null
  }
}


const hasUnread = computed(
  () => Array.isArray(notifiche.value) && notifiche.value.some(n => !n.is_read)
)

const fetchNotifiche = async () => {
  if (!userId) { loading.value = false; return }
  try {
    const { data } = await axios.get(`http://localhost:3000/api/notifiche/${userId}`)
    notifiche.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Errore nel caricamento delle notifiche:', err)
    notifiche.value = []
  } finally {
    loading.value = false
  }
}

const markAllAsRead = async () => {
  if (!userId || actionInProgress.value) return
  actionInProgress.value = true
  try {
    await axios.post(`http://localhost:3000/api/notifiche/mark-all-as-read/${userId}`)
    notifiche.value.forEach(n => n.is_read = true)
  } catch (err) {
    console.error('Errore nel segnare le notifiche come lette:', err)
    showToast('Si è verificato un errore.', 'danger')
  } finally {
    actionInProgress.value = false
  }
}

const markOneAsRead = async (notifica) => {
  if (!userId || notifica.is_read || actionInProgress.value) return
  actionInProgress.value = true
  try {
    await axios.put(`http://localhost:3000/api/notifiche/${notifica.id}/read`, { userId })
    notifica.is_read = true
  } catch (err) {
    console.error('Errore nel segnare la notifica come letta:', err)
  } finally {
    actionInProgress.value = false
  }
}

const deleteNotification = async (notificationId) => {
  if (!userId || actionInProgress.value) return

  const ok = await askConfirm({
    title: 'Eliminare questa notifica?',
    message: 'Questa azione non può essere annullata.',
    confirmText: 'Elimina',
    variant: 'danger',
  })
  if (!ok) return

  actionInProgress.value = true
  try {
    await axios.delete(`http://localhost:3000/api/notifiche/${notificationId}`, { data: { userId } })
    notifiche.value = notifiche.value.filter(n => n.id !== notificationId)
    showToast('Notifica eliminata.', 'success')
  } catch (err) {
    console.error('Errore nell\'eliminazione della notifica:', err)
    showToast('Errore durante l\'eliminazione.', 'danger')
  } finally {
    actionInProgress.value = false
  }
}


const deleteAllNotifications = async () => {
  if (!userId || (notifiche.value?.length || 0) === 0 || actionInProgress.value) return

  const ok = await askConfirm({
    title: 'Eliminare tutte le notifiche?',
    message: 'Verranno rimosse tutte le notifiche presenti. Procedere?',
    confirmText: 'Elimina tutte',
    variant: 'danger',
  })
  if (!ok) return

  actionInProgress.value = true
  try {
    await axios.delete(`http://localhost:3000/api/notifiche/delete-all/${userId}`)
    notifiche.value = []
    showToast('Tutte le notifiche sono state eliminate.', 'success')
  } catch (err) {
    console.error('Errore durante l\'eliminazione di tutte le notifiche:', err)
    showToast('Errore durante l\'eliminazione.', 'danger')
  } finally {
    actionInProgress.value = false
  }
}

 // FUNZIONE PER UNIRSI ALLA PARTITA
const uniscitiPartita = async (eventId) => {
  if (!userId) {
    showToast('Devi essere loggato per unirti.', 'warning')
    return
  }
  actionInProgress.value = true
  try {
    await axios.post('http://localhost:3000/api/partecipazioni', {
      user_id: userId,
      event_id: eventId
    })
    showToast('Ti sei unito alla partita con successo!', 'success')
  } catch (err) {
    if (err.response?.status === 409) {
      showToast('Sei già iscritto a questa partita.', 'warning')
    } else {
      showToast('Errore durante l\'iscrizione alla partita.', 'danger')
    }
    console.error('Errore durante l\'iscrizione:', err)
  } finally {
    actionInProgress.value = false
  }
}

onMounted(fetchNotifiche)

const getIcona = (tipo) => {
  const icons = {
    'nuovo_follower': '👤', 'partita_unito': '✅', 'partita_completa': '🎉',
    'nuova_partita_seguito': '⭐', 'partita_annullata': '🛑', 'invito_partita': '✉️',
    'promemoria_partita': '⏰', 'partita_aggiornata': '🔄', 'partita_abbandonata': '❌',
  }
  return icons[tipo] || '🔔'
}

const formattaMessaggio = (notifica) => {
  if (notifica.actor_username) {
    return notifica.message.replace(
      notifica.actor_username,
      `<strong>${notifica.actor_username}</strong>`
    )
  }
  return notifica.message
}

const formattaData = (data) => {
  const now = new Date()
  const diffSeconds = Math.round((now - new Date(data)) / 1000)
  if (diffSeconds < 60) return `${diffSeconds} secondi fa`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} minuti fa`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ore fa`
  return new Date(data).toLocaleDateString('it-IT')
}

// Toast
const toastEl = ref(null)
const toastMessage = ref('')
const toastVariant = ref('success')
const toastIcon = computed(() => ({ success: '✅', danger: '🛑', warning: '⚠️' }[toastVariant.value] || 'ℹ️'))
const toastVariantClass = computed(() => ({ success: 'bg-success text-white', danger: 'bg-danger text-white', warning: 'bg-warning text-dark' }[toastVariant.value] || 'bg-info text-white'))

function showToast(message, variant = 'success', delayMs = 5000) {
  toastMessage.value = message
  toastVariant.value = variant
  const t = new bootstrap.Toast(toastEl.value, { autohide: true, animation: true, delay: delayMs })
  t.show()
}
</script>
