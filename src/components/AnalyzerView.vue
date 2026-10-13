<template>
  <div class="space-y-5 max-w-5xl mx-auto">
    <!-- Top Area: Paste box first with odds hint right beside button -->
    <section class="bg-[#16181e] border border-[#262a34] rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-[#f1f3f7]">
          Paste slate (one match per line)
        </label>
        <button
          type="button"
          @click="showManualForm = !showManualForm"
          class="text-xs text-[#9aa1b2] hover:text-[#f1f3f7] underline"
        >
          {{ showManualForm ? 'Hide manual form' : 'Or enter single match manually' }}
        </button>
      </div>

      <textarea
        v-model="slateInput"
        rows="3"
        placeholder="Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360"
        class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg p-2.5 text-xs font-mono text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6] transition placeholder-[#656c7d]"
      ></textarea>

      <div class="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handleParseSlate"
            :disabled="!slateInput.trim()"
            class="px-4 py-2 text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
          >
            Parse slate
          </button>
          <button
            type="button"
            @click="loadSamplePsl"
            class="px-3 py-2 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] bg-[#1c1f26] border border-[#262a34] rounded-lg transition"
          >
            Load sample PSL fixtures
          </button>
        </div>

        <div class="text-[11px] text-[#9aa1b2] font-mono">
          Format: <span class="text-[#f1f3f7]">Home v Away | league | kickoff | H D A</span> (210 = 2.10)
        </div>
      </div>

      <!-- Collapsible Manual Match Form -->
      <div v-if="showManualForm" class="mt-4 pt-4 border-t border-[#262a34] space-y-3">
        <div class="text-xs font-medium text-[#f1f3f7]">Manual Single Match Entry</div>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">Home Team</label>
            <input
              v-model="manualHome"
              type="text"
              placeholder="Sundowns"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">Away Team</label>
            <input
              v-model="manualAway"
              type="text"
              placeholder="Pirates"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">League</label>
            <input
              v-model="manualLeague"
              type="text"
              placeholder="PSL"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">Kickoff (ISO / Local)</label>
            <input
              v-model="manualKickoff"
              type="datetime-local"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs text-[#f1f3f7] font-mono focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5 text-xs">
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">Home Odds (x100)</label>
            <input
              v-model.number="manualHomeOdds"
              type="number"
              placeholder="210"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">Draw Odds (x100)</label>
            <input
              v-model.number="manualDrawOdds"
              type="number"
              placeholder="340"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#9aa1b2] mb-1">Away Odds (x100)</label>
            <input
              v-model.number="manualAwayOdds"
              type="number"
              placeholder="360"
              class="w-full bg-[#0f1115] border border-[#262a34] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#f1f3f7] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="button"
            @click="handleManualAdd"
            class="px-3.5 py-1.5 text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition"
          >
            Add match to analyzer
          </button>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <div
      v-if="store.matches.length === 0"
      class="bg-[#16181e] border border-[#262a34] rounded-xl p-8 text-center text-xs text-[#9aa1b2]"
    >
      No fixtures loaded. Paste a slate above or click "Load sample PSL fixtures".
    </div>

    <!-- Match Cards List -->
    <div class="space-y-4">
      <div
        v-for="match in store.matches"
        :key="match.id"
        class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 sm:p-5 space-y-4"
      >
        <!-- Card Header: Teams, league, kickoff on left | Bookmaker margin on right -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262a34] pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-sm sm:text-base font-medium text-[#f1f3f7]">
                {{ match.homeTeam }} <span class="text-[#656c7d]">v</span> {{ match.awayTeam }}
              </h2>
              <span class="text-[11px] text-[#9aa1b2] font-mono">
                ({{ match.league }})
              </span>
            </div>
            <div class="text-[11px] text-[#656c7d] font-mono mt-0.5">
              Kickoff: {{ formatKickoff(match.kickoff) }}
              <span v-if="isKickoffPassed(match.kickoff)" class="text-[#f87171] ml-1">
                (Kickoff passed — saving locked)
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 self-start sm:self-center">
            <!-- Bookmaker margin on the right -->
            <div class="text-xs font-mono text-right">
              <span class="text-[#9aa1b2] text-[11px] mr-1">Bookmaker margin:</span>
              <span class="text-[#f1f3f7] font-medium">
                {{ getMatchEval(match).marginPercent.toFixed(1) }}%
              </span>
            </div>

            <!-- Remove match button -->
            <button
              @click="store.removeMatch(match.id)"
              class="text-[#656c7d] hover:text-[#f87171] text-xs p-1 rounded transition"
              title="Remove match"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Stacked Probability Bars: Market above model (teal, grey, coral) -->
        <div class="bg-[#0f1115] p-3 rounded-lg border border-[#262a34]">
          <div class="flex items-center justify-between text-[11px] text-[#9aa1b2] mb-1.5">
            <span class="font-medium text-[#f1f3f7]">Probability Distribution</span>
            <div class="flex items-center gap-3 text-[10px]">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-xs bg-[#0d9488]"></span> Home
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-xs bg-[#64748b]"></span> Draw
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-xs bg-[#e11d48]"></span> Away
              </span>
            </div>
          </div>

          <StackedProbBar
            :market="[getMatchEval(match).fair[0], getMatchEval(match).fair[1], getMatchEval(match).fair[2]]"
            :model="[getMatchEval(match).model[0], getMatchEval(match).model[1], getMatchEval(match).model[2]]"
          />
        </div>

        <!-- Outcome Table: Odds, Market Prob, Model Prob, Diverging Edge Bar -->
        <!-- Desktop / Tablet Table View (hidden on mobile < 600px) -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="text-[#9aa1b2] border-b border-[#262a34] text-[11px]">
                <th class="py-2 px-2 font-normal">Outcome</th>
                <th class="py-2 px-2 text-right font-normal">Odds</th>
                <th class="py-2 px-2 text-right font-normal">Market Prob</th>
                <th class="py-2 px-2 text-right font-normal">Model Prob</th>
                <th class="py-2 px-3 font-normal min-w-[160px]">Edge</th>
                <th class="py-2 px-2 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#262a34]/60 tabular-nums">
              <!-- Home -->
              <tr>
                <td class="py-2.5 px-2 font-medium text-[#f1f3f7] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs bg-[#0d9488]"></span>
                  <span>{{ match.homeTeam }} (1)</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#f1f3f7]">
                  {{ (match.homeOdds / 100).toFixed(2) }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#9aa1b2]">
                  {{ (getMatchEval(match).fair[0] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#f1f3f7]">
                  {{ (getMatchEval(match).model[0] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-3">
                  <EdgeBar :edge="getMatchEval(match).edges[0]" />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <button
                    @click="handleSavePrediction(match, 'home')"
                    :disabled="isKickoffPassed(match.kickoff)"
                    class="px-2.5 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] hover:bg-[#1c1f26] border border-[#262a34] rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Save
                  </button>
                </td>
              </tr>

              <!-- Draw -->
              <tr>
                <td class="py-2.5 px-2 font-medium text-[#f1f3f7] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs bg-[#64748b]"></span>
                  <span>Draw (X)</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#f1f3f7]">
                  {{ (match.drawOdds / 100).toFixed(2) }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#9aa1b2]">
                  {{ (getMatchEval(match).fair[1] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#f1f3f7]">
                  {{ (getMatchEval(match).model[1] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-3">
                  <EdgeBar :edge="getMatchEval(match).edges[1]" />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <button
                    @click="handleSavePrediction(match, 'draw')"
                    :disabled="isKickoffPassed(match.kickoff)"
                    class="px-2.5 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] hover:bg-[#1c1f26] border border-[#262a34] rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Save
                  </button>
                </td>
              </tr>

              <!-- Away -->
              <tr>
                <td class="py-2.5 px-2 font-medium text-[#f1f3f7] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs bg-[#e11d48]"></span>
                  <span>{{ match.awayTeam }} (2)</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#f1f3f7]">
                  {{ (match.awayOdds / 100).toFixed(2) }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#9aa1b2]">
                  {{ (getMatchEval(match).fair[2] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#f1f3f7]">
                  {{ (getMatchEval(match).model[2] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-3">
                  <EdgeBar :edge="getMatchEval(match).edges[2]" />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <button
                    @click="handleSavePrediction(match, 'away')"
                    :disabled="isKickoffPassed(match.kickoff)"
                    class="px-2.5 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] hover:bg-[#1c1f26] border border-[#262a34] rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Save
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Layout (< 600px): Stack outcome rows into cards with full-width edge bar -->
        <div class="block sm:hidden space-y-2.5">
          <!-- Home Mobile Card -->
          <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#f1f3f7] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-xs bg-[#0d9488]"></span>
                {{ match.homeTeam }} (1)
              </span>
              <span class="font-mono text-[#f1f3f7] font-medium">
                {{ (match.homeOdds / 100).toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-[#9aa1b2] font-mono">
              <span>Market: {{ (getMatchEval(match).fair[0] * 100).toFixed(1) }}%</span>
              <span>Model: {{ (getMatchEval(match).model[0] * 100).toFixed(1) }}%</span>
            </div>

            <!-- Full-width edge bar with value to the right -->
            <div class="pt-1">
              <EdgeBar :edge="getMatchEval(match).edges[0]" />
            </div>

            <div class="pt-1 flex justify-end">
              <button
                @click="handleSavePrediction(match, 'home')"
                :disabled="isKickoffPassed(match.kickoff)"
                class="px-3 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] bg-[#16181e] border border-[#262a34] rounded-lg disabled:opacity-30"
              >
                Save Home
              </button>
            </div>
          </div>

          <!-- Draw Mobile Card -->
          <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#f1f3f7] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-xs bg-[#64748b]"></span>
                Draw (X)
              </span>
              <span class="font-mono text-[#f1f3f7] font-medium">
                {{ (match.drawOdds / 100).toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-[#9aa1b2] font-mono">
              <span>Market: {{ (getMatchEval(match).fair[1] * 100).toFixed(1) }}%</span>
              <span>Model: {{ (getMatchEval(match).model[1] * 100).toFixed(1) }}%</span>
            </div>

            <div class="pt-1">
              <EdgeBar :edge="getMatchEval(match).edges[1]" />
            </div>

            <div class="pt-1 flex justify-end">
              <button
                @click="handleSavePrediction(match, 'draw')"
                :disabled="isKickoffPassed(match.kickoff)"
                class="px-3 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] bg-[#16181e] border border-[#262a34] rounded-lg disabled:opacity-30"
              >
                Save Draw
              </button>
            </div>
          </div>

          <!-- Away Mobile Card -->
          <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#f1f3f7] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-xs bg-[#e11d48]"></span>
                {{ match.awayTeam }} (2)
              </span>
              <span class="font-mono text-[#f1f3f7] font-medium">
                {{ (match.awayOdds / 100).toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-[#9aa1b2] font-mono">
              <span>Market: {{ (getMatchEval(match).fair[2] * 100).toFixed(1) }}%</span>
              <span>Model: {{ (getMatchEval(match).model[2] * 100).toFixed(1) }}%</span>
            </div>

            <div class="pt-1">
              <EdgeBar :edge="getMatchEval(match).edges[2]" />
            </div>

            <div class="pt-1 flex justify-end">
              <button
                @click="handleSavePrediction(match, 'away')"
                :disabled="isKickoffPassed(match.kickoff)"
                class="px-3 py-1 text-xs text-[#9aa1b2] hover:text-[#f1f3f7] bg-[#16181e] border border-[#262a34] rounded-lg disabled:opacity-30"
              >
                Save Away
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import type { MatchAnalysis, OutcomeType } from '@/types';
import EdgeBar from './EdgeBar.vue';
import StackedProbBar from './StackedProbBar.vue';

const store = useOddsStore();
const slateInput = ref('');
const showManualForm = ref(false);

const manualHome = ref('');
const manualAway = ref('');
const manualLeague = ref('PSL');
const manualKickoff = ref(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
const manualHomeOdds = ref<number>(210);
const manualDrawOdds = ref<number>(340);
const manualAwayOdds = ref<number>(360);

function getMatchEval(match: MatchAnalysis) {
  return store.evaluateMatch(match);
}

function isKickoffPassed(kickoffIso: string): boolean {
  const time = new Date(kickoffIso).getTime();
  return !isNaN(time) && time <= Date.now();
}

function formatKickoff(kickoffIso: string): string {
  try {
    const d = new Date(kickoffIso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return kickoffIso;
  }
}

function handleParseSlate() {
  if (!slateInput.value.trim()) return;
  const count = store.importSlate(slateInput.value);
  if (count > 0) {
    slateInput.value = '';
  }
}

function loadSamplePsl() {
  slateInput.value = `Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360
Chiefs v Stellenbosch | PSL | 2026-10-18T18:00 | 240 310 290
SuperSport v Cape Town City | PSL | 2026-10-19T15:00 | 220 315 340`;
}

function handleManualAdd() {
  if (!manualHome.value.trim() || !manualAway.value.trim()) return;
  store.addMatch({
    homeTeam: manualHome.value.trim(),
    awayTeam: manualAway.value.trim(),
    league: manualLeague.value.trim() || 'Custom',
    kickoff: manualKickoff.value,
    homeOdds: Number(manualHomeOdds.value),
    drawOdds: Number(manualDrawOdds.value),
    awayOdds: Number(manualAwayOdds.value),
    sentimentHome: 0,
    sentimentAway: 0,
    homeExpGoals: 1.35,
    awayExpGoals: 1.1,
  });
  manualHome.value = '';
  manualAway.value = '';
  showManualForm.value = false;
}

function handleSavePrediction(match: MatchAnalysis, outcome: OutcomeType) {
  store.savePrediction(match.id, outcome);
}
</script>
