<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 class="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Add Single Match
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">
            Manually enter fixture metadata and market integer odds
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Teams -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-zinc-300 mb-1">Home Team</label>
            <input
              v-model="homeTeam"
              type="text"
              required
              placeholder="e.g. Sundowns"
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-zinc-300 mb-1">Away Team</label>
            <input
              v-model="awayTeam"
              type="text"
              required
              placeholder="e.g. Pirates"
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
        </div>

        <!-- League & Kickoff -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-zinc-300 mb-1">League / Tournament</label>
            <input
              v-model="league"
              type="text"
              required
              placeholder="e.g. PSL, EPL"
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-zinc-300 mb-1">Kickoff (ISO / Local)</label>
            <input
              v-model="kickoff"
              type="datetime-local"
              required
              class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
            />
          </div>
        </div>

        <!-- Integer Odds (x100) -->
        <div class="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-200">
              3-Way Decimal Odds (Integer × 100)
            </span>
            <span class="text-[11px] text-zinc-400 font-mono">
              210 = 2.10 | 340 = 3.40
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-zinc-400 mb-1">Home (1)</label>
              <input
                v-model.number="homeOdds"
                type="number"
                min="101"
                step="1"
                required
                placeholder="210"
                class="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <span class="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                = {{ (homeOdds / 100).toFixed(2) }}
              </span>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-zinc-400 mb-1">Draw (X)</label>
              <input
                v-model.number="drawOdds"
                type="number"
                min="101"
                step="1"
                required
                placeholder="340"
                class="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <span class="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                = {{ (drawOdds / 100).toFixed(2) }}
              </span>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-zinc-400 mb-1">Away (2)</label>
              <input
                v-model.number="awayOdds"
                type="number"
                min="101"
                step="1"
                required
                placeholder="360"
                class="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <span class="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                = {{ (awayOdds / 100).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition shadow-lg shadow-cyan-400/20"
          >
            Add Match
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useOddsStore();

const homeTeam = ref('');
const awayTeam = ref('');
const league = ref('PSL');
const kickoff = ref(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
const homeOdds = ref<number>(210);
const drawOdds = ref<number>(340);
const awayOdds = ref<number>(360);

function handleSubmit() {
  if (!homeTeam.value.trim() || !awayTeam.value.trim()) return;

  store.addMatch({
    homeTeam: homeTeam.value.trim(),
    awayTeam: awayTeam.value.trim(),
    league: league.value.trim() || 'Custom',
    kickoff: kickoff.value,
    homeOdds: Number(homeOdds.value),
    drawOdds: Number(drawOdds.value),
    awayOdds: Number(awayOdds.value),
    sentimentHome: 0,
    sentimentAway: 0,
    homeExpGoals: 1.35,
    awayExpGoals: 1.1,
    priceAlertActive: false,
    alertEdgeThreshold: 0.03,
  });

  homeTeam.value = '';
  awayTeam.value = '';
  emit('close');
}
</script>
