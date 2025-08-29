<template>
  <div class="mb-5 component-partite-list">
    <h4 class="mb-3">{{ titolo }}</h4>

    <div v-if="partite && partite.length">
      <PartitaCard
        v-for="p in paginated"
        :key="p.id"
        :partita="p"
        :getCardClass="getCardClass"
        :getSportIcon="getSportIcon"
        :formatData="formatData"
        :formatOra="formatOra"
        :postiLiberi="postiLiberi"
        :progressPercent="progressPercent"
        :progressBarClass="progressBarClass"
        :progressMax="progressMax"
        :isCalcio="isCalcio"
        :roleEntries="roleEntries"
        :ruoloLabel="ruoloLabel"
        :showJoin="showJoin"
        @dettagli="$emit('dettagli', $event)"
        @unisciti="$emit('unisciti', $event)"
        @unisciti-calcio="$emit('uniscitiCalcio', $event)"
      />
      <nav class="d-flex justify-content-center mt-3" :aria-label="`Paginazione ${titolo}`">
        <ul class="pagination" role="navigation" aria-label="Paginazione">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="go(page - 1)" :aria-label="'Pagina precedente'">«</button>
          </li>

          <li
            class="page-item"
            v-for="n in totalPages"
            :key="`p-${n}`"
            :class="{ active: n === page }"
          >
            <button class="page-link" @click="go(n)" :aria-label="`Vai alla pagina ${n}`">{{ n }}</button>
          </li>

          <li class="page-item" :class="{ disabled: page === totalPages }">
            <button class="page-link" @click="go(page + 1)" :aria-label="'Pagina successiva'">»</button>
          </li>
        </ul>
      </nav>
    </div>

    <div v-else class="text-muted">Nessuna partita trovata.</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PartitaCard from './PartiteCard.vue'

const props = defineProps({
  titolo: String,
  partite: { type: Array, default: () => [] },
  perPage: { type: Number, default: 8 },
  showJoin: { type: Boolean, default: true },

  // helper functions passate dal parent (stesse di PartitaCard)
  getCardClass: { type: Function, required: true },
  getSportIcon: { type: Function, required: true },
  formatData: { type: Function, required: true },
  formatOra: { type: Function, required: true },
  postiLiberi: { type: Function, required: true },
  progressPercent: { type: Function, required: true },
  progressBarClass: { type: Function, required: true },
  progressMax: { type: Function, required: true },
  isCalcio: { type: Function, required: true },
  roleEntries: { type: Function, required: true },
  ruoloLabel: { type: Function, required: true },
})

const emit = defineEmits(['dettagli', 'unisciti', 'uniscitiCalcio'])

const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.partite.length / props.perPage)))
const paginated = computed(() => {
  const start = (page.value - 1) * props.perPage
  return props.partite.slice(start, start + props.perPage)
})

function go(n) {
  page.value = Math.min(Math.max(1, n), totalPages.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// reset pagina quando cambia la lista
watch(() => props.partite, () => { page.value = 1 })
</script>
