<template>
  <div class="card mb-3 text-white component-partita-card" :class="getCardClass(partita.sport)">
    <div class="card-body d-flex justify-content-between align-items-center">
      <div>
        <h5 class="card-title mb-1">{{ getSportIcon(partita.sport) }} {{ partita.sport }}</h5>

        <p class="card-text mb-0">
          <strong>Data:</strong> {{ formatData(partita.date_time) }} –
          <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
          <strong>Luogo:</strong> {{ partita.location }}
        </p>

        <div class="d-flex align-items-center gap-2 mt-2">
          <span class="badge bg-light text-dark posti-liberi-badge" :aria-label="`${postiLiberi(partita)} posti liberi`">
            {{ postiLiberi(partita) }} posti liberi
          </span>
        </div>

        <div class="progress progress--thin mt-2" role="progressbar"
             :aria-valuenow="partita.partecipanti ?? 0"
             :aria-valuemin="0"
             :aria-valuemax="partita.max_players ?? progressMax(partita)"
             :aria-label="`Progresso partecipazione: ${progressPercent(partita)} percento`">
          <div
            class="progress-bar"
            :class="progressBarClass(partita)"
            :style="{ width: progressPercent(partita) + '%' }"
          ></div>
        </div>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <button
          class="btn btn-sm btn-primary"
          @click="$emit('dettagli', partita)"
          :aria-label="`Mostra dettagli della partita ${partita.id}`"
          type="button"
        >
          Dettagli
        </button>

        <!-- Join buttons -->
        <template v-if="showJoin">
          <div v-if="isCalcio(partita)" class="dropdown">
            <button
              class="btn btn-sm btn-success dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              data-bs-display="static"
              data-bs-auto-close="outside"
              aria-expanded="false"
              aria-label="Scegli ruolo e unisciti"
            >
              Unisciti
            </button>

            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  class="dropdown-item"
                  @click="$emit('unisciti-calcio', { partita, roleKey: 'random' })"
                  type="button"
                  aria-label="Unisciti casualmente"
                >
                  Unisciti (casuale)
                </button>
              </li>

              <li><hr class="dropdown-divider" /></li>

              <li
                v-for="(r, idx) in roleEntries(partita)"
                :key="`${partita.id}-${r.key}-${idx}`"
              >
                <button
                  class="dropdown-item"
                  :disabled="r.count <= 0"
                  @click="$emit('unisciti-calcio', { partita, roleKey: r.key })"
                  type="button"
                  :aria-disabled="r.count <= 0 ? 'true' : 'false'"
                  :aria-label="`Unisciti come ${ruoloLabel(r.key)} (${r.count} posti disponibili)`"
                >
                  {{ ruoloLabel(r.key) }}
                  <span class="badge bg-secondary ms-2" aria-hidden="true">{{ r.count }}</span>
                </button>
              </li>

              <li v-if="roleEntries(partita).length === 0">
                <span class="dropdown-item disabled" aria-hidden="true">Nessun ruolo disponibile</span>
              </li>
            </ul>
          </div>

          <button
            v-else
            class="btn btn-sm btn-success"
            @click="$emit('unisciti', partita)"
            type="button"
            :aria-label="`Unisciti alla partita ${partita.id}`"
          >
            Unisciti
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  partita: Object,
  showJoin: { type: Boolean, default: true },

  // helper functions passate dal parent
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
});
defineEmits(['dettagli', 'unisciti', 'unisciti-calcio']);
</script>
