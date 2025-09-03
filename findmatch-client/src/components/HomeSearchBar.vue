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

          <div class="fm-field is-select has-picker" ref="sportBox">
            <img src="/images/sport.svg" alt="" width="16" height="16" aria-hidden="true" />

            <!-- display non interattivo (solo testo) -->
            <button
              id="select-sport-trigger"
              type="button"
              class="fm-input fm-select-trigger"
              tabindex="-1"
              aria-disabled="true"
            >
              <span v-if="sport && sport.trim()">{{ sport }}</span>
              <span v-else class="fm-placeholder">Seleziona uno sport</span>
            </button>

            <!-- freccia -->
            <button
              type="button"
              class="picker-affordance"
              @mousedown.prevent
              @click.stop="toggleSport()"
              @keydown.down.prevent="openAndMove(1)"
              @keydown.up.prevent="openAndMove(-1)"
              @keydown.enter.prevent="confirmActiveSport()"
              @keydown.esc.prevent="closeSport()"
              :aria-expanded="String(sportOpen)"
              aria-haspopup="listbox"
              aria-controls="sport-listbox"
              aria-label="Apri elenco sport"
            >
              <span aria-hidden="true">▾</span>
            </button>

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
        <div class="col-12 col-sm-6 col-lg">
          <label for="date-field" class="visually-hidden">Data</label>
          <div class="fm-field solid has-picker">
            <img src="/images/calendar.svg" alt="" width="16" height="16" aria-hidden="true" />
            <input
              id="date-field"
              ref="dateRef"
              name="data"
              type="date"
              class="form-control fm-input"
              v-model="dataModel"
              readonly
              @mousedown.prevent        
              @keydown.prevent          
              aria-label="Seleziona la data"
            />
            <button
              type="button"
              class="picker-affordance"
              @mousedown.prevent
              @click.stop="openDate"
              aria-label="Apri calendario"
            >
              <span aria-hidden="true">▾</span>
            </button>
          </div>
        </div>

        <!-- Ora -->
        <div class="col-12 col-sm-6 col-lg">
          <label for="time-field" class="visually-hidden">Ora</label>
          <div class="fm-field solid has-picker">
            <img src="/images/clock.svg" alt="" width="16" height="16" aria-hidden="true" />
            <input
              id="time-field"
              ref="timeRef"
              name="ora"
              type="time"
              class="form-control fm-input"
              v-model="oraModel"
              step="60"
              readonly
              @mousedown.prevent        
              @keydown.prevent          
              aria-label="Seleziona l'ora"
            />
            <button
              type="button"
              class="picker-affordance"
              @mousedown.prevent
              @click.stop="openTime"
              aria-label="Apri selettore ora"
            >
              <span aria-hidden="true">▾</span>
            </button>
          </div>
        </div>


        <!-- Bottoni -->
        <div class="col-12 col-lg-auto">
          <div class="d-flex gap-2 flex-wrap justify-content-center justify-content-lg-start">

            <button
              type="button"
              class="btn btn-primary btn-search btn-tap d-flex align-items-center gap-2"
              @click="emit('cerca')"
              aria-label="Avvia ricerca"
            >
              <img src="/images/search-button.svg" alt="" aria-hidden="true" width="16" height="16" />
              <span>Cerca</span>
            </button>

            <button
              type="button"
              class="btn btn-delete btn-tap d-flex align-items-center gap-2 btn-fluid"
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

/* Props & emit */
const props = defineProps({
  luogo: { type: String, default: '' },
  sport: { type: String, default: '' },
  data:  { type: String, default: '' },
  ora:   { type: String, default: '' },
})
const emit = defineEmits(['cerca', 'pulisci', 'update:luogo', 'update:sport', 'update:data', 'update:ora'])

/* v-model proxy */
const dataModel = computed({
  get: () => props.data,
  set: v => emit('update:data', v)
})
const oraModel = computed({
  get: () => props.ora,
  set: v => emit('update:ora', v)
})

/* --- Picker wiring --- */
const dateRef = ref(null)
const timeRef = ref(null)

const openPicker = (el) => {
  if (!el) return;

  // se l'input è readonly, rimuovilo temporaneamente
  const wasAttrReadonly = el.hasAttribute('readonly');
  const wasPropReadonly = el.readOnly;
  if (wasAttrReadonly || wasPropReadonly) {
    el.readOnly = false;
    if (wasAttrReadonly) el.removeAttribute('readonly');
  }

  const restoreReadonly = () => {
    // ripristina allo stato precedente nel microtask successivo
    Promise.resolve().then(() => {
      if (wasAttrReadonly) el.setAttribute('readonly', '');
      el.readOnly = wasPropReadonly;
    });
  };

  try {
    // Chromium (Chrome/Edge/Android)
    if (typeof el.showPicker === 'function') {
      el.showPicker();
      restoreReadonly();
      return;
    }

    // Fallback Safari/Firefox: focus + eventi click/mousedown reali
    el.focus({ preventScroll: true });
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
  } catch (_) {
    // ultimo tentativo
    try { el.focus(); el.click(); } catch {}
  } finally {
    restoreReadonly();
  }
};


const openDate = (ev) => {
  ev?.preventDefault?.()
  openPicker(dateRef.value)
}
const openTime = (ev) => {
  ev?.preventDefault?.()
  openPicker(timeRef.value)
}

/* --- Select Sport (come avevi) --- */
const sports = ['Calcio a 11','Calcio a 5','Basket','Beach Volley','Pallavolo','Racchettoni','Tennis','Paddle']
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
const chooseSport = (val) => { emit('update:sport', val); closeSport() }
const onClickOutsideSport = (e) => { if (sportBox.value && !sportBox.value.contains(e.target)) closeSport() }
onMounted(() => document.addEventListener('click', onClickOutsideSport))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutsideSport))

/* (se ti serve) luogo handler */
const onLuogo = e => emit('update:luogo', e.target.value)
</script>
