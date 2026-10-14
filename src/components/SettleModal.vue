<template>
  <div v-if="isOpen && prediction" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
    <div class="bg-[#111722] border border-[#243044] rounded-xl w-full max-w-md p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-[#243044] pb-2.5">
        <div>
          <h2 class="text-sm font-medium text-[#eef3fb]">
            Settle Prediction
          </h2>
          <p class="text-xs text-[#93a0b8] mt-0.5">
            Record actual match outcome to compute Brier score & PnL
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-[#93a0b8] hover:text-[#eef3fb] p-1"
        >
          ✕
        </button>
      </div>

      <!-- Match summary -->
      <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-medium text-[#eef3fb]">
            {{ prediction.homeTeam }} <span class="text-[#64748b]">v</span> {{ prediction.awayTeam }}
          </span>
          <span class="text-[11px] font-mono text-[#93a0b8]">{{ prediction.league }}</span>
        </div>
        <div class="flex items-center justify-between text-[#93a0b8] pt-1 border-t border-[#243044]">
          <span>Tracked Pick:</span>
          <span class="font-mono text-[#eef3fb] uppercase font-medium">
            {{ prediction.selectedOutcome }} @ {{ (prediction.selectedOdds / 100).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Select outcome -->
      <div class="space-y-1.5">
        <label class="block text-xs text-[#93a0b8]">Actual Result</label>
        <div class="grid grid-cols-4 gap-2">
          <button
            type="button"
            @click="selectedResult = 'home'"
            :class="[
              'py-2 px-1 text-xs rounded-lg border transition text-center font-medium',
              selectedResult === 'home'
                ? 'bg-[#0d9488]/20 text-[#2dd4bf] border-[#0d9488]'
                : 'bg-[#0b0f16] text-[#93a0b8] border-[#243044] hover:border-[#3b82f6]'
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
                : 'bg-[#0b0f16] text-[#93a0b8] border-[#243044] hover:border-[#3b82f6]'
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
                : 'bg-[#0b0f16] text-[#93a0b8] border-[#243044] hover:border-[#3b82f6]'
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
                ? 'bg-[#1c2738] text-[#eef3fb] border-[#33445c]'
                : 'bg-[#0b0f16] text-[#93a0b8] border-[#243044] hover:border-[#3b82f6]'
            ]"
          >
            Void
          </button>
        </div>
      </div>

      <!-- Optional score -->
      <div class="space-y-1">
        <label class="block text-xs text-[#93a0b8]">
          Final Score <span class="text-[#64748b]">(optional)</span>
        </label>
        <input
          v-model="score"
          type="text"
          placeholder="e.g. 2 - 1"
          class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#eef3fb] font-mono focus:outline-none focus:border-[#00f5ff]"
        />
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#243044]">
        <button
          type="button"
          @click="$emit('close')"
          class="px-3 py-1.5 text-xs text-[#93a0b8] hover:text-[#eef3fb] rounded-lg transition"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSettle"
          :disabled="!selectedResult"
          class="px-4 py-1.5 text-xs font-medium text-[#041016] bg-[#00f5ff] hover:brightness-110 disabled:opacity-40 rounded-lg transition"
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
