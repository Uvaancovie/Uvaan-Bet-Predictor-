<template>
  <div class="space-y-5 max-w-5xl mx-auto">
    <!-- Futuristic Holographic Tactical Banner -->
    <HoloPitchBanner />

    <!-- Control Bar: Competition Filter & Telemetry -->
    <div class="bg-[#0e121a] border border-[#1e2638] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hud-bracket">
      <!-- Competitions -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[#8d9bb0] font-mono text-[11px] uppercase tracking-wider">Target League:</span>
        <div class="flex gap-1 overflow-x-auto py-0.5">
          <button
            v-for="sport in SPORTS_CONFIG"
            :key="sport.key"
            @click="store.loadLiveOdds(sport.key)"
            :class="[
              'px-2.5 py-1 rounded text-xs font-mono font-medium transition whitespace-nowrap border',
              store.selectedLeague === sport.key
                ? 'bg-[#00f5ff]/15 text-[#00f5ff] border-[#00f5ff]/50'
                : 'bg-[#080a0f] text-[#8d9bb0] border-[#1e2638] hover:text-[#f0f4fc] hover:border-[#2b364e]'
            ]"
          >
            {{ sport.label }}
          </button>
        </div>
      </div>

      <!-- Live Fetch Status & Action -->
      <div class="flex items-center gap-3 text-[11px] font-mono text-[#8d9bb0] self-start sm:self-center">
        <span v-if="store.lastLiveFetchedAt" class="text-[10px] text-[#56647a]">
          {{ store.isLiveCached ? 'FIRESTORE_CACHE // 0_QUOTA' : 'LIVE_FEED // ACTIVE' }}
        </span>

        <button
          @click="store.loadLiveOdds(store.selectedLeague, true)"
          :disabled="store.isLiveLoading"
          class="px-3 py-1 text-xs text-[#00f5ff] hover:bg-[#00f5ff]/10 bg-[#080a0f] border border-[#00f5ff]/40 rounded font-mono transition flex items-center gap-1.5 disabled:opacity-40"
        >
          <span :class="store.isLiveLoading ? 'animate-spin' : ''">↻</span>
          <span>{{ store.isLiveLoading ? 'SCANNING...' : 'SYNC LIVE' }}</span>
        </button>
      </div>
    </div>

    <!-- Search filter input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Filter fixture by club or venue..."
        class="w-full bg-[#0e121a] border border-[#1e2638] rounded-xl px-3.5 py-2 text-xs font-mono text-[#f0f4fc] placeholder-[#56647a] focus:outline-none focus:border-[#00f5ff]/80 transition"
      />
      <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3.5 top-2.5 text-[#56647a] hover:text-[#f0f4fc] cursor-pointer text-xs">
        ✕
      </span>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredMatches.length === 0"
      class="bg-[#0e121a] border border-[#1e2638] rounded-xl p-10 text-center space-y-2 hud-bracket"
    >
      <div class="text-2xl text-[#00f5ff]">📡</div>
      <div class="text-xs font-mono text-[#f0f4fc]">NO TELEMETRY STREAM DETECTED</div>
      <p class="text-xs text-[#8d9bb0] max-w-sm mx-auto">
        No matches found matching query. Click "SYNC LIVE" or select another competition.
      </p>
    </div>

    <!-- Live Matches Grid / Minimalist Futuristic Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      <div
        v-for="match in filteredMatches"
        :key="match.id"
        class="bg-[#0e121a] border border-[#1e2638] rounded-xl p-4 transition-all duration-200 hover:border-[#00f5ff]/40 space-y-3 hud-bracket hud-glow flex flex-col justify-between"
      >
        <!-- Top: League badge & Kickoff countdown -->
        <div class="flex items-center justify-between text-[11px] font-mono border-b border-[#1e2638] pb-2.5">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#080a0f] text-[#00f5ff] border border-[#00f5ff]/30">
            {{ match.league }}
          </span>
          <div class="flex items-center gap-1.5 text-[#8d9bb0]">
            <span class="text-[#00f5ff]">⏱</span>
            <span>{{ formatKickoff(match.kickoff) }}</span>
          </div>
        </div>

        <!-- Middle: Club Crests, Team Names, and Market Odds Badges -->
        <div class="space-y-3">
          <!-- Teams -->
          <div class="flex items-center justify-between gap-3">
            <!-- Home Team -->
            <div class="flex items-center gap-2.5 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-[#080a0f] border border-[#1e2638] p-1 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  v-if="getCrest(match.homeTeam)"
                  :src="getCrest(match.homeTeam)"
                  :alt="match.homeTeam"
                  class="w-full h-full object-contain"
                  @error="(e: any) => (e.target.style.display = 'none')"
                />
                <span v-else class="text-[10px] font-mono text-[#00f5d4]">
                  {{ match.homeTeam.slice(0, 2).toUpperCase() }}
                </span>
              </div>
              <div class="font-medium text-xs sm:text-sm text-[#f0f4fc] truncate">
                {{ match.homeTeam }}
              </div>
            </div>

            <span class="text-[11px] font-mono text-[#56647a] shrink-0">VS</span>

            <!-- Away Team -->
            <div class="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
              <div class="font-medium text-xs sm:text-sm text-[#f0f4fc] truncate">
                {{ match.awayTeam }}
              </div>
              <div class="w-8 h-8 rounded-lg bg-[#080a0f] border border-[#1e2638] p-1 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  v-if="getCrest(match.awayTeam)"
                  :src="getCrest(match.awayTeam)"
                  :alt="match.awayTeam"
                  class="w-full h-full object-contain"
                  @error="(e: any) => (e.target.style.display = 'none')"
                />
                <span v-else class="text-[10px] font-mono text-[#f43f5e]">
                  {{ match.awayTeam.slice(0, 2).toUpperCase() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Market 1X2 Odds Pills -->
          <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono tabular-nums">
            <div class="bg-[#080a0f] border border-[#1e2638] rounded-lg p-2">
              <span class="text-[10px] text-[#00f5d4] block">1 (Home)</span>
              <span class="font-bold text-[#f0f4fc] mt-0.5 block">
                {{ (match.homeOdds / 100).toFixed(2) }}
              </span>
            </div>
            <div class="bg-[#080a0f] border border-[#1e2638] rounded-lg p-2">
              <span class="text-[10px] text-[#94a3b8] block">X (Draw)</span>
              <span class="font-bold text-[#f0f4fc] mt-0.5 block">
                {{ (match.drawOdds / 100).toFixed(2) }}
              </span>
            </div>
            <div class="bg-[#080a0f] border border-[#1e2638] rounded-lg p-2">
              <span class="text-[10px] text-[#f43f5e] block">2 (Away)</span>
              <span class="font-bold text-[#f0f4fc] mt-0.5 block">
                {{ (match.awayOdds / 100).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom Actions: Analyze in Lab & H2H Radar -->
        <div class="pt-2 border-t border-[#1e2638] flex items-center justify-between gap-2 text-xs font-mono">
          <span class="text-[10px] text-[#56647a]">
            Vig: {{ getVig(match) }}%
          </span>

          <div class="flex items-center gap-2">
            <button
              @click="openStats(match)"
              class="px-2.5 py-1 text-xs text-[#8d9bb0] hover:text-[#f0f4fc] bg-[#080a0f] border border-[#1e2638] rounded transition"
            >
              H2H Radar
            </button>
            <button
              @click="selectForAnalysis(match)"
              class="px-3 py-1 text-xs font-semibold text-black bg-[#00f5ff] hover:bg-[#38bdf8] rounded transition flex items-center gap-1 shadow-xs"
            >
              <span>Analyze</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Stats Modal -->
    <MatchStatsModal
      :isOpen="showStatsModal"
      :match="selectedMatchForStats"
      @close="showStatsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import type { MatchAnalysis } from '@/types';
import { SPORTS_CONFIG } from '@/lib/oddsApi';
import { getTeamStats } from '@/lib/teamAssets';
import HoloPitchBanner from './HoloPitchBanner.vue';
import MatchStatsModal from './MatchStatsModal.vue';

const store = useOddsStore();
const searchQuery = ref('');

const showStatsModal = ref(false);
const selectedMatchForStats = ref<MatchAnalysis | null>(null);

const filteredMatches = computed(() => {
  return store.matches.filter((m) => {
    if (!searchQuery.value.trim()) return true;
    const q = searchQuery.value.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q) ||
      m.league.toLowerCase().includes(q)
    );
  });
});

function getCrest(teamName: string): string {
  return getTeamStats(teamName).crest;
}

function getVig(match: MatchAnalysis): string {
  const ev = store.evaluateMatch(match);
  return ev.marginPercent.toFixed(1);
}

function openStats(match: MatchAnalysis) {
  selectedMatchForStats.value = match;
  showStatsModal.value = true;
}

function selectForAnalysis(match: MatchAnalysis) {
  // Ensure match is in store matches list
  if (!store.matches.some((m) => m.id === match.id)) {
    store.matches.unshift(match);
  }
  // Switch to Analyzer tab
  store.activeTab = 'analyzer';
  store.showToast(`Transferred ${match.homeTeam} v ${match.awayTeam} to Analyzer`);
}

function formatKickoff(kickoffIso: string): string {
  try {
    return new Date(kickoffIso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return kickoffIso;
  }
}
</script>
