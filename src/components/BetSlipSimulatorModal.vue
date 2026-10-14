<template>
  <div
    v-if="store.isSlipOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Bet slip simulator"
    @click.self="store.closeSlip()"
    @keydown.esc="store.closeSlip()"
  >
    <div
      class="my-auto max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl border border-[#243044] bg-[#111722] p-4 sm:p-5"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 border-b border-[#243044] pb-3">
        <div>
          <h2 class="text-sm font-medium text-[#eef3fb] sm:text-base">
            Bet slip simulator 🎲
          </h2>
          <p class="mt-0.5 text-xs text-[#93a0b8]">
            Build a slip, randomize stakes, and Monte-Carlo the payout with model probabilities.
          </p>
        </div>
        <button
          type="button"
          @click="store.closeSlip()"
          class="rounded p-1 text-sm text-[#93a0b8] transition hover:text-[#eef3fb]"
          aria-label="Close simulator"
        >
          ✕
        </button>
      </div>

      <!-- Empty slip -->
      <div
        v-if="store.slipLegs.length === 0"
        class="rounded-lg border border-dashed border-[#243044] bg-[#0b0f16] p-6 text-center text-xs text-[#93a0b8]"
      >
        <p class="font-medium text-[#eef3fb]">Your slip is empty</p>
        <p class="mx-auto mt-1 max-w-sm">
          Add legs from Upcoming (＋ Slip) or the Analyzer (Add to slip). They'll appear here for simulation.
        </p>
        <button
          type="button"
          @click="quickPick()"
          class="mt-3 rounded-lg bg-[#00f5ff] px-4 py-1.5 text-xs font-medium text-[#041016] transition hover:brightness-110"
        >
          Quick pick 3 value legs
        </button>
      </div>

      <template v-else>
        <!-- Mode toggle -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1 rounded-lg border border-[#243044] bg-[#0b0f16] p-1 text-xs">
            <button
              v-for="m in (['singles', 'parlay'] as const)"
              :key="m"
              type="button"
              @click="mode = m"
              :class="[
                'rounded px-3 py-1 font-medium capitalize transition',
                mode === m
                  ? 'border border-[#33445c] bg-[#1c2738] text-[#eef3fb]'
                  : 'text-[#93a0b8] hover:text-[#eef3fb]'
              ]"
            >
              {{ m }}
            </button>
          </div>
          <button
            type="button"
            @click="store.clearSlip(); simResult = null"
            class="text-xs text-[#64748b] underline hover:text-[#f87171]"
          >
            Clear slip
          </button>
        </div>

        <!-- Legs -->
        <div class="space-y-2">
          <div
            v-for="leg in store.slipLegs"
            :key="leg.matchId"
            class="flex flex-col gap-2 rounded-lg border border-[#243044] bg-[#0b0f16] p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <div class="truncate font-medium text-[#eef3fb]">
                {{ leg.homeTeam }} <span class="text-[#64748b]">v</span> {{ leg.awayTeam }}
              </div>
              <div class="mt-0.5 font-mono text-[11px] text-[#93a0b8]">
                <span class="uppercase text-[#00f5ff]">{{ leg.outcome }}</span>
                @ {{ (leg.odds / 100).toFixed(2) }}
                · model {{ (leg.modelProb * 100).toFixed(1) }}%
                · <span :class="leg.edge >= 0 ? 'text-[#2dd4bf]' : 'text-[#f87171]'">
                  {{ leg.edge >= 0 ? '+' : '' }}{{ (leg.edge * 100).toFixed(1) }}% edge
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 font-mono text-[11px] text-[#93a0b8]">
                Stake
                <input
                  v-model.number="stakes[leg.matchId]"
                  type="number"
                  min="1"
                  step="1"
                  class="w-20 rounded-lg border border-[#243044] bg-[#111722] px-2 py-1 text-xs text-[#eef3fb] focus:border-[#00f5ff] focus:outline-none"
                />
              </label>
              <button
                type="button"
                @click="randomizeLeg(leg.matchId)"
                title="Random stake for this leg"
                class="rounded-lg border border-[#243044] bg-[#171e2c] px-2 py-1 text-xs text-[#93a0b8] transition hover:text-[#eef3fb]"
              >
                🎲
              </button>
              <button
                type="button"
                @click="store.removeFromSlip(leg.matchId)"
                class="p-1 text-[#64748b] transition hover:text-[#f87171]"
                aria-label="Remove leg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Stake controls -->
        <div class="grid grid-cols-2 gap-2.5 rounded-lg border border-[#243044] bg-[#0b0f16] p-3 text-xs sm:grid-cols-4">
          <div>
            <label class="mb-1 block text-[11px] text-[#93a0b8]">Min stake</label>
            <input
              v-model.number="minStake"
              type="number"
              min="1"
              class="w-full rounded-lg border border-[#243044] bg-[#111722] px-2 py-1.5 font-mono text-xs text-[#eef3fb] focus:border-[#00f5ff] focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-[11px] text-[#93a0b8]">Max stake</label>
            <input
              v-model.number="maxStake"
              type="number"
              min="1"
              class="w-full rounded-lg border border-[#243044] bg-[#111722] px-2 py-1.5 font-mono text-xs text-[#eef3fb] focus:border-[#00f5ff] focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-[11px] text-[#93a0b8]">Simulations</label>
            <select
              v-model.number="numSims"
              class="w-full rounded-lg border border-[#243044] bg-[#111722] px-2 py-1.5 font-mono text-xs text-[#eef3fb] focus:border-[#00f5ff] focus:outline-none"
            >
              <option :value="1000">1,000</option>
              <option :value="5000">5,000</option>
              <option :value="20000">20,000</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button
              type="button"
              @click="randomizeAll()"
              class="flex-1 rounded-lg border border-[#00f5ff]/40 bg-[#00f5ff]/10 px-2 py-1.5 text-xs font-medium text-[#00f5ff] transition hover:bg-[#00f5ff]/20"
            >
              🎲 Randomize
            </button>
          </div>
        </div>

        <!-- Slip summary -->
        <div class="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-[#243044] bg-[#0b0f16] p-3 font-mono text-[11px] text-[#93a0b8]">
          <span>Total stake: <strong class="text-[#eef3fb]">{{ totalStake.toFixed(0) }}</strong></span>
          <span v-if="mode === 'parlay'">
            Combined: <strong class="text-[#00f5ff]">{{ combinedOdds.toFixed(2) }}</strong>
          </span>
          <span v-if="mode === 'parlay'">
            To win: <strong class="text-[#2dd4bf]">{{ potentialPayout.toFixed(0) }}</strong>
            ({{ parlayProbPercent }})
          </span>
          <span v-else>
            To win: <strong class="text-[#2dd4bf]">{{ singlesPotential.toFixed(0) }}</strong>
            (if all hit)
          </span>
        </div>

        <!-- Run -->
        <button
          type="button"
          @click="runSimulation()"
          :disabled="store.slipLegs.length === 0"
          class="w-full rounded-lg bg-[#00f5ff] py-2 text-xs font-semibold text-[#041016] transition hover:brightness-110 disabled:opacity-40"
        >
          Simulate {{ numSims.toLocaleString() }} outcomes with random stakes ({{ minStake }}–{{ maxStake }})
        </button>

        <!-- Results -->
        <div v-if="simResult" class="space-y-3 rounded-lg border border-[#00f5ff]/30 bg-[#00f5ff]/5 p-3">
          <div class="text-xs font-medium text-[#eef3fb]">
            Simulation result
            <span class="ml-1 font-mono text-[10px] font-normal text-[#64748b]">
              {{ simResult.trials.toLocaleString() }} trials · {{ mode }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <div class="rounded-lg border border-[#243044] bg-[#0b0f16] p-2.5">
              <div class="text-[10px] uppercase tracking-wide text-[#93a0b8]">Hit rate</div>
              <div class="mt-0.5 font-mono text-base font-semibold text-[#eef3fb]">
                {{ (simResult.hitRate * 100).toFixed(1) }}%
              </div>
            </div>
            <div class="rounded-lg border border-[#243044] bg-[#0b0f16] p-2.5">
              <div class="text-[10px] uppercase tracking-wide text-[#93a0b8]">Avg profit</div>
              <div
                class="mt-0.5 font-mono text-base font-semibold"
                :class="simResult.meanProfit >= 0 ? 'text-[#2dd4bf]' : 'text-[#f87171]'"
              >
                {{ simResult.meanProfit >= 0 ? '+' : '' }}{{ simResult.meanProfit.toFixed(1) }}
              </div>
            </div>
            <div class="rounded-lg border border-[#243044] bg-[#0b0f16] p-2.5">
              <div class="text-[10px] uppercase tracking-wide text-[#93a0b8]">Median return</div>
              <div class="mt-0.5 font-mono text-base font-semibold text-[#eef3fb]">
                {{ simResult.medianReturn.toFixed(0) }}
              </div>
            </div>
            <div class="rounded-lg border border-[#243044] bg-[#0b0f16] p-2.5">
              <div class="text-[10px] uppercase tracking-wide text-[#93a0b8]">ROI</div>
              <div
                class="mt-0.5 font-mono text-base font-semibold"
                :class="simResult.roi >= 0 ? 'text-[#38bdf8]' : 'text-[#94a3b8]'"
              >
                {{ simResult.roi >= 0 ? '+' : '' }}{{ (simResult.roi * 100).toFixed(1) }}%
              </div>
            </div>
          </div>
          <div class="font-mono text-[11px] text-[#93a0b8]">
            Staked {{ simResult.totalStaked.toFixed(0) }} · returned {{ simResult.totalReturned.toFixed(0) }} ·
            best {{ simResult.bestProfit.toFixed(0) }} / worst {{ simResult.worstProfit.toFixed(0) }} per slip
            <span v-if="mode === 'parlay'" class="text-[#64748b]">
              · model parlay prob {{ (simResult.theoreticalProb * 100).toFixed(1) }}%
            </span>
          </div>
          <!-- Simple profit histogram -->
          <div class="space-y-1">
            <div class="text-[10px] uppercase tracking-wide text-[#64748b]">Profit distribution</div>
            <div class="flex h-12 items-end gap-0.5">
              <div
                v-for="(h, i) in simResult.histogram"
                :key="i"
                :title="`${h.label}: ${h.count}`"
                :style="{ height: `${Math.max(4, (h.count / simResult.maxBucket) * 100)}%` }"
                :class="[
                  'min-w-0 flex-1 rounded-sm',
                  h.profitable ? 'bg-[#0d9488]' : 'bg-[#e11d48]/60'
                ]"
              />
            </div>
            <div class="flex justify-between font-mono text-[10px] text-[#64748b]">
              <span>loss</span><span>break-even</span><span>profit →</span>
            </div>
          </div>
          <p class="text-[11px] text-[#64748b]">
            Educational simulation using model probabilities — not a prediction of actual results. Flat random stakes only.
          </p>
        </div>
      </template>

      <!-- Footer -->
      <div class="flex justify-end border-t border-[#243044] pt-2">
        <button
          type="button"
          @click="store.closeSlip()"
          class="rounded-lg border border-[#243044] bg-[#171e2c] px-4 py-1.5 text-xs text-[#93a0b8] transition hover:text-[#eef3fb]"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';

const store = useOddsStore();

const mode = ref<'singles' | 'parlay'>('parlay');
const minStake = ref(10);
const maxStake = ref(100);
const numSims = ref(5000);
const stakes = ref<Record<string, number>>({});

interface SimResult {
  trials: number;
  hitRate: number;
  meanProfit: number;
  medianReturn: number;
  roi: number;
  totalStaked: number;
  totalReturned: number;
  bestProfit: number;
  worstProfit: number;
  theoreticalProb: number;
  histogram: { count: number; label: string; profitable: boolean }[];
  maxBucket: number;
}

const simResult = ref<SimResult | null>(null);

// Keep a stake entry for every leg, defaulting to midpoint
watch(
  () => store.slipLegs.map((l) => l.matchId).join(','),
  () => {
    for (const leg of store.slipLegs) {
      if (stakes.value[leg.matchId] === undefined || stakes.value[leg.matchId] <= 0) {
        stakes.value[leg.matchId] = Math.round((minStake.value + maxStake.value) / 2);
      }
    }
    simResult.value = null;
  },
  { immediate: true }
);

function randStake(): number {
  const lo = Math.max(1, Math.min(minStake.value, maxStake.value));
  const hi = Math.max(lo, Math.max(minStake.value, maxStake.value));
  return Math.round(lo + Math.random() * (hi - lo));
}

function randomizeLeg(matchId: string) {
  stakes.value[matchId] = randStake();
}

function randomizeAll() {
  for (const leg of store.slipLegs) {
    stakes.value[leg.matchId] = randStake();
  }
}

function quickPick() {
  // Pick up to 3 highest-edge upcoming matches as home/draw/away automatically
  const scored = store.matches
    .map((m) => {
      const e = store.evaluateMatch(m);
      const idx = e.edges.indexOf(Math.max(...e.edges));
      return { m, e, idx, edge: e.edges[idx] };
    })
    .sort((a, b) => b.edge - a.edge)
    .slice(0, 3);
  for (const s of scored) {
    const outcome = s.idx === 0 ? 'home' : s.idx === 1 ? 'draw' : 'away';
    store.addToSlip(s.m, outcome as 'home' | 'draw' | 'away');
  }
  randomizeAll();
}

const decimalOf = (cents: number) => (cents >= 10 ? cents / 100 : cents);

const combinedOdds = computed(() =>
  store.slipLegs.reduce((acc, l) => acc * decimalOf(l.odds), 1)
);

const totalStake = computed(() => {
  if (mode.value === 'parlay') {
    const first = store.slipLegs[0];
    return first ? (stakes.value[first.matchId] || 0) : 0;
  }
  return store.slipLegs.reduce((s, l) => s + (stakes.value[l.matchId] || 0), 0);
});

const potentialPayout = computed(() => totalStake.value * combinedOdds.value);

const singlesPotential = computed(() =>
  store.slipLegs.reduce((s, l) => s + (stakes.value[l.matchId] || 0) * decimalOf(l.odds), 0)
);

const parlayProb = computed(() =>
  store.slipLegs.reduce((acc, l) => acc * Math.min(0.99, Math.max(0.01, l.modelProb)), 1)
);

const parlayProbPercent = computed(() => `${(parlayProb.value * 100).toFixed(1)}% model`);

function runSimulation() {
  const legs = store.slipLegs;
  if (legs.length === 0) return;
  const trials = numSims.value;
  let wins = 0;
  let totalStaked = 0;
  let totalReturned = 0;
  const profits: number[] = [];
  const returns: number[] = [];
  let best = -Infinity;
  let worst = Infinity;

  for (let t = 0; t < trials; t++) {
    // Each trial uses fresh random stakes in [min, max] — "simulate rand amounts"
    const trialStakes = legs.map(() => randStake());
    let staked: number;
    let returned = 0;
    let won: boolean;

    if (mode.value === 'parlay') {
      staked = trialStakes[0];
      const allHit = legs.every((leg) => Math.random() < leg.modelProb);
      won = allHit;
      returned = allHit ? staked * combinedOdds.value : 0;
    } else {
      staked = trialStakes.reduce((a, b) => a + b, 0);
      won = false;
      let anyWin = false;
      legs.forEach((leg, i) => {
        if (Math.random() < leg.modelProb) {
          returned += trialStakes[i] * decimalOf(leg.odds);
          anyWin = true;
        }
      });
      won = anyWin && returned > staked;
      // hit = at least one leg won (for singles display we count profitable slips)
    }

    const profit = returned - staked;
    if (won) wins++;
    totalStaked += staked;
    totalReturned += returned;
    profits.push(profit);
    returns.push(returned);
    if (profit > best) best = profit;
    if (profit < worst) worst = profit;
  }

  profits.sort((a, b) => a - b);
  returns.sort((a, b) => a - b);
  const mid = Math.floor(trials / 2);
  const medianReturn = trials % 2 === 0 ? (returns[mid - 1] + returns[mid]) / 2 : returns[mid];
  const meanProfit = profits.reduce((a, b) => a + b, 0) / trials;

  // 12-bucket histogram over profit range
  const buckets = 12;
  const min = Math.min(...profits);
  const max = Math.max(...profits);
  const span = max - min || 1;
  const counts = new Array(buckets).fill(0);
  for (const p of profits) {
    let idx = Math.floor(((p - min) / span) * buckets);
    if (idx >= buckets) idx = buckets - 1;
    counts[idx]++;
  }
  const maxBucket = Math.max(...counts, 1);
  const histogram = counts.map((count, i) => {
    const edge = min + (span * (i + 0.5)) / buckets;
    return { count, label: edge.toFixed(0), profitable: edge > 0 };
  });

  simResult.value = {
    trials,
    hitRate: wins / trials,
    meanProfit,
    medianReturn,
    roi: totalStaked > 0 ? (totalReturned - totalStaked) / totalStaked : 0,
    totalStaked,
    totalReturned,
    bestProfit: best,
    worstProfit: worst,
    theoreticalProb: mode.value === 'parlay' ? parlayProb.value : 0,
    histogram,
    maxBucket,
  };
}
</script>
