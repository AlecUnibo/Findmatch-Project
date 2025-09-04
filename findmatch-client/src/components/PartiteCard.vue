<template>
  <div class="card mb-3 text-white component-partita-card" :class="getCardClass(partita.sport)">
    <div class="card-body d-flex justify-content-between align-items-center">
      <div>
        <div class="h5 card-title mb-1">{{ getSportIcon(partita.sport) }} {{ partita.sport }}</div>
        
        <p class="card-text mb-0">
          <strong>Data:</strong> {{ formatData(partita.date_time) }} –
          <strong>Ora:</strong> {{ formatOra(partita.date_time) }} –
          <strong>Luogo:</strong> {{ partita.location }}
        </p>

        <div class="d-flex align-items-center gap-2 mt-2">
          <!-- Badge coerente con Home: per calcio = posti da coprire -->
          <span
            class="badge bg-light text-dark posti-liberi-badge"
            :aria-label="isCalcio(partita)
              ? `${postiLiberi(partita)} posti da coprire`
              : `${postiLiberi(partita)} posti liberi`"
          >
            {{ postiLiberi(partita) }} {{ isCalcio(partita) ? 'posti da coprire' : 'posti liberi' }}
          </span>
        </div>

        <!-- Progress Bar -->
          <div class="progress fm-progress rounded-pill mt-2"
              role="progressbar"
              :aria-valuenow="Number(partita.partecipanti) || 0"
              aria-valuemin="0"
              :aria-valuemax="progressMax(partita)"
              :aria-label="`Progresso partecipazione: ${progressPercent(partita)}%`">
            <div
              class="progress-bar fm-progress-bar rounded-pill"
              :class="progressBarClass(partita)"
              :style="{ width: progressPercent(partita) + '%' }">
            </div>
          </div>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <button
          class="btn btn-sm btn-primary btn-details"
          @click="$emit('dettagli', partita)"
          :aria-label="`Mostra dettagli della partita ${partita.id}`"
          type="button"
        >
          Dettagli
        </button>


        <!-- Pulsanti gestione (solo per Create da te) -->
        <template v-if="showManage">
          <button
            class="btn btn-sm btn-primary btn-edit"
            type="button"
            @click="$emit('modifica', partita)"
            :aria-label="`Modifica partita ${partita.id}`"
          >
            Modifica
          </button>
          <button
            class="btn btn-sm btn-primary btn-delete"
            type="button"
            @click="$emit('elimina', partita)"
            :aria-label="`Elimina partita ${partita.id}`"
          >
            Elimina
          </button>
        </template>

        <!-- Join buttons (solo se showJoin === true, es. 'Disponibili') -->
        <template v-if="showJoin">
          <div v-if="isCalcio(partita)" class="dropdown join-dropdown">
    <button
      class="btn btn-sm btn-join dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      data-bs-display="static"
      aria-expanded="false"
      aria-haspopup="true"
      :aria-controls="`join-menu-${partita.id}`"
      aria-label="Scegli ruolo e unisciti"
    >
      Unisciti
    </button>

    <ul class="dropdown-menu dropdown-menu-end join-menu" :id="`join-menu-${partita.id}`" role="menu">
      <li>
        <button
          class="dropdown-item"
          @click="$emit('unisciti-calcio', { partita, roleKey: 'random' })"
          type="button"
          role="menuitem"
          aria-label="Unisciti casualmente"
        >
          Unisciti (casuale)
        </button>
      </li>

      <li role="separator" class="dropdown-divider"></li>

      <li v-for="(r, idx) in roleEntries(partita)" :key="`${partita.id}-${r.key}-${idx}`">
        <button
          class="dropdown-item"
          :disabled="r.count <= 0"
          @click="$emit('unisciti-calcio', { partita, roleKey: r.key })"
          type="button"
          role="menuitem"
          :aria-disabled="r.count <= 0 ? 'true' : 'false'"
          :aria-label="`Unisciti come ${ruoloLabel(r.key)} (${r.count} posti disponibili)`"
        >
          <span class="item-label">{{ ruoloLabel(r.key) }}</span>
          <span class="badge role-badge" aria-hidden="true">{{ r.count }}</span>
        </button>
      </li>

      <li v-if="roleEntries(partita).length === 0">
        <span class="dropdown-item disabled" aria-hidden="true">Nessun ruolo disponibile</span>
      </li>
    </ul>
  </div>

          <button
            v-else
            class="btn btn-sm btn-join"
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
  partita: { type: Object, required: true },
  showJoin: { type: Boolean, default: true },
  showManage: { type: Boolean, default: false }, // 👈 nuovo

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
})
defineEmits(['dettagli', 'unisciti', 'unisciti-calcio', 'modifica', 'elimina']) // 👈 nuovo
</script>
