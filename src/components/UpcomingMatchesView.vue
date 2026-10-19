<template>
  <div class="space-y-5">
    <HoloPitchBanner />

    <section class="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <span class="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">League</span>
          <div class="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="League">
            <button
              v-for="sport in SPORTS_CONFIG"
              :key="sport.key"
              type="button"
              @click="store.loadLiveOdds(sport.key)"
              :aria-pressed="store.selectedLeague === sport.key"
              :class="[
                'shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition',
                store.selectedLeague === sport.key
                  ? 'border-accent/50 bg-accent/15 text-accent'
                  : 'border-line bg-inset text-muted hover:border-line-strong hover:text-ink'
              ]"
            >
              {{ sport.label }}
            </button>
          </div>
        </div>

        <button
          type="button"
          @click="store.loadLiveOdds(store.selectedLeague, true)"
          :disabled="store.isLiveLoading"
          class="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-accent/40 bg-inset px-3 text-xs font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-40 lg:self-center"
        >
          <span :class="store.isLiveLoading ? 'inline-block animate-spin' : ''" aria-hidden="true">↻</span>
          <span>{{ store.isLiveLoading ? 'Syncing…' : 'Sync live odds' }}</span>
        </button>
      </div>
    </section>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label class="relative block min-w-0 flex-1">
        <span class="sr-only">Search fixtures</span>
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" stroke-width="1.6" />
          <path d="M12.5 12.5 17 17" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search club or league"
          class="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-faint hover:text-ink"
          aria-label="Clear search"
        >
          ✕
        </button>
      </label>
      <p class="text-xs text-faint sm:shrink-0">
        {{ filteredMatches.length }} {{ filteredMatches.length === 1 ? 'fixture' : 'fixtures' }}
      </p>
    </div>

    <div
      v-if="filteredMatches.length === 0"
      class="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center"
    >
      <h2 class="text-base font-semibold text-ink">No fixtures match</h2>
      <p class="mx-auto mt-1 max-w-sm text-sm text-muted">
        Try another club name, or sync live odds for a different league.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-3.5 md:grid-cols-2" :aria-busy="store.isLiveLoading">
      <article
        v-for="match in filteredMatches"
        :key="match.id"
        class="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/40"
      >
        <div class="flex items-center justify-between gap-3 border-b border-line pb-3 text-xs">
          <span class="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-accent">
            {{ match.league }}
          </span>
          <div class="text-right">
            <div class="font-medium text-ink">{{ formatKickoff(match.kickoff).primary }}</div>
            <div v-if="formatKickoff(match.kickoff).relative" class="text-[11px] text-faint">
              {{ formatKickoff(match.kickoff).relative }}
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 items-center gap-2.5">
              <div class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-inset p-1">
                <img
                  v-if="getCrest(match.homeTeam) && !hiddenCrests[match.homeTeam]"
                  :src="getCrest(match.homeTeam)"
                  :alt="''"
                  class="h-full w-full object-contain"
                  @error="hideCrest(match.homeTeam)"
                />
                <span v-else class="font-mono text-[11px] font-semibold text-home">{{ initials(match.homeTeam) }}</span>
              </div>
              <div class="truncate text-sm font-semibold text-ink sm:text-base">{{ match.homeTeam }}</div>
            </div>

            <span class="shrink-0 font-mono text-[11px] text-faint">vs</span>

            <div class="flex min-w-0 flex-1 items-center justify-end gap-2.5 text-right">
              <div class="truncate text-sm font-semibold text-ink sm:text-base">{{ match.awayTeam }}</div>
              <div class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-inset p-1">
                <img
                  v-if="getCrest(match.awayTeam) && !hiddenCrests[match.awayTeam]"
                  :src="getCrest(match.awayTeam)"
                  :alt="''"
                  class="h-full w-full object-contain"
                  @error="hideCrest(match.awayTeam)"
                />
                <span v-else class="font-mono text-[11px] font-semibold text-away">{{ initials(match.awayTeam) }}</span>
              </div>
            </div>
          </div>

          <!-- Momentum & H2H Performance Bar -->
          <div class="rounded-xl border border-line bg-inset/70 p-2.5 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <div class="flex items-center gap-1.5 text-home">
                <span class="font-semibold">{{ getMatchQuant(match).homeMomentum.momentumScore }} pts</span>
                <span :class="getTrendColor(getMatchQuant(match).homeMomentum.trend)" class="text-[10px]">
                  {{ getTrendSymbol(getMatchQuant(match).homeMomentum.trend) }}
                </span>
                <span class="text-[10px] text-faint truncate max-w-[90px]">{{ match.homeTeam }}</span>
              </div>

              <div class="text-[10px] text-faint">
                <span v-if="Math.abs(getMatchQuant(match).momentumDiff) >= 5" class="text-accent font-semibold">
                  Δ {{ Math.abs(getMatchQuant(match).momentumDiff) }} pt edge
                </span>
                <span v-else class="text-faint">Even Momentum</span>
              </div>

              <div class="flex items-center gap-1.5 text-away justify-end">
                <span class="text-[10px] text-faint truncate max-w-[90px]">{{ match.awayTeam }}</span>
                <span :class="getTrendColor(getMatchQuant(match).awayMomentum.trend)" class="text-[10px]">
                  {{ getTrendSymbol(getMatchQuant(match).awayMomentum.trend) }}
                </span>
                <span class="font-semibold">{{ getMatchQuant(match).awayMomentum.momentumScore }} pts</span>
              </div>
            </div>

            <!-- Momentum split meter -->
            <div class="w-full h-1.5 rounded-full overflow-hidden flex bg-line">
              <div
                class="bg-home h-full transition-all"
                :style="{ width: `${getMatchQuant(match).homeMomentum.momentumScore / (getMatchQuant(match).homeMomentum.momentumScore + getMatchQuant(match).awayMomentum.momentumScore) * 100}%` }"
              ></div>
              <div
                class="bg-away h-full transition-all"
                :style="{ width: `${getMatchQuant(match).awayMomentum.momentumScore / (getMatchQuant(match).homeMomentum.momentumScore + getMatchQuant(match).awayMomentum.momentumScore) * 100}%` }"
              ></div>
            </div>

            <!-- H2H quick summary row -->
            <div class="flex items-center justify-between text-[11px] text-muted pt-0.5">
              <span class="font-mono text-[10px]">
                H2H: {{ getMatchQuant(match).h2hSummary.homeWins }}W - {{ getMatchQuant(match).h2hSummary.draws }}D - {{ getMatchQuant(match).h2hSummary.awayWins }}L
                <span class="text-faint">({{ getMatchQuant(match).h2hSummary.totalPlayed }} games)</span>
              </span>
              <span class="font-mono text-[10px] text-accent">
                BTTS {{ getMatchQuant(match).h2hSummary.bttsPct }}% • O2.5 {{ getMatchQuant(match).h2hSummary.over25Pct }}%
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              @click="store.addToSlip(match, 'home')"
              title="Add home to bet slip simulator"
              :class="[
                'rounded-lg border px-2 py-2 transition relative',
                getMatchQuant(match).recommendedOutcome === 'home' && getMatchQuant(match).hasPositiveEdge
                  ? 'border-accent bg-accent/15 ring-1 ring-accent/30'
                  : 'border-line bg-inset hover:border-accent/50 hover:bg-accent/10'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-home">Home</span>
                <span
                  v-if="getMatchQuant(match).edgeHome > 0"
                  class="text-[9px] font-mono text-accent"
                >
                  +{{ (getMatchQuant(match).edgeHome * 100).toFixed(1) }}%
                </span>
              </div>
              <div class="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">{{ decimal(match.homeOdds) }}</div>
            </button>
            <button
              type="button"
              @click="store.addToSlip(match, 'draw')"
              title="Add draw to bet slip simulator"
              :class="[
                'rounded-lg border px-2 py-2 transition relative',
                getMatchQuant(match).recommendedOutcome === 'draw' && getMatchQuant(match).hasPositiveEdge
                  ? 'border-accent bg-accent/15 ring-1 ring-accent/30'
                  : 'border-line bg-inset hover:border-accent/50 hover:bg-accent/10'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-draw">Draw</span>
                <span
                  v-if="getMatchQuant(match).edgeDraw > 0"
                  class="text-[9px] font-mono text-accent"
                >
                  +{{ (getMatchQuant(match).edgeDraw * 100).toFixed(1) }}%
                </span>
              </div>
              <div class="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">{{ decimal(match.drawOdds) }}</div>
            </button>
            <button
              type="button"
              @click="store.addToSlip(match, 'away')"
              title="Add away to bet slip simulator"
              :class="[
                'rounded-lg border px-2 py-2 transition relative',
                getMatchQuant(match).recommendedOutcome === 'away' && getMatchQuant(match).hasPositiveEdge
                  ? 'border-accent bg-accent/15 ring-1 ring-accent/30'
                  : 'border-line bg-inset hover:border-accent/50 hover:bg-accent/10'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-away">Away</span>
                <span
                  v-if="getMatchQuant(match).edgeAway > 0"
                  class="text-[9px] font-mono text-accent"
                >
                  +{{ (getMatchQuant(match).edgeAway * 100).toFixed(1) }}%
                </span>
              </div>
              <div class="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">{{ decimal(match.awayOdds) }}</div>
            </button>
          </div>
          <div class="flex items-center justify-between text-[11px] text-faint">
            <span>Tap odds to add to simulator.</span>
            <span v-if="getMatchQuant(match).hasPositiveEdge" class="text-accent font-medium">
              🎯 Model edge on {{ getMatchQuant(match).recommendedOutcome.toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 border-t border-line pt-3">
          <span class="font-mono text-[11px] text-faint">Margin {{ getVig(match) }}%</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="addBestValue(match)"
              title="Add the highest-edge outcome to the slip simulator"
              class="min-h-9 rounded-lg border border-accent/40 bg-accent/10 px-3 text-xs font-semibold text-accent transition hover:bg-accent/20"
            >
              ＋ Slip
            </button>
            <button
              type="button"
              @click="openStats(match, 'momentum')"
              class="min-h-9 rounded-lg border border-line bg-inset px-3 text-xs font-medium text-muted transition hover:text-ink flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>H2H & Form</span>
            </button>
            <button
              type="button"
              @click="selectForAnalysis(match)"
              class="min-h-9 rounded-lg bg-accent px-3 text-xs font-semibold text-app transition hover:brightness-110"
            >
              Analyze
            </button>
          </div>
        </div>
      </article>
    </div>

    <MatchStatsModal
      :isOpen="showStatsModal"
      :match="selectedMatchForStats"
      :initialTab="statsInitialTab"
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
const statsInitialTab = ref<'momentum' | 'forecast' | 'tactical'>('momentum');
const selectedMatchForStats = ref<MatchAnalysis | null>(null);
const hiddenCrests = ref<Record<string, true>>({});

const quantCache = new Map<string, any>();
function getMatchQuant(match: MatchAnalysis) {
  const key = `${match.id}_${match.homeOdds}_${match.drawOdds}_${match.awayOdds}`;
  if (!quantCache.has(key)) {
    quantCache.set(key, store.getMatchQuantPrediction(match));
  }
  return quantCache.get(key);
}

function getTrendColor(trend: 'surging' | 'stable' | 'declining'): string {
  if (trend === 'surging') return 'text-emerald-400';
  if (trend === 'declining') return 'text-rose-400';
  return 'text-slate-400';
}

function getTrendSymbol(trend: 'surging' | 'stable' | 'declining'): string {
  if (trend === 'surging') return '▲';
  if (trend === 'declining') return '▼';
  return '▬';
}

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

function hideCrest(teamName: string) {
  hiddenCrests.value = { ...hiddenCrests.value, [teamName]: true };
}

function initials(teamName: string): string {
  const parts = teamName.split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => part[0] ?? '').join('');
  return (letters || teamName.slice(0, 2)).toUpperCase();
}

function decimal(oddsTimes100: number): string {
  return (oddsTimes100 / 100).toFixed(2);
}

function getVig(match: MatchAnalysis): string {
  const ev = store.evaluateMatch(match);
  return ev.marginPercent.toFixed(1);
}

function openStats(match: MatchAnalysis, tab: 'momentum' | 'forecast' | 'tactical' = 'momentum') {
  selectedMatchForStats.value = match;
  statsInitialTab.value = tab;
  showStatsModal.value = true;
}

function addBestValue(match: MatchAnalysis) {
  const quant = getMatchQuant(match);
  store.addToSlip(match, quant.recommendedOutcome);
}

function selectForAnalysis(match: MatchAnalysis) {
  if (!store.matches.some((m) => m.id === match.id)) {
    store.matches.unshift(match);
  }
  store.focusedMatchId = match.id;
  store.activeTab = 'analyzer';
  store.showToast(`Opened ${match.homeTeam} v ${match.awayTeam} in the analyzer`);
}

function formatKickoff(kickoffIso: string): { primary: string; relative: string } {
  const parsed = new Date(kickoffIso);
  if (Number.isNaN(parsed.getTime())) return { primary: kickoffIso, relative: '' };
  const primary = parsed.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const diffMs = parsed.getTime() - Date.now();
  const hours = Math.round(diffMs / 36e5);
  let relative = '';
  if (hours < 0) relative = 'Started';
  else if (hours < 1) relative = 'Within the hour';
  else if (hours < 48) relative = `In ${hours}h`;
  return { primary, relative };
}
</script>
