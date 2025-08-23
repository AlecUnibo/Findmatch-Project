<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">🔔 Le tue notifiche</h2>
      <div class="d-flex gap-2">
        <button v-if="hasUnread" @click="markAllAsRead" class="btn btn-sm btn-outline-primary" :disabled="actionInProgress">
          Segna tutte come lette
        </button>
        <button v-if="notifiche.length > 0" @click="deleteAllNotifications" class="btn btn-sm btn-outline-danger" :disabled="actionInProgress">
          Elimina tutte
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-muted mt-5">
      <div class="spinner-border spinner-border-sm" role="status"></div>
      <p class="mt-2">Caricamento...</p>
    </div>

    <div v-else-if="notifiche.length === 0" class="text-center text-muted mt-5">
      <p>Non ci sono nuove notifiche.</p>
    </div>

    <div v-else class="list-group">
      <router-link
        v-for="notifica in notifiche"
        :key="notifica.id"
        :to="notifica.event_id ? `/home?open_event=${notifica.event_id}` : '#'"
        :class="{ 'notification-read': notifica.is_read }"
        class="list-group-item list-group-item-action d-flex align-items-center"
        :event="notifica.event_id ? 'click' : ''"
      >
        <div class="me-3 fs-4">
          {{ getIcona(notifica.type) }}
        </div>
        <div class="flex-grow-1">
          <p class="mb-0" v-html="formattaMessaggio(notifica)"></p>
          <small>{{ formattaData(notifica.created_at) }}</small>
        </div>
        <div class="ms-3 d-flex align-items-center gap-2 notification-actions">
          <button v-if="!notifica.is_read" @click.prevent.stop="markOneAsRead(notifica)" class="btn btn-sm btn-outline-success rounded-circle" title="Segna come letto" style="width: 32px; height: 32px;" :disabled="actionInProgress">
            ✓
          </button>
          <button @click.prevent.stop="deleteNotification(notifica.id)" class="btn btn-sm btn-outline-danger rounded-circle" title="Elimina notifica" style="width: 32px; height: 32px;" :disabled="actionInProgress">
            &times;
          </button>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const notifiche = ref([]);
const loading = ref(true);
const actionInProgress = ref(false);
const userId = localStorage.getItem('userId');

const hasUnread = computed(() => notifiche.value.some(n => !n.is_read));

const fetchNotifiche = async () => {
  if (!userId) {
    loading.value = false;
    return;
  }
  try {
    const { data } = await axios.get(`http://localhost:3000/api/notifiche/${userId}`);
    notifiche.value = data;
  } catch (err) {
    console.error('Errore nel caricamento delle notifiche:', err);
  } finally {
    loading.value = false;
  }
};

const markAllAsRead = async () => {
  if (!userId || actionInProgress.value) return;
  actionInProgress.value = true;
  try {
    await axios.post(`http://localhost:3000/api/notifiche/mark-all-as-read/${userId}`);
    notifiche.value.forEach(n => n.is_read = true);
  } catch (err) {
    console.error('Errore nel segnare le notifiche come lette:', err);
    alert('Si è verificato un errore. Le notifiche non sono state aggiornate.');
  } finally {
    actionInProgress.value = false;
  }
};

const markOneAsRead = async (notifica) => {
  if (!userId || notifica.is_read || actionInProgress.value) return;
  actionInProgress.value = true;
  try {
    await axios.put(`http://localhost:3000/api/notifiche/${notifica.id}/read`, { userId });
    notifica.is_read = true;
  } catch (err) {
    console.error('Errore nel segnare la notifica come letta:', err);
  } finally {
    actionInProgress.value = false;
  }
};

const deleteNotification = async (notificationId) => {
  if (!userId || actionInProgress.value) return;
  if (!confirm('Sei sicuro di voler eliminare questa notifica?')) return;
  actionInProgress.value = true;
  try {
    await axios.delete(`http://localhost:3000/api/notifiche/${notificationId}`, { data: { userId } });
    notifiche.value = notifiche.value.filter(n => n.id !== notificationId);
  } catch (err) {
    console.error('Errore nell\'eliminazione della notifica:', err);
    alert('Si è verificato un errore. La notifica non è stata eliminata.');
  } finally {
    actionInProgress.value = false;
  }
};

const deleteAllNotifications = async () => {
  if (!userId || notifiche.value.length === 0 || actionInProgress.value) return;
  if (!confirm('Sei sicuro di voler eliminare TUTTE le notifiche? L\'azione è irreversibile.')) return;
  
  actionInProgress.value = true;
  try {
    await axios.delete(`http://localhost:3000/api/notifiche/delete-all/${userId}`);
    notifiche.value = []; // Svuota l'array solo in caso di successo
  } catch (err) {
    console.error('Errore durante l\'eliminazione di tutte le notifiche:', err);
    alert('Si è verificato un errore. Le notifiche non sono state eliminate.');
  } finally {
    actionInProgress.value = false;
  }
};

onMounted(fetchNotifiche);

const getIcona = (tipo) => {
  switch (tipo) {
    case 'nuovo_follower': return '👤';
    case 'partita_unito': return '✅';
    case 'partita_completa': return '🎉';
    case 'nuova_partita_seguito': return '⭐';
    case 'partita_annullata': return '🛑';
    case 'invito_partita': return '✉️'; 
    case 'promemoria_partita': return '⏰';
    case 'partita_aggiornata': return '🔄';
    case 'partita_abbandonata': return '❌';
    default: return '🔔';
  }
};

const formattaMessaggio = (notifica) => {
  if (notifica.actor_username) {
    return notifica.message.replace(notifica.actor_username, `<strong>${notifica.actor_username}</strong>`);
  }
  return notifica.message;
};

const formattaData = (data) => {
  const now = new Date();
  const diff = Math.round((now - new Date(data)) / 1000); // secondi

  if (diff < 60) return `${diff} secondi fa`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minuti fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
  return new Date(data).toLocaleDateString('it-IT');
};
</script>

<style scoped>
/* Stile base per TUTTE le notifiche: sfondo bianco, testo nero. Solido e leggibile. */
.list-group-item {
  background-color: #ffffff;
  color: #212529; /* Testo nero standard */
  text-decoration: none; /* Rimuove la sottolineatura dai link */
}

/* Stile per le notifiche GIA' LETTE: aggiunge uno sfondo e un bordo a sinistra. */
.notification-read {
  background-color: #f0f2f5;
  border-left: 4px solid #ced4da;
}

/* Stili per far apparire i pulsanti solo al passaggio del mouse */
.notification-actions {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.list-group-item:hover .notification-actions {
  opacity: 1;
}
</style>