<template>
  <div class="leaderboard component-leaderboard mb-4 mt-4">
    <h2>Classifica - Questo mese</h2>
    <h5>FUTURA IMPLEMENTAZIONE</h5>
    <ul>
      <li v-for="(player, index) in players" :key="player.username" :class="rankClass(index)">
        <div class="rank">#{{ index + 1 }}</div>
        <img :src="player.avatar" alt="avatar" class="avatar" />
        <div class="info">
          <span class="username">{{ player.username }}</span>
          <span class="points">{{ player.points }} pt</span>
        </div>
        <div class="medal" v-if="index < 3">{{ medalEmoji(index) }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      players: [
        { username: 'Luca', points: 120, avatar: 'https://i.pravatar.cc/50?img=1' },
        { username: 'Alec03', points: 110, avatar: 'https://i.pravatar.cc/50?img=2' },
        { username: 'Ghiso', points: 95, avatar: 'https://i.pravatar.cc/50?img=3' },
        { username: 'SteTasso', points: 90, avatar: 'https://i.pravatar.cc/50?img=4' },
        { username: 'Marco', points: 85, avatar: 'https://i.pravatar.cc/50?img=7' },
      ]
    }
  },
  methods: {
    medalEmoji(index) {
      return ['🥇', '🥈', '🥉'][index];
    },
    rankClass(index) {
      return index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
    }
  }
}
</script>
