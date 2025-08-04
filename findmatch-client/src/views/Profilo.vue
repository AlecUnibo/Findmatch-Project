<template>
  <div class="container mt-5">
    <div class="card p-4 shadow-sm">
      <div class="d-flex align-items-center">
        <div class="me-4">
          <img
            :src="user.profilePicture || 'https://via.placeholder.com/150'"
            class="rounded-circle"
            alt="Foto profilo"
            width="100"
            height="100"
          />
        </div>
        <div>
          <h3 class="mb-0">{{ user.username }}</h3>
          <p class="text-muted mb-1">Followers: {{ user.followers }}</p>
          <button class="btn btn-outline-primary btn-sm mt-2" @click="apriModaleModifica">Modifica</button>
        </div>
      </div>
      <hr />
      <div>
        <h5>Biografia</h5>
        <p>{{ user.bio || 'Nessuna biografia disponibile.' }}</p>
      </div>
    </div>

    <!-- MODALE MODIFICA PROFILO -->
    <div class="modal fade" id="modalModificaProfilo" tabindex="-1" aria-labelledby="modalModificaProfiloLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalModificaProfiloLabel">Modifica Profilo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvaModifiche">
              <div class="mb-3">
                <label class="form-label">Nome utente</label>
                <input v-model="user.username" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Sport preferito</label>
                <input v-model="user.favoriteSport" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Data di nascita</label>
                <input type="date" v-model="user.birthdate" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Biografia</label>
                <textarea v-model="user.bio" class="form-control"></textarea>
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import * as bootstrap from 'bootstrap'

const user = ref({
  username: '',
  followers: 0,
  profilePicture: '',
  bio: '',
  favoriteSport: '',
  birthdate: ''
})

const userId = localStorage.getItem('userId')

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/users/${userId}`)
    user.value.username = data.username
    user.value.bio = data.bio || 'Appassionato di sport e partite amatoriali!'
    user.value.followers = data.followers || 0
    user.value.profilePicture = data.profile_picture || ''
    user.value.favoriteSport = data.favorite_sport || ''
    user.value.birthdate = data.birthdate || ''
  } catch (err) {
    console.error('Errore caricamento profilo:', err)
  }
})

function apriModaleModifica() {
  const modal = new bootstrap.Modal(document.getElementById('modalModificaProfilo'))
  modal.show()
}

function salvaModifiche() {
  // Qui andrà la logica per salvare le modifiche via API PUT
  alert('✅ Profilo aggiornato!')
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificaProfilo'))
  modal.hide()
}
</script>

<style scoped>
img.rounded-circle {
  object-fit: cover;
  border: 2px solid #ddd;
}

</style>
