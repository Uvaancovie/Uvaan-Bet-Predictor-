<template>
  <div v-if="isOpen && match" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 overflow-y-auto">
    <div class="bg-[#111722] border border-[#243044] rounded-xl w-full max-w-2xl p-4 sm:p-5 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
      <!-- Header: Crests, Teams, and League -->
      <div class="flex items-center justify-between border-b border-[#243044] pb-3">
        <div class="flex items-center gap-3">
          <!-- Home Crest -->
          <div class="w-9 h-9 rounded-lg bg-[#0b0f16] border border-[#243044] p-1 flex items-center justify-center overflow-hidden">
            <img
              v-if="homeStats.crest"
              :src="homeStats.crest"
              :alt="homeStats.name"
              class="w-full h-full object-contain"
              @error="(e: any) => (e.target.style.display = 'none')"
            />
            <span v-else class="text-xs font-mono font-medium text-[#0d9488]">
              {{ match.homeTeam.slice(0, 2).toUpperCase() }}
            </span>
          </div>

          <div>
            <h2 class="text-sm sm:text-base font-medium text-[#eef3fb]">
              {{ match.homeTeam }} <span class="text-[#64748b]">vs</span> {{ match.awayTeam }}
            </h2>
            <div class="text-[11px] text-[#93a0b8] font-mono">
              {{ match.league }} • Kickoff: {{ formatTime(match.kickoff) }}
            </div>
          </div>

          <!-- Away Crest -->
          <div class="w-9 h-9 rounded-lg bg-[#0b0f16] border border-[#243044] p-1 flex items-center justify-center overflow-hidden">
            <img
              v-if="awayStats.crest"
              :src="awayStats.crest"
              :alt="awayStats.name"
              class="w-full h-full object-contain"
              @error="(e: any) => (e.target.style.display = 'none')"
            />
            <span v-else class="text-xs font-mono font-medium text-[#e11d48]">
              {{ match.awayTeam.slice(0, 2).toUpperCase() }}
            </span>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="text-[#93a0b8] hover:text-[#eef3fb] p-1 text-sm rounded transition"
        >
          ✕
        </button>
      </div>

      <!-- Quick Metrics Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono tabular-nums">
        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-2.5">
          <span class="text-[10px] text-[#64748b] block font-sans">Recent Form</span>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex gap-0.5">
              <span
                v-for="(res, idx) in homeStats.form"
                :key="idx"
                :class="['w-4 h-4 rounded-xs text-[9px] flex items-center justify-center font-medium', getFormClass(res)]"
              >
                {{ res }}
              </span>
            </div>
            <span class="text-[#64748b] text-[10px]">v</span>
            <div class="flex gap-0.5">
              <span
                v-for="(res, idx) in awayStats.form"
                :key="idx"
                :class="['w-4 h-4 rounded-xs text-[9px] flex items-center justify-center font-medium', getFormClass(res)]"
              >
                {{ res }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-2.5">
          <span class="text-[10px] text-[#64748b] block font-sans">Avg Goals Scored</span>
          <div class="flex items-center justify-between mt-1 text-[#eef3fb]">
            <span class="text-[#0d9488]">{{ homeStats.avgGoalsScored }}</span>
            <span class="text-[#64748b] text-[10px]">vs</span>
            <span class="text-[#e11d48]">{{ awayStats.avgGoalsScored }}</span>
          </div>
        </div>

        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-2.5">
          <span class="text-[10px] text-[#64748b] block font-sans">Avg Goals Conceded</span>
          <div class="flex items-center justify-between mt-1 text-[#eef3fb]">
            <span class="text-[#0d9488]">{{ homeStats.avgGoalsConceded }}</span>
            <span class="text-[#64748b] text-[10px]">vs</span>
            <span class="text-[#e11d48]">{{ awayStats.avgGoalsConceded }}</span>
          </div>
        </div>

        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-2.5">
          <span class="text-[10px] text-[#64748b] block font-sans">Possession Share</span>
          <div class="flex items-center justify-between mt-1 text-[#eef3fb]">
            <span class="text-[#0d9488]">{{ homeStats.possessionAvg }}%</span>
            <span class="text-[#64748b] text-[10px]">vs</span>
            <span class="text-[#e11d48]">{{ awayStats.possessionAvg }}%</span>
          </div>
        </div>
      </div>

      <!-- Radar Comparison Chart (Chart.js) -->
      <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-medium text-[#eef3fb]">Head-to-Head Tactical Radar</span>
          <div class="flex items-center gap-3 text-[10px] font-mono">
            <span class="flex items-center gap-1 text-[#0d9488]">
              <span class="w-2 h-2 rounded-xs bg-[#0d9488]"></span> {{ match.homeTeam }}
            </span>
            <span class="flex items-center gap-1 text-[#e11d48]">
              <span class="w-2 h-2 rounded-xs bg-[#e11d48]"></span> {{ match.awayTeam }}
            </span>
          </div>
        </div>

        <div class="h-56 relative">
          <canvas ref="radarCanvas"></canvas>
        </div>
      </div>

      <!-- Key Players Comparison -->
      <div class="space-y-2">
        <div class="text-xs font-medium text-[#eef3fb]">Key Player Profiles & Metrics</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- Home Key Players -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-2">
            <div class="text-[11px] font-medium text-[#0d9488] flex items-center justify-between">
              <span>{{ match.homeTeam }} Leaders</span>
              <span class="font-mono text-[10px] text-[#64748b]">Goals / xG</span>
            </div>
            <div class="space-y-1.5 font-mono">
              <div
                v-for="p in homeStats.keyPlayers"
                :key="p.name"
                class="flex items-center justify-between py-1 border-b border-[#243044]/50 text-[11px]"
              >
                <div class="flex items-center gap-2">
                  <span>{{ p.avatar }}</span>
                  <span class="text-[#eef3fb]">{{ p.name }}</span>
                  <span class="text-[10px] text-[#64748b]">#{{ p.number }} {{ p.position }}</span>
                </div>
                <div class="text-[#93a0b8]">
                  <strong class="text-[#eef3fb]">{{ p.goals }}G</strong> ({{ p.xG }} xG)
                </div>
              </div>
            </div>
          </div>

          <!-- Away Key Players -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-2">
            <div class="text-[11px] font-medium text-[#e11d48] flex items-center justify-between">
              <span>{{ match.awayTeam }} Leaders</span>
              <span class="font-mono text-[10px] text-[#64748b]">Goals / xG</span>
            </div>
            <div class="space-y-1.5 font-mono">
              <div
                v-for="p in awayStats.keyPlayers"
                :key="p.name"
                class="flex items-center justify-between py-1 border-b border-[#243044]/50 text-[11px]"
              >
                <div class="flex items-center gap-2">
                  <span>{{ p.avatar }}</span>
                  <span class="text-[#eef3fb]">{{ p.name }}</span>
                  <span class="text-[10px] text-[#64748b]">#{{ p.number }} {{ p.position }}</span>
                </div>
                <div class="text-[#93a0b8]">
                  <strong class="text-[#eef3fb]">{{ p.goals }}G</strong> ({{ p.xG }} xG)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Close button -->
      <div class="flex justify-end pt-2 border-t border-[#243044]">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#171e2c] border border-[#243044] rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import type { MatchAnalysis } from '@/types';
import { getTeamStats } from '@/lib/teamAssets';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps<{
  isOpen: boolean;
  match: MatchAnalysis | null;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const radarCanvas = ref<HTMLCanvasElement | null>(null);
let radarChartInstance: Chart | null = null;

const homeStats = computed(() => getTeamStats(props.match?.homeTeam || 'Home'));
const awayStats = computed(() => getTeamStats(props.match?.awayTeam || 'Away'));

function getFormClass(res: 'W' | 'D' | 'L'): string {
  if (res === 'W') return 'bg-[#0d9488]/30 text-[#2dd4bf] border border-[#0d9488]/40';
  if (res === 'D') return 'bg-[#64748b]/30 text-[#cbd5e1] border border-[#64748b]/40';
  return 'bg-[#e11d48]/30 text-[#fda4af] border border-[#e11d48]/40';
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function renderRadar() {
  if (!radarCanvas.value || !props.match) return;
  if (radarChartInstance) {
    radarChartInstance.destroy();
    radarChartInstance = null;
  }

  const h = homeStats.value;
  const a = awayStats.value;

  radarChartInstance = new Chart(radarCanvas.value, {
    type: 'radar',
    data: {
      labels: ['Attack (xG)', 'Defending', 'Possession', 'Finishing', 'Form Momentum'],
      datasets: [
        {
          label: h.name,
          data: [h.attackRating, h.defenseRating, h.possessionAvg, (h.avgGoalsScored / 3) * 100, 85],
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.15)',
          pointBackgroundColor: '#0d9488',
          borderWidth: 1.5,
        },
        {
          label: a.name,
          data: [a.attackRating, a.defenseRating, a.possessionAvg, (a.avgGoalsScored / 3) * 100, 75],
          borderColor: '#e11d48',
          backgroundColor: 'rgba(225, 29, 72, 0.15)',
          pointBackgroundColor: '#e11d48',
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        r: {
          min: 30,
          max: 100,
          ticks: { display: false, stepSize: 20 },
          grid: { color: '#243044' },
          angleLines: { color: '#243044' },
          pointLabels: {
            color: '#93a0b8',
            font: { size: 10, family: 'sans-serif' },
          },
        },
      },
    },
  });
}

watch(
  () => [props.isOpen, props.match],
  ([open]) => {
    if (open) {
      nextTick(renderRadar);
    }
  }
);

onBeforeUnmount(() => {
  if (radarChartInstance) radarChartInstance.destroy();
});
</script>
