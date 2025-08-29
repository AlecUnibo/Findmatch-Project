<template>
  <div class="component-partite container mt-5">
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
      v-if="currentTab === 'iscritto'"
      :partite="iscrittoList"
      sezione="iscritto"
      :fetchEventoById="fetchEventoById"
    />

    <PartiteSection
      v-else-if="currentTab === 'storico'"
      :partite="storicoList"
      sezione="storico"
      :fetchEventoById="fetchEventoById"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import PartiteSection from '../components/PartiteSection.vue'

const userId = localStorage.getItem('userId')
const iscrittoList = ref([])
const storicoList = ref([])

const currentTab = ref(localStorage.getItem('partiteTab') || 'iscritto')

watch(currentTab, (newValue) => {
  localStorage.setItem('partiteTab', newValue)
})

const tabs = [
  { label: '🗓️ A cui sei iscritto', value: 'iscritto' },
  { label: '📖 Storico partecipazioni', value: 'storico' }
]

// Opzionale: usato da PartiteSection per sincronizzare un evento specifico
const fetchEventoById = async (id) => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/partite/${id}`)
    return data
  } catch (e) {
    // silenzioso: PartiteSection gestisce i fallback
    return null
  }
}

const loadData = async () => {
  if (!userId) return
  try {
    const [iscrittoRes, storicoRes] = await Promise.all([
      axios.get(`http://localhost:3000/api/partecipazioni/iscritto/${userId}`),
      axios.get(`http://localhost:3000/api/partecipazioni/storico/${userId}`)
    ])
    iscrittoList.value = iscrittoRes.data || []
    storicoList.value = storicoRes.data || []
  } catch (err) {
    console.error('Errore caricamento partite:', err)
  }
}

onMounted(loadData)
</script>
