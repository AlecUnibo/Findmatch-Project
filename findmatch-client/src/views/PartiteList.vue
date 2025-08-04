<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">📋 Le tue partite</h2>

    <!-- Nav Tab -->
    <ul class="nav nav-tabs justify-content-center mb-4">
      <li class="nav-item" v-for="tab in tabs" :key="tab.value">
        <button
          class="nav-link"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <PartiteSection
      v-if="currentTab === 'create'"
      :partite="createList"
      sezione="create"
    />
    <PartiteSection
      v-else-if="currentTab === 'iscritto'"
      :partite="iscrittoList"
<<<<<<< HEAD
      sezione="iscritto"
    />

=======
    />
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
    <PartiteSection
      v-else-if="currentTab === 'storico'"
      :partite="storicoList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import PartiteSection from '../components/PartiteSection.vue'

const userId = localStorage.getItem('userId')
const createList = ref([])
const iscrittoList = ref([])
const storicoList = ref([])

const currentTab = ref(localStorage.getItem('partiteTab') || 'create')

watch(currentTab, (newValue) => {
  localStorage.setItem('partiteTab', newValue)
})
const tabs = [
  { label: '📌 Create da te', value: 'create' },
<<<<<<< HEAD
  { label: '🗓️ A cui sei iscritto', value: 'iscritto' },
  { label: '📖 Storico partecipazioni', value: 'storico' }
=======
  { label: '🗓 A cui sei iscritto', value: 'iscritto' },
  { label: '📚 Storico partecipazioni', value: 'storico' }
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
]

const loadData = async () => {
  if (!userId) return

  try {
    const [createRes, iscrittoRes, storicoRes] = await Promise.all([
<<<<<<< HEAD
      axios.get(`http://localhost:3000/api/partecipazioni/create/${userId}`),
      axios.get(`http://localhost:3000/api/partecipazioni/iscritto/${userId}`),
      axios.get(`http://localhost:3000/api/partecipazioni/storico/${userId}`)
=======
      axios.get('http://localhost:3000/api/partecipazioni/create/${userId}'),
      axios.get('http://localhost:3000/api/partecipazioni/iscritto/${userId}'),
      axios.get('http://localhost:3000/api/partecipazioni/storico/${userId}')
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
    ])
    createList.value = createRes.data
    iscrittoList.value = iscrittoRes.data
    storicoList.value = storicoRes.data
  } catch (err) {
    console.error('Errore caricamento partite:', err)
  }
}

onMounted(loadData)
<<<<<<< HEAD
</script>

<style scoped>
.nav-tabs .nav-link {
  color: black;
}

.nav-tabs .nav-link.active {
  color: #0d6efd !important;
  font-weight: bold;             /* opzionale: enfasi visiva */
}
</style>
=======
</script>
>>>>>>> 76bc2d8111405c6188e46a3b1255d18aae33395a
