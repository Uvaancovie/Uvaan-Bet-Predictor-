<template>
  <div class="space-y-5">
    <PageHeader
      eyebrow="Record"
      title="Predictions"
      description="Locked picks, with the market and model probabilities saved before kickoff."
    >
      <template #aside>
      <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        @click="simulatePending()"
        :disabled="store.pendingPredictions.length === 0"
        title="Load pending picks into the slip simulator"
        class="rounded-lg border border-[#00f5ff]/40 bg-[#00f5ff]/10 px-3 py-1.5 text-xs font-medium text-[#00f5ff] transition hover:bg-[#00f5ff]/20 disabled:opacity-40"
      >
        🎲 Simulate pending ({{ store.pendingPredictions.length }})
      </button>
      <div class="flex items-center gap-1 rounded-lg border border-[#243044] bg-[#0b0f16] p-1 text-xs">
        <button
          v-for="f in ['all', 'pending', 'settled']"
          :key="f"
          @click="statusFilter = (f as any)"
          :class="[
            'px-3 py-1 rounded capitalize transition font-medium',
            statusFilter === f
              ? 'bg-[#1c2738] text-[#eef3fb] border border-[#33445c]'
              : 'text-[#93a0b8] hover:text-[#eef3fb]'
          ]"
        >
          {{ f }}
          <span class="text-[10px] opacity-70 font-mono">({{ getFilterCount(f) }})</span>
        </button>
      </div>
      </div>
      </template>
    </PageHeader>

    <!-- Empty state -->
    <div
      v-if="filteredList.length === 0"
      class="bg-[#111722] border border-[#243044] rounded-xl p-8 text-center text-xs text-[#93a0b8]"
    >
      No predictions match the selected filter.
    </div>

    <!-- Predictions List -->
    <div class="space-y-3">
      <div
        v-for="pred in filteredList"
        :key="pred.id"
        class="bg-[#111722] border border-[#243044] rounded-xl p-4 space-y-3"
      >
        <!-- Top row: Match, League, and Locked Timestamp -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243044] pb-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-sm text-[#eef3fb]">
              {{ pred.homeTeam }} <span class="text-[#64748b]">v</span> {{ pred.awayTeam }}
            </span>
            <span class="text-[11px] text-[#93a0b8] font-mono">
              ({{ pred.league }})
            </span>
            <span v-if="pred.actualScore" class="text-xs font-mono text-[#eef3fb] px-2 py-0.5 rounded bg-[#0b0f16] border border-[#243044]">
              FT: {{ pred.actualScore }}
            </span>
          </div>

          <div class="flex items-center gap-3 text-xs self-start sm:self-center">
            <!-- Lock icon with timestamp -->
            <div class="flex items-center gap-1.5 text-[11px] text-[#93a0b8] font-mono" title="Saved pre-kickoff">
              <span>🔒</span>
              <span>{{ formatTime(pred.createdAt) }}</span>
            </div>

            <!-- Settlement status badge -->
            <span
              v-if="pred.settled"
              :class="[
                'text-[10px] font-mono px-2 py-0.5 rounded border uppercase',
                pred.won
                  ? 'bg-[#0d9488]/15 text-[#2dd4bf] border-[#0d9488]/40'
                  : pred.actualOutcome === 'void'
                  ? 'bg-[#64748b]/15 text-[#94a3b8] border-[#64748b]/40'
                  : 'bg-[#e11d48]/15 text-[#fb7185] border-[#e11d48]/40'
              ]"
            >
              {{ pred.won ? 'Won' : pred.actualOutcome === 'void' ? 'Void' : 'Lost' }}
            </span>
            <span
              v-else
              class="text-[10px] font-mono text-[#94a3b8] px-2 py-0.5 rounded bg-[#0b0f16] border border-[#243044]"
            >
              Pending
            </span>

            <!-- Add bet to slip button -->
            <button
              @click="store.addPredictionToSlip(pred)"
              title="Add this bet to the slip simulator"
              class="px-2.5 py-1 text-xs font-medium text-[#00f5ff] hover:bg-[#00f5ff]/10 bg-[#00f5ff]/5 border border-[#00f5ff]/30 rounded-lg transition"
            >
              ＋ Slip
            </button>

            <!-- Settle button -->
            <button
              @click="openSettle(pred)"
              class="px-2.5 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#171e2c] hover:bg-[#1c2738] border border-[#243044] rounded-lg transition"
            >
              {{ pred.settled ? 'Edit' : 'Settle' }}
            </button>
          </div>
        </div>

        <!-- Locked Momentum Snapshot & H2H Note -->
        <div v-if="pred.momentumSnapshot || pred.h2hNote" class="bg-[#0b0f16] border border-[#243044] rounded-lg p-2.5 text-xs font-mono space-y-1.5">
          <div class="flex items-center justify-between text-[11px] flex-wrap gap-2">
            <div v-if="pred.momentumSnapshot" class="flex items-center gap-2">
              <span class="text-[#64748b] text-[10px] font-sans">Pre-Kickoff Momentum:</span>
              <span class="text-[#0d9488] font-semibold">{{ pred.homeTeam }}: {{ pred.momentumSnapshot.homeScore }} pts</span>
              <span class="text-[#64748b] text-[10px]">v</span>
              <span class="text-[#e11d48] font-semibold">{{ pred.awayTeam }}: {{ pred.momentumSnapshot.awayScore }} pts</span>
              <span class="text-[#00f5ff] text-[10px] px-1.5 py-0.2 rounded bg-[#00f5ff]/10 border border-[#00f5ff]/20">
                Δ {{ pred.momentumSnapshot.diff > 0 ? '+' : '' }}{{ pred.momentumSnapshot.diff }} pts
              </span>
            </div>
            <div v-if="pred.expectedScore" class="text-[10px] text-[#93a0b8]">
              Projected Score: <strong class="text-[#eef3fb]">{{ pred.expectedScore }}</strong>
            </div>
          </div>
          <div v-if="pred.h2hNote" class="text-[10px] text-[#93a0b8] font-sans">
            {{ pred.h2hNote }}
          </div>
        </div>

        <!-- Comparison Table: Model's probabilities vs Market's probabilities -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs tabular-nums">
            <thead>
              <tr class="text-[10px] text-[#64748b] uppercase tracking-wider">
                <th class="py-1 font-normal">Layer</th>
                <th class="py-1 text-right font-normal text-[#0d9488]">Home</th>
                <th class="py-1 text-right font-normal text-[#64748b]">Draw</th>
                <th class="py-1 text-right font-normal text-[#e11d48]">Away</th>
                <th class="py-1 text-right font-normal text-[#eef3fb]">Tracked Pick</th>
                <th class="py-1 text-right font-normal text-[#93a0b8]">Flat PnL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#243044]/40 font-mono">
              <tr>
                <td class="py-1.5 text-[#93a0b8] font-sans">Market fair</td>
                <td class="py-1.5 text-right text-[#93a0b8]">{{ (pred.fairSnapshot.home * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#93a0b8]">{{ (pred.fairSnapshot.draw * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#93a0b8]">{{ (pred.fairSnapshot.away * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#93a0b8]" rowspan="2">
                  <span class="capitalize font-medium text-[#eef3fb]">
                    {{ pred.selectedOutcome }}
                  </span>
                  <span class="text-[#64748b] ml-1">
                    @ {{ (pred.selectedOdds / 100).toFixed(2) }}
                  </span>
                </td>
                <td class="py-1.5 text-right" rowspan="2">
                  <span v-if="pred.settled" :class="pred.pnlUnits && pred.pnlUnits > 0 ? 'text-[#38bdf8]' : pred.pnlUnits && pred.pnlUnits < 0 ? 'text-[#94a3b8]' : 'text-[#64748b]'">
                    {{ formatPnl(pred.pnlUnits) }}
                  </span>
                  <span v-else class="text-[#64748b]">—</span>
                </td>
              </tr>
              <tr>
                <td class="py-1.5 text-[#eef3fb] font-sans">Model</td>
                <td class="py-1.5 text-right text-[#eef3fb]">{{ (pred.modelSnapshot.home * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#eef3fb]">{{ (pred.modelSnapshot.draw * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#eef3fb]">{{ (pred.modelSnapshot.away * 100).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Settled result details if available -->
        <div v-if="pred.settled" class="pt-2 border-t border-[#243044] flex flex-wrap items-center justify-between text-[11px] text-[#93a0b8] font-mono">
          <div>
            Actual outcome: <strong class="text-[#eef3fb] uppercase">{{ pred.actualOutcome }}</strong>
            <span v-if="pred.brierScore !== undefined" class="ml-2">
              Brier score: <strong class="text-[#eef3fb]">{{ pred.brierScore.toFixed(4) }}</strong>
            </span>
          </div>
          <div>
            Settled: {{ formatTime(pred.settledAt || '') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Settle Result Modal -->
    <SettleModal
      :isOpen="showSettleModal"
      :prediction="selectedToSettle"
      @close="showSettleModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import type { PredictionRecord } from '@/types';
import SettleModal from './SettleModal.vue';
import PageHeader from './PageHeader.vue';

const store = useOddsStore();
const statusFilter = ref<'all' | 'pending' | 'settled'>('all');
const showSettleModal = ref(false);
const selectedToSettle = ref<PredictionRecord | null>(null);

function getFilterCount(f: string): number {
  if (f === 'pending') return store.pendingPredictions.length;
  if (f === 'settled') return store.settledPredictions.length;
  return store.predictions.length;
}

const filteredList = computed(() => {
  return store.predictions.filter((p) => {
    if (statusFilter.value === 'pending') return !p.settled;
    if (statusFilter.value === 'settled') return p.settled;
    return true;
  });
});

function openSettle(pred: PredictionRecord) {
  selectedToSettle.value = pred;
  showSettleModal.value = true;
}

function simulatePending() {
  store.clearSlip();
  for (const p of store.pendingPredictions) {
    const match = store.matches.find((m) => m.id === p.matchId);
    if (match) {
      store.slipLegs.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        kickoff: match.kickoff,
        outcome: p.selectedOutcome,
        odds: p.selectedOdds,
        modelProb: p.selectedModelProb,
        fairProb: p.selectedFairProb,
        edge: p.selectedEdge,
      });
    } else {
      // Fall back to the saved snapshot when the fixture is no longer loaded
      store.slipLegs.push({
        matchId: p.matchId,
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        league: p.league,
        kickoff: p.kickoff,
        outcome: p.selectedOutcome,
        odds: p.selectedOdds,
        modelProb: p.selectedModelProb,
        fairProb: p.selectedFairProb,
        edge: p.selectedEdge,
      });
    }
  }
  store.openSlip();
}

function formatTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatPnl(pnl?: number): string {
  if (pnl === undefined) return '—';
  const sign = pnl > 0 ? '+' : '';
  return `${sign}${pnl.toFixed(2)} u`;
}
</script>
