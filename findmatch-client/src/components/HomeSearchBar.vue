<template>
  <div class="row justify-content-center mb-4 g-2">
    <div class="col-md-3">
      <input
        id="autocomplete-luogo"
        type="text"
        class="form-control"
        :value="luogo"
        @input="$emit('update:luogo', $event.target.value)"
        placeholder="Cerca luogo"
      />
    </div>

    <div class="col-md-3">
      <select :value="sport" @change="$emit('update:sport', $event.target.value)" class="form-select">
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
      <input type="date" class="form-control" :value="data" @input="$emit('update:data', $event.target.value)" />
    </div>

    <div class="col-md-2">
      <input type="time" class="form-control" :value="ora" @input="$emit('update:ora', $event.target.value)" />
    </div>

    <div class="col-auto d-flex gap-2">
      <button class="btn btn-success d-flex align-items-center gap-2" @click="$emit('cerca')">
        <img src="/images/search-button.svg" alt="Cerca" width="16" height="16" />Cerca
      </button>
      <button class="btn btn-danger" @click="$emit('pulisci')">
        <img src="/images/trash.svg" alt="Pulisci" width="16" height="16" /> Pulisci
      </button>
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
