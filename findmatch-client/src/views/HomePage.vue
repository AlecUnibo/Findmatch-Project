<template>
  <div class="component-home">
    <div class="container mt-5">
            <!-- Benvenuto -->
      <div class="text-center mb-4">
        <h2>Benvenuto, {{ nomeUtente }}! 👋</h2>
        <p class="text-muted">Trova o unisciti alla tua prossima partita sportiva!</p>
      </div>

            <!-- Ricerca avanzata -->
      <div class="row justify-content-center mb-4 g-2">
        <div class="col-md-3">
          <input id="autocomplete-luogo" type="text" class="form-control" placeholder="Cerca luogo" />
        </div>

        <div class="col-md-3">
          <select v-model="sportFiltro" class="form-select">
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


        <div class="col-md-2">
          <input type="date" v-model="dataFiltro" class="form-control" />
        </div>

        <div class="col-md-2">
          <input type="time" v-model="orarioFiltro" class="form-control" />
        </div>

        <div class="col-auto d-flex gap-2">
          <button class="btn btn-outline-success d-flex align-items-center gap-2" @click="cercaPartite"><img src="/images/search-button.svg" alt="Cerca" width="16" height="16" />Cerca</button>
          <button class="btn btn-outline-danger" @click="pulisciFiltri">Pulisci</button>
        </div>

      </div>
            <!-- Tabs -->
      <ul class="nav nav-pills justify-content-center mb-3">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab==='disponibili' }" @click="tab='disponibili'">
            Disponibili
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab==='mie' }" @click="tab='mie'">
            Create da te
          </button>
        </li>
      </ul>

            <!-- Partite trovate -->
      <div class="mb-5" v-if="tab==='disponibili'">
        <h4 class="mb-3">📅 Partite disponibili</h4>
        <div v-if="partiteDisponibili.length">
          <div v-for="partita in partiteDisponibili" :key="partita.id" class="card mb-3 text-white" :class="getCardClass(partita.sport)">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title mb-1">{{ getSportIcon(partita.sport) }} {{ partita.sport }}</h5>
                <p class="card-text mb-0">
                  <!-- Stato posti -->
                  <strong>Data:</strong> {{ formatData(partita.date_time) }} –
                  <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
                  <strong>Luogo:</strong> {{ partita.location }}

                  <div class="d-flex align-items-center gap-2 mt-2">
                    <span class="badge bg-light text-dark">
                      {{ postiLiberi(partita) }} posti liberi
                    </span>
                  </div>
                  <div class="progress mt-2" style="height: 6px;">
                    <div class="progress-bar"
                        role="progressbar"
                        :class="progressBarClass(partita)"
                        :style="{ width: progressPercent(partita) + '%' }"
                        :aria-valuenow="partita.partecipanti"
                        :aria-valuemin="0"
                        :aria-valuemax="partita.max_players">
                    </div>
                  </div>
                </p>
              </div>
              <div class="d-flex gap-2">
  <button class="btn btn-sm btn-primary" @click="apriDettagli(partita)">Dettagli</button>

  <!-- SE ISCRITTO: SOLO ABBANDONA -->
  <template v-if="isIscritto(partita.id)">
    <button class="btn btn-sm btn-danger" @click="abbandona(partita.id)">Abbandona</button>
  </template>

  <!-- ALTRIMENTI: SPLIT PER CALCIO, BOTTONE SINGOLO PER ALTRO -->
  <template v-else>
    <div v-if="isCalcio(partita)"
         class="btn-group position-static role-dropdown" data-bs-display="static">
      <button class="btn btn-sm btn-success"
              @click="uniscitiCalcio(partita.id, partita.organizer_id, partita.sport, 'random')">
        Unisciti
      </button>
      <button type="button"
              class="btn btn-sm btn-success dropdown-toggle dropdown-toggle-split"
              data-bs-toggle="dropdown" aria-expanded="false">
        <span class="visually-hidden">Toggle Dropdown</span>
      </button>

      <ul class="dropdown-menu dropdown-menu-end">
        <li v-for="(r, idx) in roleEntries(partita)"
            :key="`${partita.id}-${r.key}-${idx}`">
          <button class="dropdown-item"
                  :disabled="r.count <= 0"
                  @click="uniscitiCalcio(partita.id, partita.organizer_id, partita.sport, r.key)">
            {{ ruoloLabel(r.key) }}
            <span class="badge bg-secondary ms-2">{{ r.count }}</span>
          </button>
        </li>
        <li v-if="roleEntries(partita).length === 0">
          <span class="dropdown-item disabled">Nessun ruolo disponibile</span>
        </li>
      </ul>
    </div>

    <button v-else class="btn btn-sm btn-success"
            @click="unisciti(partita.id, partita.organizer_id, partita.sport)">
      Unisciti
    </button>
  </template>
</div>
<!-- <pre class="text-light small" v-if="isCalcio(partita)">
  {{ roleEntries(partita) }}
</pre> -->

            </div>
          </div>
        </div>
        <div v-else class="text-muted">Nessuna partita trovata.</div>
      </div>

      <div class="mb-5" v-else>
        <h4 class="mb-3">🛠️ Create da te</h4>
        <div v-if="partiteCreate.length">
          <div v-for="partita in partiteCreate" :key="partita.id" class="card mb-3 text-white" :class="getCardClass(partita.sport)">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title mb-1">
                  {{ getSportIcon(partita.sport) }} {{ partita.sport }}
                  <span class="badge bg-warning text-dark ms-2">Tua</span>
                </h5>
                <p class="card-text mb-0">

                  <!-- Stato posti -->
                  <div class="d-flex align-items-center gap-2 mt-2">
                    <span class="badge bg-light text-dark">
                      {{ postiLiberi(partita) }} posti liberi
                    </span>
                  </div>
                  <div class="progress mt-2" style="height: 6px;">
                    <div class="progress-bar"
                        role="progressbar"
                        :class="progressBarClass(partita)"
                        :style="{ width: progressPercent(partita) + '%' }"
                        :aria-valuenow="partita.partecipanti ?? 0"
                        :aria-valuemin="0"
                        :aria-valuemax="progressMax(partita)">
                    </div>
                  </div>


                  <strong>Data:</strong> {{ formatData(partita.date_time) }} –
                  <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
                  <strong>Luogo:</strong> {{ partita.location }}
                </p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" @click="apriDettagli(partita)">Dettagli</button>
                 <!-- opzionale: pulsante gestisci/elimina se già previsto nel backend -->
                <!-- <button class="btn btn-sm btn-outline-danger" @click="eliminaPartita(partita.id)">Elimina</button> -->
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted">Non hai ancora creato partite.</div>
      </div>


            <!-- MODALE DETTAGLI -->
      <div class="modal fade" id="modalDettagli" tabindex="-1" aria-labelledby="modalDettagliLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalDettagliLabel">{{ partitaSelezionata?.sport || 'Dettagli Partita' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
            </div>
            <div class="modal-body" v-if="partitaSelezionata">
              <p><strong>Data:</strong> {{ formatData(partitaSelezionata.date_time) }}</p>
              <p><strong>Ora:</strong> {{ formatOra(partitaSelezionata.date_time) }}</p>
              <p><strong>Luogo:</strong> {{ partitaSelezionata.location }}</p>
              <!-- Se NON è calcio: mostra posti -->
              <p v-if="!isCalcio(partitaSelezionata)">
                <strong>Posti rimanenti:</strong>
                {{ postiLiberi(partitaSelezionata) }} / {{ partitaSelezionata.max_players ?? 0 }}
              </p>
              <!-- Se è calcio: mostra ruoli -->
              <div v-else>
                <p class="mb-1">
                  <strong>Ruoli mancanti:</strong>
                  {{ formatRuoli(partitaSelezionata.roles_needed) }}
                </p>
                <p class="mb-1 text-muted">
                 <strong>- Totale ruoli richiesti:</strong> {{ sumRolesNeeded(partitaSelezionata) }}
                </p>
              </div>
              <p><strong>Organizzatore:</strong> {{ partitaSelezionata.organizer_name }}</p>
              <p><strong>Descrizione:</strong> {{ partitaSelezionata.description || 'Nessuna descrizione disponibile.' }}</p>

              <hr>
              <h6>Invita un utente</h6>
              <div class="input-group">
                <input type="text" v-model="searchUserQuery" @input="searchUsersForInvite" class="form-control" placeholder="Cerca utente da invitare...">
                <button class="btn btn-outline-secondary" type="button" @click="sendInvite" :disabled="!selectedUserToInvite">Invita</button>
              </div>
              <ul v-if="userSearchResults.length" class="list-group mt-2">
                <li v-for="user in userSearchResults" :key="user.id" @click="selectUserToInvite(user)" class="list-group-item list-group-item-action" style="cursor: pointer;">
                  {{ user.username }}
                </li>
              </ul>

            </div>
          </div>
        </div>
      </div>

            <!-- TOAST -->
      <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 11000">
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

    <div class="emoji-rain-container" ref="emojiContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getPartite, getPartitaById } from '../services/partiteService';
import * as bootstrap from 'bootstrap';
import axios from 'axios';

const route = useRoute(); // Per accedere ai parametri dell'URL
const nomeUtente = ref('');
const luogoFiltro = ref('');
const sportFiltro = ref('');
const orarioFiltro = ref('');
const dataFiltro = ref('');
const partite = ref([]);
const partecipazioniUtente = ref([]);
const partitaSelezionata = ref(null);
const userId = localStorage.getItem('userId');
const emojiContainer = ref(null);
const tab = ref('disponibili');
const searchUserQuery = ref('');
const userSearchResults = ref([]);
const selectedUserToInvite = ref(null);

const sportEmojis = {
  'calcio a 5': '⚽', 'calcio a 11': '⚽', 'basket': '🏀',
  'beach volley': '🏐', 'pallavolo': '🏐', 'racchettoni': '🏓',
  'tennis': '🎾', 'paddle': '🥎'
};

const postiLiberi = (p) => {
  if (isCalcio(p)) return sumRolesNeeded(p);
  return Math.max(0, (p.max_players ?? 0) - (p.partecipanti ?? 0));
};

// Per il meter/progress: usiamo un "totale virtuale" = partecipanti + ruoli mancanti nel caso del calcio
const progressMax = (p) => {
  if (isCalcio(p)) return (p.partecipanti ?? 0) + sumRolesNeeded(p);
  return p.max_players ?? 0;
};

const progressPercent = (p) => {
  const max = progressMax(p);
  const cur = p.partecipanti ?? 0;
  if (!max) return 0;
  return Math.min(100, Math.round((cur / max) * 100));
};

const progressBarClass = (p) => {
  const left = postiLiberi(p)
  if (left === 0) return 'bg-danger'     // piena
  if (left <= 2) return 'bg-warning'     // quasi piena
  return 'bg-success'                    // buona disponibilità
};

const isIscritto = (eventId) =>
  partecipazioniUtente.value.some(id => String(id) === String(eventId));

const partiteCreate = computed(() =>
  partite.value.filter(p =>
    String(p.organizer_id) === String(userId) &&
    isTodayOrFuture(p.date_time)           // esclude le partite create da te già passate
  )
);

const partiteDisponibili = computed(() =>
  partite.value.filter(p =>
    String(p.organizer_id) !== String(userId) &&   // non mie
    !isIscritto(p.id) &&                           // esclude dove sono già iscritto
    postiLiberi(p) > 0                             // non piene
  )
);

// Oggi a mezzanotte (locale)
const startOfToday = computed(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
});
const isTodayOrFuture = (dt) => new Date(dt) >= startOfToday.value;

const cercaPartite = async () => {
  try {
    const data = await getPartite({
      sport: sportFiltro.value,
      luogo: luogoFiltro.value,
      data: dataFiltro.value,
      ora: orarioFiltro.value,
      exclude_user_id: userId
    });
        partite.value = data
      .filter(p => isTodayOrFuture(p.date_time))   // solo oggi+futuro
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  } catch (err) {

    console.error('Errore nel caricamento delle partite:', err);
  }
};

const pulisciFiltri = async () => {
  sportFiltro.value = '';
  luogoFiltro.value = '';
  dataFiltro.value = '';
  orarioFiltro.value = '';
  document.getElementById('autocomplete-luogo').value = '';
  await cercaPartite();
};

// --- helper Calcio/Ruoli (definiscili una sola volta) ---
const ruoloLabel = (key) => ({
  portiere: 'Portiere',
  difensore: 'Difensori',
  centrocampista: 'Centrocampisti',
  attaccante: 'Attaccanti',
  all_around: 'All‑around'
}[key] || key);

const roleEntries = (p) => {
  const o = p?.roles_needed || {};
  return Object.keys(o)
    .map(k => ({ key: k, count: Number(o[k] || 0) }))
    .filter(r => r.count > 0);
};


const uniscitiCalcio = async (eventId, organizerId, sport, roleKey /* 'random' o chiave ruolo */) => {
  if (!userId) {
    showToast('Devi essere loggato per unirti a una partita.', 'warning', 6000);
    return;
  }
  try {
    const { data } = await axios.post('http://localhost:3000/api/partecipazioni', {
      user_id: userId,
      event_id: eventId,
      role: roleKey // 'random' o 'portiere'/'difensore'/...
    });
    partecipazioniUtente.value.push(eventId);
    await cercaPartite(); // ricarica per aggiornare conteggi ruoli
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉');
    showToast(`Iscritto! Ruolo: ${ruoloLabel(data.role) || 'assegnato'}`, 'success', 5000);
  } catch (err) {
    const msg = err.response?.data?.error || 'Errore durante la registrazione.';
    showToast(msg, 'danger');
  }
};

const unisciti = async (eventId, organizerId, sport) => {
  if (!userId) {
    showToast('Devi essere loggato per unirti a una partita.', 'warning', 6000);
    return;
  }
  try {
    await axios.post('http://localhost:3000/api/partecipazioni', {
      user_id: userId,
      event_id: eventId
    });
    partecipazioniUtente.value.push(eventId);
    await cercaPartite();
        // Effetto Pioggia emoji
    lanciaPioggia(sportEmojis[sport.toLowerCase()] || '🎉');
    showToast('Ti sei unito con successo!', 'success', 5000);
  } catch (err) {
    showToast(err.response?.status === 409 ? 'Sei già iscritto a questa partita.' : 'Errore durante la registrazione.', 'danger');
  }
};

const abbandona = async (eventId) => {
  try {
    await axios.delete(`http://localhost:3000/api/partecipazioni`, {
      data: { user_id: userId, event_id: eventId }
    });
    partecipazioniUtente.value = partecipazioniUtente.value.filter(id => id !== eventId);
    showToast('Hai abbandonato la partita.', 'danger', 5000);
    await cercaPartite();
  } catch (err) {
    console.error('Errore durante l\'abbandono:', err);
    showToast('Errore durante l\'abbandono. Riprova più tardi.', 'danger');
  }
};

const apriDettagli = (partita) => {
  partitaSelezionata.value = partita;
  searchUserQuery.value = '';
  userSearchResults.value = [];
  selectedUserToInvite.value = null;
  const modalEl = document.getElementById('modalDettagli');
  if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
  }
};

const searchUsersForInvite = async () => {
  if (searchUserQuery.value.trim() === '') {
    userSearchResults.value = [];
    return;
  }
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/search?query=${searchUserQuery.value}`);
    userSearchResults.value = data.filter(user => user.id.toString() !== userId);
  } catch (error) {
    console.error("Errore ricerca utenti per invito:", error);
  }
};

const selectUserToInvite = (user) => {
  selectedUserToInvite.value = user;
  searchUserQuery.value = user.username;
  userSearchResults.value = [];
};

const sendInvite = async () => {
  if (!selectedUserToInvite.value || !partitaSelezionata.value) return;
  try {
    await axios.post(`http://localhost:3000/api/partite/${partitaSelezionata.value.id}/invite`, {
      inviterId: userId,
      inviteeId: selectedUserToInvite.value.id
    });
    showToast(`Invito inviato a ${selectedUserToInvite.value.username}!`, 'success');
    searchUserQuery.value = '';
    selectedUserToInvite.value = null;
  } catch (error) {
    console.error("Errore invio invito:", error);
    showToast('Errore durante l\'invio dell\'invito.', 'danger');
  }
};

// --- helper Calcio/Ruoli ---
const isCalcio = (p) => {
  const s = (p?.sport || '').toLowerCase();
  return s === 'calcio a 11' || s === 'calcio a 5';
};

const sumRolesNeeded = (p) => {
  const r = p?.roles_needed || {};
  return Object.values(r).reduce((acc, v) => acc + Number(v || 0), 0);
};

const formatRuoli = (roles) => {
  if (!roles || Object.keys(roles).length === 0) return '—';
  const labels = {
    portiere: 'Portiere',
    difensore: 'Difensori',
    centrocampista: 'Centrocampisti',
    attaccante: 'Attaccanti',
    all_around: 'All‑around'
  };
  return Object.entries(roles)
    .filter(([_, v]) => Number(v) > 0)
    .map(([k, v]) => `${labels[k] || k}: ${v}`)
    .join(', ');
};

const toastEl = ref(null);
const toastMessage = ref('');
const toastVariant = ref('success');
const toastIcon = computed(() => ({'success': '✅', 'danger': '🛑', 'warning': '⚠️'})[toastVariant.value] || 'ℹ️');
const toastVariantClass = computed(() => ({'success': 'bg-success text-white', 'danger': 'bg-danger text-white', 'warning': 'bg-warning text-dark'})[toastVariant.value] || 'bg-info text-white');

// Durata più lunga + animazione
function showToast(message, variant = 'success', delayMs = 5000) {
  toastMessage.value = message;
  toastVariant.value = variant;
  const t = new bootstrap.Toast(toastEl.value, { autohide: true, animation: true, delay: delayMs });
  t.show();
}

function lanciaPioggia(emoji) {
  const container = emojiContainer.value;
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('span');
    el.textContent = emoji;
    el.className = 'emoji-fall';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = 2 + Math.random() * 2 + 's';
    container.appendChild(el);
    setTimeout(() => container.removeChild(el), 4000);
  }
}

const caricaPartecipazioniUtente = async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/partecipazioni/mie/${userId}`);
    partecipazioniUtente.value = data;
  } catch (err) {
    console.error('Errore caricamento partecipazioni:', err);
  }
};

function formatData(datetime) {
  const date = new Date(datetime)
  return date.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

function formatOra(datetime) {
  const date = new Date(datetime)
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getSportIcon(sport) {
  switch (sport.toLowerCase()) {
    case 'calcio a 5':
    case 'calcio a 11':
      return '⚽'
    case 'basket':
      return '🏀'
    case 'beach volley':
    case 'pallavolo':
      return '🏐'
    case 'racchettoni':
      return '🏓'
    case 'tennis':
      return '🎾'
    case 'paddle':
      return '🥎'
    default:
      return '🎯'

  }
}

function getCardClass(sport) {
  switch (sport.toLowerCase()) {
    case 'tennis':
      return 'card-sport-tennis'
    case 'paddle':
      return 'card-sport-paddle'
    case 'racchettoni':
      return 'card-sport-racchettoni'
    case 'calcio a 5':
    case 'calcio a 11':
      return 'card-sport-calcio'
    case 'basket':
      return 'card-sport-basket'
    case 'pallavolo':
      return 'card-sport-volley'
    case 'beach volley':
      return 'card-sport-beach'
    default:
      return ''

  }
}

onMounted(async () => {
  nomeUtente.value = localStorage.getItem('userName') || 'Utente';
  await Promise.all([
    cercaPartite(),
    caricaPartecipazioniUtente()
  ]);

  const eventIdToOpen = route.query.open_event;
  if (eventIdToOpen) {
    try {
      const partita = await getPartitaById(eventIdToOpen);
      apriDettagli(partita);
    } catch (error) {
      console.error("Impossibile aprire la partita dalla notifica:", error);
      showToast('Impossibile trovare la partita selezionata.', 'danger');
    }
  }

  const input = document.getElementById('autocomplete-luogo');
  if (window.google && google.maps && google.maps.places) {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['geocode'], componentRestrictions: { country: 'it' }
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      luogoFiltro.value = place.formatted_address || input.value;
    });
  } else {
    console.warn('Google Maps API non è ancora pronta.');
  }
});
</script>