<template>
  <div class="space-y-5">
    <PageHeader
      eyebrow="Workspace"
      title="Analyzer"
      description="Remove the bookmaker margin, compare a model probability with the market, and lock a pick before kickoff."
    />

    <!-- Top Area: Live Odds Status & Competition Selector Bar -->
    <div class="bg-[#111722] border border-[#243044] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[#93a0b8] font-medium">Competition:</span>
        <div class="flex gap-1 overflow-x-auto">
          <button
            v-for="sport in SPORTS_CONFIG"
            :key="sport.key"
            @click="store.loadLiveOdds(sport.key)"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap',
              store.selectedLeague === sport.key
                ? 'bg-[#1c2738] text-[#eef3fb] border border-[#33445c]'
                : 'text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c]'
            ]"
          >
            {{ sport.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 text-[11px] font-mono text-[#93a0b8] self-start sm:self-center">
        <!-- Quota shield status -->
        <span v-if="store.requestsRemaining !== null" class="hidden md:inline text-[#64748b]">
          Quota: <strong class="text-[#eef3fb]">{{ store.requestsRemaining }}</strong>/500 left
        </span>

        <span v-if="store.lastLiveFetchedAt" class="text-[10px] text-[#64748b]">
          {{ store.isLiveCached ? 'Cached (0 quota)' : 'Live API' }}
        </span>

        <!-- Refresh button -->
        <button
          @click="store.loadLiveOdds(store.selectedLeague, true)"
          :disabled="store.isLiveLoading"
          class="px-2.5 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#171e2c] hover:bg-[#1c2738] border border-[#243044] rounded-lg transition flex items-center gap-1.5 disabled:opacity-40"
          title="Force fresh API fetch"
        >
          <span :class="store.isLiveLoading ? 'animate-spin' : ''">↻</span>
          <span>{{ store.isLiveLoading ? 'Fetching...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>

    <!-- Paste Box (Main Action per rule) -->
    <section class="bg-[#111722] border border-[#243044] rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-[#eef3fb]">
          Paste custom slate (one match per line)
        </label>
        <button
          type="button"
          @click="showManualForm = !showManualForm"
          class="text-xs text-[#93a0b8] hover:text-[#eef3fb] underline"
        >
          {{ showManualForm ? 'Hide manual form' : 'Or enter single match manually' }}
        </button>
      </div>

      <textarea
        v-model="slateInput"
        rows="2"
        placeholder="Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360"
        class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg p-2.5 text-xs font-mono text-[#eef3fb] focus:outline-none focus:border-[#00f5ff] transition placeholder-[#64748b]"
      ></textarea>

      <div class="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handleParseSlate"
            :disabled="!slateInput.trim()"
            class="px-4 py-1.5 text-xs font-medium text-[#041016] bg-[#00f5ff] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
          >
            Parse slate
          </button>
          <button
            type="button"
            @click="loadSamplePsl"
            class="px-3 py-1.5 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#171e2c] border border-[#243044] rounded-lg transition"
          >
            Load sample PSL
          </button>
        </div>

        <div class="text-[11px] text-[#93a0b8] font-mono">
          Format: <span class="text-[#eef3fb]">Home v Away | league | kickoff | H D A</span> (210 = 2.10)
        </div>
      </div>

      <!-- Collapsible Manual Form -->
      <div v-if="showManualForm" class="mt-4 pt-4 border-t border-[#243044] space-y-3">
        <div class="text-xs font-medium text-[#eef3fb]">Manual Single Match Entry</div>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">Home Team</label>
            <input
              v-model="manualHome"
              type="text"
              placeholder="Sundowns"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#eef3fb] focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">Away Team</label>
            <input
              v-model="manualAway"
              type="text"
              placeholder="Pirates"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#eef3fb] focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">League</label>
            <input
              v-model="manualLeague"
              type="text"
              placeholder="PSL"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#eef3fb] focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">Kickoff</label>
            <input
              v-model="manualKickoff"
              type="datetime-local"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#eef3fb] font-mono focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5 text-xs">
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">Home Odds (x100)</label>
            <input
              v-model.number="manualHomeOdds"
              type="number"
              placeholder="210"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#eef3fb] focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">Draw Odds (x100)</label>
            <input
              v-model.number="manualDrawOdds"
              type="number"
              placeholder="340"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#eef3fb] focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
          <div>
            <label class="block text-[11px] text-[#93a0b8] mb-1">Away Odds (x100)</label>
            <input
              v-model.number="manualAwayOdds"
              type="number"
              placeholder="360"
              class="w-full bg-[#0b0f16] border border-[#243044] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#eef3fb] focus:outline-none focus:border-[#00f5ff]"
            />
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="button"
            @click="handleManualAdd"
            class="px-3.5 py-1.5 text-xs font-medium text-[#041016] bg-[#00f5ff] hover:brightness-110 rounded-lg transition"
          >
            Add match
          </button>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <div
      v-if="store.matches.length === 0"
      class="bg-[#111722] border border-[#243044] rounded-xl p-8 text-center text-xs text-[#93a0b8]"
    >
      No fixtures loaded. Select a competition above or paste custom matches.
    </div>

    <!-- Match Cards List -->
    <div class="space-y-4">
      <div
        v-for="match in store.matches"
        :key="match.id"
        :data-match-id="match.id"
        :class="[
          'scroll-mt-28 rounded-xl border p-4 sm:p-5 space-y-4 transition',
          store.focusedMatchId === match.id
            ? 'border-[#00f5ff] bg-[#111722] ring-2 ring-[#00f5ff]/45'
            : 'bg-[#111722] border-[#243044]'
        ]"
      >
        <!-- Card Header: Teams, League, Crests, Kickoff on left | Margin & Stats on right -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243044] pb-3">
          <div class="flex items-center gap-3">
            <!-- Crests pair -->
            <div class="flex items-center -space-x-1.5">
              <div class="w-7 h-7 rounded-full bg-[#0b0f16] border border-[#243044] p-1 flex items-center justify-center overflow-hidden z-10">
                <img
                  v-if="getCrest(match.homeTeam)"
                  :src="getCrest(match.homeTeam)"
                  :alt="match.homeTeam"
                  class="w-full h-full object-contain"
                  @error="(e: any) => (e.target.style.display = 'none')"
                />
                <span v-else class="text-[9px] font-mono text-[#0d9488]">
                  {{ match.homeTeam.slice(0, 2).toUpperCase() }}
                </span>
              </div>
              <div class="w-7 h-7 rounded-full bg-[#0b0f16] border border-[#243044] p-1 flex items-center justify-center overflow-hidden">
                <img
                  v-if="getCrest(match.awayTeam)"
                  :src="getCrest(match.awayTeam)"
                  :alt="match.awayTeam"
                  class="w-full h-full object-contain"
                  @error="(e: any) => (e.target.style.display = 'none')"
                />
                <span v-else class="text-[9px] font-mono text-[#e11d48]">
                  {{ match.awayTeam.slice(0, 2).toUpperCase() }}
                </span>
              </div>
            </div>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-sm sm:text-base font-medium text-[#eef3fb]">
                  {{ match.homeTeam }} <span class="text-[#64748b]">v</span> {{ match.awayTeam }}
                </h2>
                <span class="text-[11px] text-[#93a0b8] font-mono">
                  ({{ match.league }})
                </span>
              </div>
              <div class="text-[11px] text-[#64748b] font-mono mt-0.5">
                Kickoff: {{ formatKickoff(match.kickoff) }}
                <span v-if="isKickoffPassed(match.kickoff)" class="text-[#f87171] ml-1">
                  (Locked)
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 self-start sm:self-center">
            <!-- Bookmaker margin on the right -->
            <div class="text-xs font-mono text-right">
              <span class="text-[#93a0b8] text-[11px] mr-1">Margin:</span>
              <span class="text-[#eef3fb] font-medium">
                {{ getMatchEval(match).marginPercent.toFixed(1) }}%
              </span>
            </div>

            <!-- View Stats & H2H Modal button -->
            <button
              @click="openStats(match, 'momentum')"
              class="px-2.5 py-1 text-xs text-[#00f5ff] hover:bg-[#00f5ff]/10 bg-[#00f5ff]/5 border border-[#00f5ff]/30 rounded-lg transition flex items-center gap-1"
            >
              <span>⚡</span>
              <span>H2H & Momentum</span>
            </button>

            <!-- Remove match button -->
            <button
              @click="store.removeMatch(match.id)"
              class="text-[#64748b] hover:text-[#f87171] text-xs p-1 rounded transition"
              title="Remove fixture"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- MyFootballFacts Momentum & H2H Performance Bar -->
        <div class="bg-[#0b0f16] p-3 rounded-lg border border-[#243044] space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <div class="flex items-center gap-1.5 text-[#0d9488]">
              <span class="font-bold">{{ getMatchQuant(match).homeMomentum.momentumScore }} pts</span>
              <span class="text-[10px]">{{ getMatchQuant(match).homeMomentum.trend === 'surging' ? '▲' : getMatchQuant(match).homeMomentum.trend === 'declining' ? '▼' : '▬' }}</span>
              <span class="text-[11px] text-[#93a0b8]">{{ match.homeTeam }}</span>
            </div>

            <div class="text-[10px] text-[#93a0b8]">
              <span v-if="Math.abs(getMatchQuant(match).momentumDiff) >= 5" class="text-[#00f5ff] font-semibold">
                Δ {{ Math.abs(getMatchQuant(match).momentumDiff) }} pt momentum edge
              </span>
              <span v-else class="text-[#64748b]">Balanced Momentum</span>
            </div>

            <div class="flex items-center gap-1.5 text-[#e11d48] justify-end">
              <span class="text-[11px] text-[#93a0b8]">{{ match.awayTeam }}</span>
              <span class="text-[10px]">{{ getMatchQuant(match).awayMomentum.trend === 'surging' ? '▲' : getMatchQuant(match).awayMomentum.trend === 'declining' ? '▼' : '▬' }}</span>
              <span class="font-bold">{{ getMatchQuant(match).awayMomentum.momentumScore }} pts</span>
            </div>
          </div>

          <!-- Progress split meter -->
          <div class="w-full h-1.5 rounded-full overflow-hidden flex bg-[#171e2c]">
            <div
              class="bg-[#0d9488] h-full transition-all"
              :style="{ width: `${getMatchQuant(match).homeMomentum.momentumScore / (getMatchQuant(match).homeMomentum.momentumScore + getMatchQuant(match).awayMomentum.momentumScore) * 100}%` }"
            ></div>
            <div
              class="bg-[#e11d48] h-full transition-all"
              :style="{ width: `${getMatchQuant(match).awayMomentum.momentumScore / (getMatchQuant(match).homeMomentum.momentumScore + getMatchQuant(match).awayMomentum.momentumScore) * 100}%` }"
            ></div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-[#93a0b8] pt-0.5">
            <span class="font-mono text-[10px]">
              H2H: {{ getMatchQuant(match).h2hSummary.homeWins }}W - {{ getMatchQuant(match).h2hSummary.draws }}D - {{ getMatchQuant(match).h2hSummary.awayWins }}L
              <span class="text-[#64748b]">({{ getMatchQuant(match).h2hSummary.totalPlayed }} meetings)</span>
            </span>
            <span class="font-mono text-[10px] text-[#00f5ff]">
              BTTS {{ getMatchQuant(match).h2hSummary.bttsPct }}% • Over 2.5 {{ getMatchQuant(match).h2hSummary.over25Pct }}%
            </span>
          </div>
        </div>

        <!-- Stacked Probability Bars: Market above model (teal, grey, coral) -->
        <div class="bg-[#0b0f16] p-3 rounded-lg border border-[#243044]">
          <div class="flex items-center justify-between text-[11px] text-[#93a0b8] mb-1.5">
            <span class="font-medium text-[#eef3fb]">Probability Distribution</span>
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
        <!-- Desktop / Tablet Table View -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="text-[#93a0b8] border-b border-[#243044] text-[11px]">
                <th class="py-2 px-2 font-normal">Outcome</th>
                <th class="py-2 px-2 text-right font-normal">Odds</th>
                <th class="py-2 px-2 text-right font-normal">Market Prob</th>
                <th class="py-2 px-2 text-right font-normal">Model Prob</th>
                <th class="py-2 px-3 font-normal min-w-[160px]">Edge</th>
                <th class="py-2 px-2 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#243044]/60 tabular-nums">
              <!-- Home -->
              <tr>
                <td class="py-2.5 px-2 font-medium text-[#eef3fb] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs bg-[#0d9488]"></span>
                  <span>{{ match.homeTeam }} (1)</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#eef3fb]">
                  {{ (match.homeOdds / 100).toFixed(2) }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#93a0b8]">
                  {{ (getMatchEval(match).fair[0] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#eef3fb]">
                  {{ (getMatchEval(match).model[0] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-3">
                  <EdgeBar :edge="getMatchEval(match).edges[0]" />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="store.addToSlip(match, 'home')"
                      title="Add home to slip simulator"
                      class="px-2.5 py-1 text-xs text-[#00f5ff] hover:bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg transition"
                    >
                      ＋ Slip
                    </button>
                    <button
                      @click="handleSavePrediction(match, 'home')"
                      :disabled="isKickoffPassed(match.kickoff)"
                      class="px-2.5 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c] border border-[#243044] rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Save
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Draw -->
              <tr>
                <td class="py-2.5 px-2 font-medium text-[#eef3fb] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs bg-[#64748b]"></span>
                  <span>Draw (X)</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#eef3fb]">
                  {{ (match.drawOdds / 100).toFixed(2) }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#93a0b8]">
                  {{ (getMatchEval(match).fair[1] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#eef3fb]">
                  {{ (getMatchEval(match).model[1] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-3">
                  <EdgeBar :edge="getMatchEval(match).edges[1]" />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="store.addToSlip(match, 'draw')"
                      title="Add draw to slip simulator"
                      class="px-2.5 py-1 text-xs text-[#00f5ff] hover:bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg transition"
                    >
                      ＋ Slip
                    </button>
                    <button
                      @click="handleSavePrediction(match, 'draw')"
                      :disabled="isKickoffPassed(match.kickoff)"
                      class="px-2.5 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c] border border-[#243044] rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Save
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Away -->
              <tr>
                <td class="py-2.5 px-2 font-medium text-[#eef3fb] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-xs bg-[#e11d48]"></span>
                  <span>{{ match.awayTeam }} (2)</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#eef3fb]">
                  {{ (match.awayOdds / 100).toFixed(2) }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#93a0b8]">
                  {{ (getMatchEval(match).fair[2] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-[#eef3fb]">
                  {{ (getMatchEval(match).model[2] * 100).toFixed(1) }}%
                </td>
                <td class="py-2.5 px-3">
                  <EdgeBar :edge="getMatchEval(match).edges[2]" />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="store.addToSlip(match, 'away')"
                      title="Add away to slip simulator"
                      class="px-2.5 py-1 text-xs text-[#00f5ff] hover:bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg transition"
                    >
                      ＋ Slip
                    </button>
                    <button
                      @click="handleSavePrediction(match, 'away')"
                      :disabled="isKickoffPassed(match.kickoff)"
                      class="px-2.5 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c] border border-[#243044] rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Save
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Layout (< 600px) -->
        <div class="block sm:hidden space-y-2.5">
          <!-- Home Card -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#eef3fb] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-xs bg-[#0d9488]"></span>
                {{ match.homeTeam }} (1)
              </span>
              <span class="font-mono text-[#eef3fb] font-medium">
                {{ (match.homeOdds / 100).toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-[#93a0b8] font-mono">
              <span>Market: {{ (getMatchEval(match).fair[0] * 100).toFixed(1) }}%</span>
              <span>Model: {{ (getMatchEval(match).model[0] * 100).toFixed(1) }}%</span>
            </div>

            <div class="pt-1">
              <EdgeBar :edge="getMatchEval(match).edges[0]" />
            </div>

            <div class="pt-1 flex justify-end gap-2">
              <button
                @click="store.addToSlip(match, 'home')"
                class="px-3 py-1 text-xs text-[#00f5ff] bg-[#111722] border border-[#00f5ff]/30 rounded-lg"
              >
                ＋ Slip
              </button>
              <button
                @click="handleSavePrediction(match, 'home')"
                :disabled="isKickoffPassed(match.kickoff)"
                class="px-3 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#111722] border border-[#243044] rounded-lg disabled:opacity-30"
              >
                Save Home
              </button>
            </div>
          </div>

          <!-- Draw Card -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#eef3fb] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-xs bg-[#64748b]"></span>
                Draw (X)
              </span>
              <span class="font-mono text-[#eef3fb] font-medium">
                {{ (match.drawOdds / 100).toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-[#93a0b8] font-mono">
              <span>Market: {{ (getMatchEval(match).fair[1] * 100).toFixed(1) }}%</span>
              <span>Model: {{ (getMatchEval(match).model[1] * 100).toFixed(1) }}%</span>
            </div>

            <div class="pt-1">
              <EdgeBar :edge="getMatchEval(match).edges[1]" />
            </div>

            <div class="pt-1 flex justify-end gap-2">
              <button
                @click="store.addToSlip(match, 'draw')"
                class="px-3 py-1 text-xs text-[#00f5ff] bg-[#111722] border border-[#00f5ff]/30 rounded-lg"
              >
                ＋ Slip
              </button>
              <button
                @click="handleSavePrediction(match, 'draw')"
                :disabled="isKickoffPassed(match.kickoff)"
                class="px-3 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#111722] border border-[#243044] rounded-lg disabled:opacity-30"
              >
                Save Draw
              </button>
            </div>
          </div>

          <!-- Away Card -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#eef3fb] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-xs bg-[#e11d48]"></span>
                {{ match.awayTeam }} (2)
              </span>
              <span class="font-mono text-[#eef3fb] font-medium">
                {{ (match.awayOdds / 100).toFixed(2) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-[#93a0b8] font-mono">
              <span>Market: {{ (getMatchEval(match).fair[2] * 100).toFixed(1) }}%</span>
              <span>Model: {{ (getMatchEval(match).model[2] * 100).toFixed(1) }}%</span>
            </div>

            <div class="pt-1">
              <EdgeBar :edge="getMatchEval(match).edges[2]" />
            </div>

            <div class="pt-1 flex justify-end gap-2">
              <button
                @click="store.addToSlip(match, 'away')"
                class="px-3 py-1 text-xs text-[#00f5ff] bg-[#111722] border border-[#00f5ff]/30 rounded-lg"
              >
                ＋ Slip
              </button>
              <button
                @click="handleSavePrediction(match, 'away')"
                :disabled="isKickoffPassed(match.kickoff)"
                class="px-3 py-1 text-xs text-[#93a0b8] hover:text-[#eef3fb] bg-[#111722] border border-[#243044] rounded-lg disabled:opacity-30"
              >
                Save Away
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Stats Modal -->
    <MatchStatsModal
      :isOpen="showStatsModal"
      :match="selectedMatchForStats"
      :initialTab="statsInitialTab"
      @close="showStatsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import type { MatchAnalysis, OutcomeType } from '@/types';
import EdgeBar from './EdgeBar.vue';
import StackedProbBar from './StackedProbBar.vue';
import MatchStatsModal from './MatchStatsModal.vue';
import PageHeader from './PageHeader.vue';
import { SPORTS_CONFIG } from '@/lib/oddsApi';
import { getTeamStats } from '@/lib/teamAssets';

const store = useOddsStore();
const slateInput = ref('');
const showManualForm = ref(false);

const showStatsModal = ref(false);
const statsInitialTab = ref<'momentum' | 'forecast' | 'tactical'>('momentum');
const selectedMatchForStats = ref<MatchAnalysis | null>(null);

const quantCache = new Map<string, any>();
function getMatchQuant(match: MatchAnalysis) {
  const key = `${match.id}_${match.homeOdds}_${match.drawOdds}_${match.awayOdds}`;
  if (!quantCache.has(key)) {
    quantCache.set(key, store.getMatchQuantPrediction(match));
  }
  return quantCache.get(key);
}

const manualHome = ref('');
const manualAway = ref('');
const manualLeague = ref('PSL');
const manualKickoff = ref(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
const manualHomeOdds = ref<number>(210);
const manualDrawOdds = ref<number>(340);
const manualAwayOdds = ref<number>(360);

function scrollToFocused() {
  const id = store.focusedMatchId;
  if (!id) return;
  nextTick(() => {
    document
      .querySelector(`[data-match-id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

onMounted(() => {
  store.initFirebaseSync();
  scrollToFocused();
});

watch(() => store.focusedMatchId, scrollToFocused);

function getCrest(teamName: string): string {
  return getTeamStats(teamName).crest;
}

function openStats(match: MatchAnalysis, tab: 'momentum' | 'forecast' | 'tactical' = 'momentum') {
  selectedMatchForStats.value = match;
  statsInitialTab.value = tab;
  showStatsModal.value = true;
}

function getMatchEval(match: MatchAnalysis) {
  return store.evaluateMatch(match);
}

function isKickoffPassed(kickoffIso: string): boolean {
  const time = new Date(kickoffIso).getTime();
  return !isNaN(time) && time <= Date.now();
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
