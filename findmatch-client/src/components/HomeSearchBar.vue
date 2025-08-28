<template>
  <div class="home-search-card card shadow-sm mb-4" role="search" aria-label="Ricerca partite">
    <div class="card-body py-3 px-3">
      <div class="row align-items-center g-2 flex-nowrap justify-content-center">

        <div class="col-md-3">
          <label for="autocomplete-luogo" class="visually-hidden">Luogo</label>
          <input
            id="autocomplete-luogo"
            name="luogo"
            type="text"
            class="form-control"
            :value="luogo"
            @input="$emit('update:luogo', $event.target.value)"
            placeholder="Cerca luogo"
            aria-label="Cerca luogo"
            autocomplete="off"
          />
        </div>

        <div class="col-md-3">
          <label for="select-sport" class="visually-hidden">Sport</label>
          <select
            id="select-sport"
            name="sport"
            :value="sport"
            @change="$emit('update:sport', $event.target.value)"
            class="form-select"
            aria-label="Seleziona uno sport"
          >
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
          <label for="date-field" class="visually-hidden">Data</label>
          <input
            id="date-field"
            name="data"
            type="date"
            class="form-control"
            :value="data"
            @input="$emit('update:data', $event.target.value)"
            aria-label="Seleziona la data"
          />
        </div>

        <div class="col-md-2">
          <label for="time-field" class="visually-hidden">Ora</label>
          <input
            id="time-field"
            name="ora"
            type="time"
            class="form-control"
            :value="ora"
            @input="$emit('update:ora', $event.target.value)"
            aria-label="Seleziona l'ora"
          />
        </div>

        <div class="col-auto d-flex gap-2">
          <button
            type="button"
            class="btn btn-success d-flex align-items-center gap-2"
            @click="$emit('cerca')"
            aria-label="Cerca partite"
          >
            <img src="/images/search-button.svg" alt="" aria-hidden="true" width="16" height="16" />
            <span>Cerca</span>
          </button>

          <button
            type="button"
            class="btn btn-danger d-flex align-items-center gap-2"
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
</template>

<script setup>
defineProps({
  luogo: { type: String, default: '' },
  sport: { type: String, default: '' },
  data: { type: String, default: '' },
  ora: { type: String, default: '' },
});
defineEmits(['update:luogo', 'update:sport', 'update:data', 'update:ora', 'cerca', 'pulisci']);
</script>
