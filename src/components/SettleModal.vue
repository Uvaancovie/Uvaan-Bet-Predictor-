<template>
  <div v-if="isOpen && prediction" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
    <div class="bg-[#16181e] border border-[#262a34] rounded-xl w-full max-w-md p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-[#262a34] pb-2.5">
        <div>
          <h2 class="text-sm font-medium text-[#f1f3f7]">
            Settle Prediction
          </h2>
          <p class="text-xs text-[#9aa1b2] mt-0.5">
            Record actual match outcome to compute Brier score & PnL
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-[#9aa1b2] hover:text-[#f1f3f7] p-1"
        >
          ✕
        </button>
      </div>

      <!-- Match summary -->
      <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-medium text-[#f1f3f7]">
            {{ prediction.homeTeam }} <span class="text-[#656c7d]">v</span> {{ prediction.awayTeam }}
          </span>
          <span class="text-[11px] font-mono text-[#9aa1b2]">{{ prediction.league }}</span>
        </div>
        <div class="flex items-center justify-between text-[#9aa1b2] pt-1 border-t border-[#262a34]">
          <span>Tracked Pick:</span>
          <span class="font-mono text-[#f1f3f7] uppercase font-medium">
            {{ prediction.selectedOutcome }} @ {{ (prediction.selectedOdds / 100).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Select outcome -->
      <div class="space-y-1.5">
        <label class="block text-xs text-[#9aa1b2]">Actual Result</label>
        <div class="grid grid-cols-4 gap-2">
          <button
            type="button"
            @click="selectedResult = 'home'"
            :class="[
              'py-2 px-1 text-xs rounded-lg border transition text-center font-medium',
              selectedResult === 'home'
                ? 'bg-[#0d9488]/20 text-[#2dd4bf] border-[#0d9488]'
                : 'bg-[#0f1115] text-[#9aa1b2] border-[#262a34] hover:border-[#3b82f6]'
            ]"
          >
            Home
          </button>
          <button
            type="button"
            @click="selectedResult = 'draw'"
            :class="[
              'py-2 px-1 text-xs rounded-lg border transition text-center font-medium',
              selectedResult === 'draw'
                ? 'bg-[#64748b]/20 text-[#cbd5e1] border-[#64748b]'
                : 'bg-[#0f1115] text-[#9aa1b2] border-[#262a34] hover:border-[#3b82f6]'
            ]"
          >
            Draw
          </button>
          <button
            type="button"
            @click="selectedResult = 'away'"
            :class="[
              'py-2 px-1 text-xs rounded-lg border transition text-center font-medium',
              selectedResult === 'away'
                ? 'bg-[#e11d48]/20 text-[#fda4af] border-[#e11d48]'
                : 'bg-[#0f1115] text-[#9aa1b2] border-[#262a34] hover:border-[#3b82f6]'
            ]"
          >
            Away
          </button>
          <button
            type="button"
            @click="selectedResult = 'void'"
            :class="[
              'py-2 px-1 text-xs rounded-lg border transition text-center font-medium',
              selectedResult === 'void'
                ? 'bg-[#222632] text-[#f1f3f7] border-[#323744]'
                : 'bg-[#0f1115] text-[#9aa1b2] border-[#262a34] hover:border-[#3b82f6]'
            ]"
          >
            Void
          </button>
        </div>
      </div>

      <!-- Optional score -->
      <div class="space-y-1">
        <label class="block text-xs text-[#9aa1b2]">
          Final Score <span class="text-[#656c7d]">(optional)</span>
        </label>
        <input
          v-model="score"
          type="text"
          placeholder="e.g. 2 - 1"
          class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f3f7] font-mono focus:outline-none focus:border-[#3b82f6]"
        />
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#262a34]">
        <button
          type="button"
          @click="$emit('close')"
          class="px-3 py-1.5 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] rounded-lg transition"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSettle"
          :disabled="!selectedResult"
          class="px-4 py-1.5 text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 rounded-lg transition"
        >
          Confirm settlement
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import type { PredictionRecord, SettlementResult } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  prediction: PredictionRecord | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useOddsStore();
const selectedResult = ref<SettlementResult>('home');
const score = ref('');

watch(
  () => props.prediction,
  (p) => {
    if (p) {
      selectedResult.value = p.actualOutcome || 'home';
      score.value = p.actualScore || '';
    }
  },
  { immediate: true }
);

function handleSettle() {
  if (!props.prediction || !selectedResult.value) return;
  store.settlePrediction(props.prediction.id, selectedResult.value, score.value);
  emit('close');
}
</script>
