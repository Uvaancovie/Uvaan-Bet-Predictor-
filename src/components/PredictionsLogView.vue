<template>
  <div class="space-y-5 max-w-5xl mx-auto">
    <!-- Header with Pending/Settled Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#16181e] border border-[#262a34] rounded-xl p-4">
      <div>
        <h1 class="text-sm sm:text-base font-medium text-[#f1f3f7]">
          Predictions Log
        </h1>
        <p class="text-xs text-[#9aa1b2] mt-0.5">
          Locked predictions with model vs market probabilities and timestamps
        </p>
      </div>

      <!-- Filter Controls: All / Pending / Settled -->
      <div class="flex items-center gap-1 bg-[#0f1115] p-1 rounded-lg border border-[#262a34] text-xs">
        <button
          v-for="f in ['all', 'pending', 'settled']"
          :key="f"
          @click="statusFilter = (f as any)"
          :class="[
            'px-3 py-1 rounded capitalize transition font-medium',
            statusFilter === f
              ? 'bg-[#222632] text-[#f1f3f7] border border-[#323744]'
              : 'text-[#9aa1b2] hover:text-[#f1f3f7]'
          ]"
        >
          {{ f }}
          <span class="text-[10px] opacity-70 font-mono">({{ getFilterCount(f) }})</span>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredList.length === 0"
      class="bg-[#16181e] border border-[#262a34] rounded-xl p-8 text-center text-xs text-[#9aa1b2]"
    >
      No predictions match the selected filter.
    </div>

    <!-- Predictions List -->
    <div class="space-y-3">
      <div
        v-for="pred in filteredList"
        :key="pred.id"
        class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-3"
      >
        <!-- Top row: Match, League, and Locked Timestamp -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262a34] pb-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-sm text-[#f1f3f7]">
              {{ pred.homeTeam }} <span class="text-[#656c7d]">v</span> {{ pred.awayTeam }}
            </span>
            <span class="text-[11px] text-[#9aa1b2] font-mono">
              ({{ pred.league }})
            </span>
            <span v-if="pred.actualScore" class="text-xs font-mono text-[#f1f3f7] px-2 py-0.5 rounded bg-[#0f1115] border border-[#262a34]">
              FT: {{ pred.actualScore }}
            </span>
          </div>

          <div class="flex items-center gap-3 text-xs self-start sm:self-center">
            <!-- Lock icon with timestamp -->
            <div class="flex items-center gap-1.5 text-[11px] text-[#9aa1b2] font-mono" title="Saved pre-kickoff">
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
              class="text-[10px] font-mono text-[#94a3b8] px-2 py-0.5 rounded bg-[#0f1115] border border-[#262a34]"
            >
              Pending
            </span>

            <!-- Settle button -->
            <button
              @click="openSettle(pred)"
              class="px-2.5 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] bg-[#1c1f26] hover:bg-[#222632] border border-[#262a34] rounded-lg transition"
            >
              {{ pred.settled ? 'Edit' : 'Settle' }}
            </button>
          </div>
        </div>

        <!-- Comparison Table: Model's probabilities vs Market's probabilities -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs tabular-nums">
            <thead>
              <tr class="text-[10px] text-[#656c7d] uppercase tracking-wider">
                <th class="py-1 font-normal">Layer</th>
                <th class="py-1 text-right font-normal text-[#0d9488]">Home</th>
                <th class="py-1 text-right font-normal text-[#64748b]">Draw</th>
                <th class="py-1 text-right font-normal text-[#e11d48]">Away</th>
                <th class="py-1 text-right font-normal text-[#f1f3f7]">Tracked Pick</th>
                <th class="py-1 text-right font-normal text-[#9aa1b2]">Flat PnL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262a34]/40 font-mono">
              <tr>
                <td class="py-1.5 text-[#9aa1b2] font-sans">Market fair</td>
                <td class="py-1.5 text-right text-[#9aa1b2]">{{ (pred.fairSnapshot.home * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#9aa1b2]">{{ (pred.fairSnapshot.draw * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#9aa1b2]">{{ (pred.fairSnapshot.away * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#9aa1b2]" rowspan="2">
                  <span class="capitalize font-medium text-[#f1f3f7]">
                    {{ pred.selectedOutcome }}
                  </span>
                  <span class="text-[#656c7d] ml-1">
                    @ {{ (pred.selectedOdds / 100).toFixed(2) }}
                  </span>
                </td>
                <td class="py-1.5 text-right" rowspan="2">
                  <span v-if="pred.settled" :class="pred.pnlUnits && pred.pnlUnits > 0 ? 'text-[#38bdf8]' : pred.pnlUnits && pred.pnlUnits < 0 ? 'text-[#94a3b8]' : 'text-[#64748b]'">
                    {{ formatPnl(pred.pnlUnits) }}
                  </span>
                  <span v-else class="text-[#656c7d]">—</span>
                </td>
              </tr>
              <tr>
                <td class="py-1.5 text-[#f1f3f7] font-sans">Model</td>
                <td class="py-1.5 text-right text-[#f1f3f7]">{{ (pred.modelSnapshot.home * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#f1f3f7]">{{ (pred.modelSnapshot.draw * 100).toFixed(1) }}%</td>
                <td class="py-1.5 text-right text-[#f1f3f7]">{{ (pred.modelSnapshot.away * 100).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Settled result details if available -->
        <div v-if="pred.settled" class="pt-2 border-t border-[#262a34] flex flex-wrap items-center justify-between text-[11px] text-[#9aa1b2] font-mono">
          <div>
            Actual outcome: <strong class="text-[#f1f3f7] uppercase">{{ pred.actualOutcome }}</strong>
            <span v-if="pred.brierScore !== undefined" class="ml-2">
              Brier score: <strong class="text-[#f1f3f7]">{{ pred.brierScore.toFixed(4) }}</strong>
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
