<template>
  <div v-if="isOpen && match" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto backdrop-blur-xs">
    <div class="bg-[#111722] border border-[#243044] rounded-2xl w-full max-w-3xl p-4 sm:p-6 space-y-4 my-auto max-h-[94vh] overflow-y-auto shadow-2xl">
      <!-- Header: Crests, Teams, League, and Close -->
      <div class="flex items-center justify-between border-b border-[#243044] pb-3.5">
        <div class="flex items-center gap-3">
          <!-- Home Crest -->
          <div class="w-10 h-10 rounded-xl bg-[#0b0f16] border border-[#243044] p-1.5 flex items-center justify-center overflow-hidden shrink-0">
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

          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-semibold text-[#eef3fb] truncate flex items-center gap-2">
              <span>{{ match.homeTeam }}</span>
              <span class="text-xs text-[#64748b] font-normal">vs</span>
              <span>{{ match.awayTeam }}</span>
            </h2>
            <div class="flex items-center gap-2 text-xs text-[#93a0b8] font-mono mt-0.5">
              <span class="px-1.5 py-0.5 rounded bg-[#171e2c] border border-[#243044] text-[10px] text-[#00f5ff]">
                {{ match.league }}
              </span>
              <span>•</span>
              <span>Kickoff: {{ formatTime(match.kickoff) }}</span>
            </div>
          </div>

          <!-- Away Crest -->
          <div class="w-10 h-10 rounded-xl bg-[#0b0f16] border border-[#243044] p-1.5 flex items-center justify-center overflow-hidden shrink-0">
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
          type="button"
          @click="$emit('close')"
          class="text-[#93a0b8] hover:text-[#eef3fb] p-1.5 rounded-lg hover:bg-[#171e2c] text-sm transition"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 border-b border-[#243044] pb-2 text-xs">
        <button
          type="button"
          @click="activeTab = 'momentum'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-2',
            activeTab === 'momentum'
              ? 'bg-[#00f5ff]/15 text-[#00f5ff] border border-[#00f5ff]/40 shadow-xs'
              : 'text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c]'
          ]"
        >
          <span>⚡</span>
          <span>Momentum & H2H Archive</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'forecast'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-2',
            activeTab === 'forecast'
              ? 'bg-[#00f5ff]/15 text-[#00f5ff] border border-[#00f5ff]/40 shadow-xs'
              : 'text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c]'
          ]"
        >
          <span>🎯</span>
          <span>Quant Prediction & Edges</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'tactical'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-2',
            activeTab === 'tactical'
              ? 'bg-[#00f5ff]/15 text-[#00f5ff] border border-[#00f5ff]/40 shadow-xs'
              : 'text-[#93a0b8] hover:text-[#eef3fb] hover:bg-[#171e2c]'
          ]"
        >
          <span>📊</span>
          <span>Tactical Radar</span>
        </button>
      </div>

      <!-- ================= TAB 1: MOMENTUM & H2H ARCHIVE ================= -->
      <div v-if="activeTab === 'momentum'" class="space-y-4">
        <!-- Momentum Score Comparative Gauges -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Home Momentum -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#0d9488] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#0d9488]"></span>
                {{ match.homeTeam }}
              </span>
              <span
                :class="[
                  'text-[10px] font-mono px-2 py-0.5 rounded border uppercase',
                  quantPred.homeMomentum.trend === 'surging'
                    ? 'bg-[#0d9488]/20 text-[#2dd4bf] border-[#0d9488]/40'
                    : quantPred.homeMomentum.trend === 'declining'
                    ? 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40'
                    : 'bg-[#64748b]/20 text-[#cbd5e1] border-[#64748b]/40'
                ]"
              >
                {{ quantPred.homeMomentum.trend === 'surging' ? '▲ Surging' : quantPred.homeMomentum.trend === 'declining' ? '▼ Declining' : '▬ Stable' }}
              </span>
            </div>

            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-2xl font-bold font-mono text-[#eef3fb]">
                  {{ quantPred.homeMomentum.momentumScore }}
                </span>
                <span class="text-xs text-[#64748b] ml-1">/ 100 Momentum</span>
              </div>
              <div class="text-[11px] font-mono text-[#93a0b8]">
                {{ quantPred.homeMomentum.recentPointsEarned }} / 15 pts
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-[#171e2c] h-2 rounded-full overflow-hidden">
              <div
                class="bg-gradient-to-r from-[#0d9488] to-[#2dd4bf] h-full rounded-full transition-all duration-500"
                :style="{ width: `${quantPred.homeMomentum.momentumScore}%` }"
              ></div>
            </div>

            <div class="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1 text-center text-[#93a0b8]">
              <div class="bg-[#111722] p-1.5 rounded border border-[#243044]/60">
                <span class="text-[#64748b] block text-[9px]">Clean Sheets</span>
                <span class="text-[#eef3fb] font-semibold">{{ quantPred.homeMomentum.cleanSheetRate }}%</span>
              </div>
              <div class="bg-[#111722] p-1.5 rounded border border-[#243044]/60">
                <span class="text-[#64748b] block text-[9px]">Scored Avg</span>
                <span class="text-[#eef3fb] font-semibold">{{ quantPred.homeMomentum.avgGoalsScored5 }} / gm</span>
              </div>
              <div class="bg-[#111722] p-1.5 rounded border border-[#243044]/60">
                <span class="text-[#64748b] block text-[9px]">Conceded Avg</span>
                <span class="text-[#eef3fb] font-semibold">{{ quantPred.homeMomentum.avgGoalsConceded5 }} / gm</span>
              </div>
            </div>
          </div>

          <!-- Away Momentum -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-[#e11d48] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#e11d48]"></span>
                {{ match.awayTeam }}
              </span>
              <span
                :class="[
                  'text-[10px] font-mono px-2 py-0.5 rounded border uppercase',
                  quantPred.awayMomentum.trend === 'surging'
                    ? 'bg-[#0d9488]/20 text-[#2dd4bf] border-[#0d9488]/40'
                    : quantPred.awayMomentum.trend === 'declining'
                    ? 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40'
                    : 'bg-[#64748b]/20 text-[#cbd5e1] border-[#64748b]/40'
                ]"
              >
                {{ quantPred.awayMomentum.trend === 'surging' ? '▲ Surging' : quantPred.awayMomentum.trend === 'declining' ? '▼ Declining' : '▬ Stable' }}
              </span>
            </div>

            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-2xl font-bold font-mono text-[#eef3fb]">
                  {{ quantPred.awayMomentum.momentumScore }}
                </span>
                <span class="text-xs text-[#64748b] ml-1">/ 100 Momentum</span>
              </div>
              <div class="text-[11px] font-mono text-[#93a0b8]">
                {{ quantPred.awayMomentum.recentPointsEarned }} / 15 pts
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-[#171e2c] h-2 rounded-full overflow-hidden">
              <div
                class="bg-gradient-to-r from-[#e11d48] to-[#fb7185] h-full rounded-full transition-all duration-500"
                :style="{ width: `${quantPred.awayMomentum.momentumScore}%` }"
              ></div>
            </div>

            <div class="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1 text-center text-[#93a0b8]">
              <div class="bg-[#111722] p-1.5 rounded border border-[#243044]/60">
                <span class="text-[#64748b] block text-[9px]">Clean Sheets</span>
                <span class="text-[#eef3fb] font-semibold">{{ quantPred.awayMomentum.cleanSheetRate }}%</span>
              </div>
              <div class="bg-[#111722] p-1.5 rounded border border-[#243044]/60">
                <span class="text-[#64748b] block text-[9px]">Scored Avg</span>
                <span class="text-[#eef3fb] font-semibold">{{ quantPred.awayMomentum.avgGoalsScored5 }} / gm</span>
              </div>
              <div class="bg-[#111722] p-1.5 rounded border border-[#243044]/60">
                <span class="text-[#64748b] block text-[9px]">Conceded Avg</span>
                <span class="text-[#eef3fb] font-semibold">{{ quantPred.awayMomentum.avgGoalsConceded5 }} / gm</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 5-Match Form Breakdown with Venue & xG -->
        <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-[#eef3fb]">Rolling 5-Match Form & Goal Supremacy</span>
            <span class="text-[10px] font-mono text-[#64748b]">Recency-weighted decay (w1 = 1.0 ... w5 = 0.4)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- Home team form matches -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-medium text-[#0d9488] mb-1">{{ match.homeTeam }} Recent 5:</div>
              <div
                v-for="m in quantPred.homeMomentum.recentMatches"
                :key="m.id"
                class="flex items-center justify-between px-2.5 py-1.5 bg-[#111722] border border-[#243044]/70 rounded-lg font-mono text-[11px]"
              >
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'w-4 h-4 rounded text-[9px] flex items-center justify-center font-bold',
                      getFormClass(m.result)
                    ]"
                  >
                    {{ m.result }}
                  </span>
                  <span class="text-[#64748b] text-[10px]">({{ m.venue }})</span>
                  <span class="text-[#eef3fb] truncate max-w-[110px]">{{ m.opponent }}</span>
                </div>
                <div class="flex items-center gap-2 text-[10px]">
                  <span class="text-[#eef3fb] font-bold">{{ m.teamScore }} - {{ m.opponentScore }}</span>
                  <span v-if="m.xG" class="text-[#64748b]">({{ m.xG }} xG)</span>
                </div>
              </div>
            </div>

            <!-- Away team form matches -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-medium text-[#e11d48] mb-1">{{ match.awayTeam }} Recent 5:</div>
              <div
                v-for="m in quantPred.awayMomentum.recentMatches"
                :key="m.id"
                class="flex items-center justify-between px-2.5 py-1.5 bg-[#111722] border border-[#243044]/70 rounded-lg font-mono text-[11px]"
              >
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'w-4 h-4 rounded text-[9px] flex items-center justify-center font-bold',
                      getFormClass(m.result)
                    ]"
                  >
                    {{ m.result }}
                  </span>
                  <span class="text-[#64748b] text-[10px]">({{ m.venue }})</span>
                  <span class="text-[#eef3fb] truncate max-w-[110px]">{{ m.opponent }}</span>
                </div>
                <div class="flex items-center gap-2 text-[10px]">
                  <span class="text-[#eef3fb] font-bold">{{ m.teamScore }} - {{ m.opponentScore }}</span>
                  <span v-if="m.xG" class="text-[#64748b]">({{ m.xG }} xG)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MyFootballFacts Head-to-Head Record Dossier -->
        <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="font-medium text-[#eef3fb]">Head-to-Head Archive</span>
              <span class="text-[10px] font-mono text-[#00f5ff] px-2 py-0.5 rounded bg-[#00f5ff]/10 border border-[#00f5ff]/30">
                {{ quantPred.h2hSummary.totalPlayed }} Past Meetings
              </span>
            </div>
            <div class="text-[10px] font-mono text-[#93a0b8]">
              Avg {{ quantPred.h2hSummary.avgTotalGoals }} Goals / Match
            </div>
          </div>

          <!-- Segmented Win/Draw/Loss Bar -->
          <div class="space-y-1">
            <div class="w-full h-3 rounded-full overflow-hidden flex bg-[#171e2c]">
              <div
                class="bg-[#0d9488] h-full transition-all"
                :style="{ width: `${quantPred.h2hSummary.homeWinPct}%` }"
                :title="`${match.homeTeam} Wins: ${quantPred.h2hSummary.homeWins}`"
              ></div>
              <div
                class="bg-[#64748b] h-full transition-all"
                :style="{ width: `${quantPred.h2hSummary.drawPct}%` }"
                :title="`Draws: ${quantPred.h2hSummary.draws}`"
              ></div>
              <div
                class="bg-[#e11d48] h-full transition-all"
                :style="{ width: `${quantPred.h2hSummary.awayWinPct}%` }"
                :title="`${match.awayTeam} Wins: ${quantPred.h2hSummary.awayWins}`"
              ></div>
            </div>

            <div class="flex items-center justify-between text-[11px] font-mono">
              <span class="text-[#0d9488]">
                {{ match.homeTeam }}: {{ quantPred.h2hSummary.homeWins }}W ({{ quantPred.h2hSummary.homeWinPct }}%)
              </span>
              <span class="text-[#cbd5e1]">
                Draws: {{ quantPred.h2hSummary.draws }}D ({{ quantPred.h2hSummary.drawPct }}%)
              </span>
              <span class="text-[#e11d48]">
                {{ match.awayTeam }}: {{ quantPred.h2hSummary.awayWins }}W ({{ quantPred.h2hSummary.awayWinPct }}%)
              </span>
            </div>
          </div>

          <!-- Quantitative H2H Key Metrics Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums pt-1">
            <div class="bg-[#111722] p-2 rounded-lg border border-[#243044] text-center">
              <span class="text-[10px] text-[#64748b] block font-sans">BTTS Strike Rate</span>
              <span class="text-sm font-bold text-[#eef3fb]">{{ quantPred.h2hSummary.bttsPct }}%</span>
              <span class="text-[9px] text-[#64748b] block font-sans">({{ quantPred.h2hSummary.bttsCount }} matches)</span>
            </div>
            <div class="bg-[#111722] p-2 rounded-lg border border-[#243044] text-center">
              <span class="text-[10px] text-[#64748b] block font-sans">Over 2.5 Goals</span>
              <span class="text-sm font-bold text-[#eef3fb]">{{ quantPred.h2hSummary.over25Pct }}%</span>
              <span class="text-[9px] text-[#64748b] block font-sans">({{ quantPred.h2hSummary.over25Count }} matches)</span>
            </div>
            <div class="bg-[#111722] p-2 rounded-lg border border-[#243044] text-center">
              <span class="text-[10px] text-[#64748b] block font-sans">Clean Sheets Home</span>
              <span class="text-sm font-bold text-[#0d9488]">{{ quantPred.h2hSummary.cleanSheetsHome }}</span>
              <span class="text-[9px] text-[#64748b] block font-sans">vs {{ match.awayTeam }}</span>
            </div>
            <div class="bg-[#111722] p-2 rounded-lg border border-[#243044] text-center">
              <span class="text-[10px] text-[#64748b] block font-sans">Clean Sheets Away</span>
              <span class="text-sm font-bold text-[#e11d48]">{{ quantPred.h2hSummary.cleanSheetsAway }}</span>
              <span class="text-[9px] text-[#64748b] block font-sans">vs {{ match.homeTeam }}</span>
            </div>
          </div>

          <!-- Chronological Past Meetings Table -->
          <div class="space-y-1.5 pt-1">
            <div class="text-[11px] font-medium text-[#93a0b8]">Chronological Match Log:</div>
            <div class="space-y-1 max-h-44 overflow-y-auto pr-1">
              <div
                v-for="m in quantPred.h2hSummary.recentMatches"
                :key="m.id"
                class="flex items-center justify-between px-2.5 py-1.5 bg-[#111722] border border-[#243044]/60 rounded-lg text-[11px] font-mono"
              >
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-[#64748b]">{{ m.date }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#171e2c] text-[#93a0b8]">{{ m.competition }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="[m.homeScore > m.awayScore ? 'font-bold text-[#eef3fb]' : 'text-[#93a0b8]']">{{ m.homeTeam }}</span>
                  <span class="px-1.5 py-0.5 rounded bg-[#0b0f16] border border-[#243044] font-bold text-[#eef3fb]">
                    {{ m.homeScore }} - {{ m.awayScore }}
                  </span>
                  <span :class="[m.awayScore > m.homeScore ? 'font-bold text-[#eef3fb]' : 'text-[#93a0b8]']">{{ m.awayTeam }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: QUANT PREDICTION & EDGES ================= -->
      <div v-if="activeTab === 'forecast'" class="space-y-4">
        <!-- 3-Way Comparative Evaluation Matrix -->
        <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-[#eef3fb]">Quantitative Performance vs Market Odds</span>
            <span class="text-[10px] font-mono text-[#00f5ff]">
              Dixon-Coles Poisson (λH: {{ quantPred.lambdaHome }} / λA: {{ quantPred.lambdaAway }})
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs font-mono tabular-nums text-left">
              <thead>
                <tr class="border-b border-[#243044] text-[10px] text-[#64748b] uppercase">
                  <th class="py-2 px-2 font-normal">Selection</th>
                  <th class="py-2 px-2 font-normal text-right">Bookmaker Odds</th>
                  <th class="py-2 px-2 font-normal text-right">Fair Market</th>
                  <th class="py-2 px-2 font-normal text-right">Quant Model</th>
                  <th class="py-2 px-2 font-normal text-right">Model Edge (+EV)</th>
                  <th class="py-2 px-2 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#243044]/60">
                <!-- Home -->
                <tr class="hover:bg-[#111722]/50 transition">
                  <td class="py-2.5 px-2 font-medium text-[#0d9488]">
                    {{ match.homeTeam }} (Home)
                  </td>
                  <td class="py-2.5 px-2 text-right text-[#eef3fb]">
                    {{ (match.homeOdds / 100).toFixed(2) }}
                  </td>
                  <td class="py-2.5 px-2 text-right text-[#93a0b8]">
                    {{ (quantPred.fairHomeProb * 100).toFixed(1) }}%
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold text-[#eef3fb]">
                    {{ (quantPred.homeProb * 100).toFixed(1) }}%
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold">
                    <span :class="quantPred.edgeHome > 0 ? 'text-[#2dd4bf]' : 'text-[#fb7185]'">
                      {{ quantPred.edgeHome > 0 ? '+' : '' }}{{ (quantPred.edgeHome * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td class="py-2.5 px-2 text-right">
                    <button
                      type="button"
                      @click="store.addToSlip(match, 'home')"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0d9488]/15 border border-[#0d9488]/40 text-[#2dd4bf] hover:bg-[#0d9488]/30 transition"
                    >
                      ＋ Slip
                    </button>
                  </td>
                </tr>

                <!-- Draw -->
                <tr class="hover:bg-[#111722]/50 transition">
                  <td class="py-2.5 px-2 font-medium text-[#cbd5e1]">
                    Draw
                  </td>
                  <td class="py-2.5 px-2 text-right text-[#eef3fb]">
                    {{ (match.drawOdds / 100).toFixed(2) }}
                  </td>
                  <td class="py-2.5 px-2 text-right text-[#93a0b8]">
                    {{ (quantPred.fairDrawProb * 100).toFixed(1) }}%
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold text-[#eef3fb]">
                    {{ (quantPred.drawProb * 100).toFixed(1) }}%
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold">
                    <span :class="quantPred.edgeDraw > 0 ? 'text-[#2dd4bf]' : 'text-[#fb7185]'">
                      {{ quantPred.edgeDraw > 0 ? '+' : '' }}{{ (quantPred.edgeDraw * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td class="py-2.5 px-2 text-right">
                    <button
                      type="button"
                      @click="store.addToSlip(match, 'draw')"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#64748b]/15 border border-[#64748b]/40 text-[#cbd5e1] hover:bg-[#64748b]/30 transition"
                    >
                      ＋ Slip
                    </button>
                  </td>
                </tr>

                <!-- Away -->
                <tr class="hover:bg-[#111722]/50 transition">
                  <td class="py-2.5 px-2 font-medium text-[#e11d48]">
                    {{ match.awayTeam }} (Away)
                  </td>
                  <td class="py-2.5 px-2 text-right text-[#eef3fb]">
                    {{ (match.awayOdds / 100).toFixed(2) }}
                  </td>
                  <td class="py-2.5 px-2 text-right text-[#93a0b8]">
                    {{ (quantPred.fairAwayProb * 100).toFixed(1) }}%
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold text-[#eef3fb]">
                    {{ (quantPred.awayProb * 100).toFixed(1) }}%
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold">
                    <span :class="quantPred.edgeAway > 0 ? 'text-[#2dd4bf]' : 'text-[#fb7185]'">
                      {{ quantPred.edgeAway > 0 ? '+' : '' }}{{ (quantPred.edgeAway * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td class="py-2.5 px-2 text-right">
                    <button
                      type="button"
                      @click="store.addToSlip(match, 'away')"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#e11d48]/15 border border-[#e11d48]/40 text-[#fb7185] hover:bg-[#e11d48]/30 transition"
                    >
                      ＋ Slip
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Derivative Markets & Exact Scorelines -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- Derivative Markets -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-2.5">
            <span class="font-medium text-[#eef3fb] block">Derivative Market Probabilities</span>
            
            <div class="space-y-2 font-mono">
              <div class="bg-[#111722] p-2.5 rounded-lg border border-[#243044] flex items-center justify-between">
                <div>
                  <span class="text-[#64748b] text-[10px] block font-sans">Both Teams To Score (BTTS)</span>
                  <span class="text-xs font-bold text-[#eef3fb]">Yes: {{ (quantPred.bttsProb * 100).toFixed(1) }}%</span>
                </div>
                <div class="text-right text-[10px] text-[#93a0b8]">
                  Fair Odds: <strong class="text-[#00f5ff]">{{ (1 / quantPred.bttsProb).toFixed(2) }}</strong>
                </div>
              </div>

              <div class="bg-[#111722] p-2.5 rounded-lg border border-[#243044] flex items-center justify-between">
                <div>
                  <span class="text-[#64748b] text-[10px] block font-sans">Total Goals Over 2.5</span>
                  <span class="text-xs font-bold text-[#eef3fb]">Over: {{ (quantPred.over25Prob * 100).toFixed(1) }}%</span>
                </div>
                <div class="text-right text-[10px] text-[#93a0b8]">
                  Fair Odds: <strong class="text-[#00f5ff]">{{ (1 / quantPred.over25Prob).toFixed(2) }}</strong>
                </div>
              </div>

              <div class="bg-[#111722] p-2.5 rounded-lg border border-[#243044] flex items-center justify-between">
                <div>
                  <span class="text-[#64748b] text-[10px] block font-sans">Total Goals Under 2.5</span>
                  <span class="text-xs font-bold text-[#eef3fb]">Under: {{ (quantPred.under25Prob * 100).toFixed(1) }}%</span>
                </div>
                <div class="text-right text-[10px] text-[#93a0b8]">
                  Fair Odds: <strong class="text-[#00f5ff]">{{ (1 / quantPred.under25Prob).toFixed(2) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Projected Exact Scorelines -->
          <div class="bg-[#0b0f16] border border-[#243044] rounded-xl p-3.5 space-y-2.5">
            <span class="font-medium text-[#eef3fb] block">Most Likely Exact Scorelines</span>

            <div class="space-y-1.5 font-mono">
              <div
                v-for="(s, idx) in quantPred.topScorelines"
                :key="s.score"
                class="flex items-center justify-between px-2.5 py-1.5 bg-[#111722] border border-[#243044] rounded-lg text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-[#64748b]">#{{ idx + 1 }}</span>
                  <span class="font-bold text-[#eef3fb]">{{ s.score }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-16 bg-[#171e2c] h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div class="bg-[#00f5ff] h-full" :style="{ width: `${s.probability * 400}%` }"></div>
                  </div>
                  <span class="text-[#00f5ff] font-semibold">{{ s.percent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Momentum Tilt & Quant Explanation Box -->
        <div class="bg-[#00f5ff]/5 border border-[#00f5ff]/25 rounded-xl p-3 text-xs space-y-1.5">
          <div class="flex items-center gap-1.5 text-[#00f5ff] font-medium text-[11px]">
            <span>💡</span>
            <span>Quantitative Performance Edge Rationale</span>
          </div>
          <p class="text-[#93a0b8] leading-relaxed">
            {{ quantPred.momentumTiltExplanation }}
          </p>
        </div>

        <!-- Action Bar: Lock Prediction or Add Best Value to Slip -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#243044]">
          <div class="text-xs font-mono text-[#93a0b8]">
            Recommended Value:
            <strong class="text-[#00f5ff] uppercase">{{ quantPred.recommendedOutcome }}</strong>
            <span v-if="quantPred.recommendedEdge > 0" class="text-[#2dd4bf] ml-1">
              (+{{ (quantPred.recommendedEdge * 100).toFixed(1) }}% edge)
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="handleSaveModelPrediction"
              class="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold bg-[#171e2c] hover:bg-[#1c2738] border border-[#243044] text-[#eef3fb] transition"
            >
              🔒 Lock Prediction
            </button>
            <button
              type="button"
              @click="store.addToSlip(match, quantPred.recommendedOutcome)"
              class="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold bg-[#00f5ff] hover:brightness-110 text-[#041016] transition shadow-xs"
            >
              ＋ Add Value Pick to Slip
            </button>
          </div>
        </div>
      </div>

      <!-- ================= TAB 3: TACTICAL RADAR ================= -->
      <div v-if="activeTab === 'tactical'" class="space-y-4">
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
            <span class="font-medium text-[#eef3fb]">Tactical Radar Comparison</span>
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
      </div>

      <!-- Close button Footer -->
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
import { useOddsStore } from '@/stores/oddsStore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps<{
  isOpen: boolean;
  match: MatchAnalysis | null;
  initialTab?: 'momentum' | 'forecast' | 'tactical';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useOddsStore();
const activeTab = ref<'momentum' | 'forecast' | 'tactical'>('momentum');
const radarCanvas = ref<HTMLCanvasElement | null>(null);
let radarChartInstance: Chart | null = null;

const homeStats = computed(() => getTeamStats(props.match?.homeTeam || 'Home'));
const awayStats = computed(() => getTeamStats(props.match?.awayTeam || 'Away'));

const quantPred = computed(() => {
  if (!props.match) {
    return {
      lambdaHome: 1.5,
      lambdaAway: 1.1,
      homeProb: 0.45,
      drawProb: 0.30,
      awayProb: 0.25,
      fairHomeProb: 0.45,
      fairDrawProb: 0.30,
      fairAwayProb: 0.25,
      edgeHome: 0,
      edgeDraw: 0,
      edgeAway: 0,
      recommendedOutcome: 'home' as const,
      recommendedEdge: 0,
      hasPositiveEdge: false,
      bttsProb: 0.52,
      over25Prob: 0.50,
      under25Prob: 0.50,
      topScorelines: [],
      homeMomentum: {
        teamName: '',
        momentumScore: 70,
        trend: 'stable' as const,
        trendDelta: 0,
        recentMatches: [],
        cleanSheetRate: 40,
        failToScoreRate: 20,
        avgGoalsScored5: 1.8,
        avgGoalsConceded5: 1.0,
        recentPointsEarned: 10,
      },
      awayMomentum: {
        teamName: '',
        momentumScore: 65,
        trend: 'stable' as const,
        trendDelta: 0,
        recentMatches: [],
        cleanSheetRate: 35,
        failToScoreRate: 25,
        avgGoalsScored5: 1.5,
        avgGoalsConceded5: 1.2,
        recentPointsEarned: 8,
      },
      momentumDiff: 5,
      h2hSummary: {
        homeTeam: '',
        awayTeam: '',
        totalPlayed: 6,
        homeWins: 3,
        draws: 2,
        awayWins: 1,
        homeWinPct: 50,
        drawPct: 33,
        awayWinPct: 17,
        avgTotalGoals: 2.3,
        bttsCount: 3,
        bttsPct: 50,
        over25Count: 3,
        over25Pct: 50,
        cleanSheetsHome: 2,
        cleanSheetsAway: 1,
        recentMatches: [],
      },
      momentumTiltExplanation: '',
    };
  }
  return store.getMatchQuantPrediction(props.match);
});

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
  if (!radarCanvas.value || !props.match || activeTab.value !== 'tactical') return;
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
          data: [
            h.attackRating,
            h.defenseRating,
            h.possessionAvg,
            (h.avgGoalsScored / 3) * 100,
            quantPred.value.homeMomentum.momentumScore,
          ],
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.15)',
          pointBackgroundColor: '#0d9488',
          borderWidth: 1.5,
        },
        {
          label: a.name,
          data: [
            a.attackRating,
            a.defenseRating,
            a.possessionAvg,
            (a.avgGoalsScored / 3) * 100,
            quantPred.value.awayMomentum.momentumScore,
          ],
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

function handleSaveModelPrediction() {
  if (!props.match) return;
  store.savePrediction(props.match.id, quantPred.value.recommendedOutcome);
}

watch(
  () => [props.isOpen, props.match, activeTab.value],
  ([open, , tab]) => {
    if (open && tab === 'tactical') {
      nextTick(renderRadar);
    }
  }
);

watch(
  () => props.initialTab,
  (newTab) => {
    if (newTab) activeTab.value = newTab;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (radarChartInstance) radarChartInstance.destroy();
});
</script>
