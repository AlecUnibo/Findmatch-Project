<template>
  <div class="home-search-card card shadow-sm mb-4" role="search" aria-label="Ricerca partite">
    <div class="card-body py-3 px-3">
      <div class="row align-items-center g-2 justify-content-center home-search-row">

        <!-- Luogo -->
        <div class="col-12 col-sm-6 col-lg">
          <label for="autocomplete-luogo" class="visually-hidden">Luogo</label>
          <div class="fm-field glass">
            <img src="/images/map.svg" alt="" width="16" height="16" aria-hidden="true" />
            <input
              id="autocomplete-luogo"
              name="luogo"
              type="text"
              class="form-control fm-input"
              :value="luogo"
              @input="$emit('update:luogo', $event.target.value)"
              placeholder="Cerca luogo"
              aria-label="Cerca luogo"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- Sport -->
        <div class="col-12 col-sm-6 col-lg">
          <label for="select-sport-trigger" class="visually-hidden">Sport</label>

          <div class="fm-field glass is-select" ref="sportBox">
            <img src="/images/sport.svg" alt="" width="16" height="16" aria-hidden="true" />

            <!-- Trigger -->
            <button
              id="select-sport-trigger"
              type="button"
              class="fm-input fm-select-trigger"
              :aria-expanded="String(sportOpen)"
              aria-haspopup="listbox"
              aria-controls="sport-listbox"
              @click="toggleSport()"
              @keydown.down.prevent="openAndMove(1)"
              @keydown.up.prevent="openAndMove(-1)"
              @keydown.enter.prevent="confirmActiveSport()"
              @keydown.esc.prevent="closeSport()"
            >
              <span v-if="sport && sport.trim()">{{ sport }}</span>
              <span v-else class="fm-placeholder">Sport</span>
            </button>

            <span class="chevron" aria-hidden="true">▾</span>

            <!-- Popover -->
            <transition name="pop">
              <div
                v-if="sportOpen"
                class="select-popover glass shadow-lg"
                role="listbox"
                id="sport-listbox"
                :aria-activedescendant="activeSportId"
              >
                <button
                  v-for="(opt, i) in sports"
                  :key="opt"
                  class="select-option"
                  role="option"
                  :id="`sport-opt-${i}`"
                  :aria-selected="i === activeSportIndex"
                  @click="chooseSport(opt)"
                  @mousemove="activeSportIndex = i"
                >
                  <span class="dot" aria-hidden="true"></span>
                  <span>{{ opt }}</span>
                </button>

                <div class="edge-fade" aria-hidden="true"></div>
              </div>
            </transition>
          </div>
        </div>


        <!-- Data -->
        <div class="col-6 col-lg">
          <label for="date-field" class="visually-hidden">Data</label>
          <div class="fm-field glass">
            <input
              id="date-field"
              name="data"
              type="date"
              class="form-control fm-input"
              :value="data"
              @input="$emit('update:data', $event.target.value)"
              aria-label="Seleziona la data"
            />
          </div>
        </div>

        <!-- Ora -->
        <div class="col-6 col-lg">
          <label for="time-field" class="visually-hidden">Ora</label>
          <div class="fm-field glass">
            <input
              id="time-field"
              name="ora"
              type="time"
              class="form-control fm-input"
              :value="ora"
              @input="$emit('update:ora', $event.target.value)"
              aria-label="Seleziona l'ora"
            />
          </div>
        </div>


        <!-- Bottoni -->
        <div class="col-12 col-lg-auto">
          <div class="d-flex gap-2 flex-wrap justify-content-center justify-content-lg-start">
            <button
              type="button"
              class="btn btn-search d-flex align-items-center gap-2 btn-fluid"
              @click="$emit('cerca')"
              aria-label="Cerca partite"
            >
              <img src="/images/search-button.svg" alt="" aria-hidden="true" width="16" height="16" />
              <span>Cerca</span>
            </button>

            <button
              type="button"
              class="btn btn-delete d-flex align-items-center gap-2 btn-fluid"
              @click="$emit('pulisci')"
              aria-label="Pulisci filtri"
            >
              <img src="/images/trash.svg" alt="" aria-hidden="true" width="16" height="16" />
              <span>Pulisci</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* 1) Cattura props & emit (prima non li salvavi in variabili) */
const props = defineProps({
  luogo: { type: String, default: '' },
  sport: { type: String, default: '' },
  data:  { type: String, default: '' },
  ora:   { type: String, default: '' },
})
const emit = defineEmits([
  'update:luogo', 'update:sport', 'update:data', 'update:ora', 'cerca', 'pulisci'
])

/* 2) Stato per il custom select "Sport" (popup glass) */
const sports = [
  'Calcio a 11','Calcio a 5','Basket','Beach Volley','Pallavolo','Racchettoni','Tennis','Paddle'
]
const sportOpen = ref(false)
const activeSportIndex = ref(-1)
const sportBox = ref(null)

const activeSportId = computed(() =>
  activeSportIndex.value >= 0 ? `sport-opt-${activeSportIndex.value}` : null
)

const openSport = () => {
  sportOpen.value = true
  const idx = sports.findIndex(s => s === props.sport)
  activeSportIndex.value = idx >= 0 ? idx : 0
}
const closeSport = () => { sportOpen.value = false }
const toggleSport = () => { sportOpen.value ? closeSport() : openSport() }

const openAndMove = (dir) => {
  if (!sportOpen.value) openSport()
  const len = sports.length
  activeSportIndex.value = (activeSportIndex.value + dir + len) % len
}
const confirmActiveSport = () => {
  if (activeSportIndex.value >= 0) chooseSport(sports[activeSportIndex.value])
}
const chooseSport = (val) => {
  emit('update:sport', val)
  closeSport()
}

/* 3) Click fuori per chiudere il popover */
const onClickOutsideSport = (e) => {
  if (sportBox.value && !sportBox.value.contains(e.target)) closeSport()
}
onMounted(() => document.addEventListener('click', onClickOutsideSport))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutsideSport))

/* 4) (Opzionale) helper per inoltrare gli altri eventi dal template */
const onLuogo = e => emit('update:luogo', e.target.value)
const onData  = e => emit('update:data',  e.target.value)
const onOra   = e => emit('update:ora',   e.target.value)
</script>

