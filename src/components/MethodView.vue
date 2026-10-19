<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <PageHeader
      eyebrow="Model"
      title="Method"
      description="How fair probabilities, edge, and the Brier score are calculated."
    />

    <!-- Worked Example -->
    <section class="bg-[#111722] border border-[#243044] rounded-xl p-5 space-y-4">
      <h2 class="text-xs font-medium text-[#eef3fb] uppercase tracking-wider">
        Worked Example: De-vigging a 3-way Market
      </h2>

      <p class="text-xs text-[#93a0b8] leading-relaxed">
        Consider a match with published decimal odds of <strong>2.10</strong> (Home), <strong>3.40</strong> (Draw), and <strong>3.60</strong> (Away).
      </p>

      <!-- Step 1 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#eef3fb] font-medium">1. Compute raw implied probabilities</div>
        <p class="text-[#93a0b8]">
          Implied probability is the reciprocal of the decimal odds:
        </p>
        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 font-mono text-[11px] text-[#93a0b8] space-y-1">
          <div>P_raw(Home) = 1 / 2.10 = 0.4762 (47.6%)</div>
          <div>P_raw(Draw) = 1 / 3.40 = 0.2941 (29.4%)</div>
          <div>P_raw(Away) = 1 / 3.60 = 0.2778 (27.8%)</div>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#eef3fb] font-medium">2. Calculate the overround (margin)</div>
        <p class="text-[#93a0b8]">
          Summing the raw implied probabilities yields a total greater than 1.0:
        </p>
        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 font-mono text-[11px] text-[#93a0b8]">
          Overround = 0.4762 + 0.2941 + 0.2778 = 1.0481 (+4.81% bookmaker margin)
        </div>
      </div>

      <!-- Step 3 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#eef3fb] font-medium">3. Remove the margin (Proportional De-vig)</div>
        <p class="text-[#93a0b8]">
          Divide each raw probability by the overround so the sum equals exactly 1.0:
        </p>
        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 font-mono text-[11px] text-[#eef3fb] space-y-1">
          <div>P_fair(Home) = 0.4762 / 1.0481 = 0.4543 (45.4%)</div>
          <div>P_fair(Draw) = 0.2941 / 1.0481 = 0.2806 (28.1%)</div>
          <div>P_fair(Away) = 0.2778 / 1.0481 = 0.2650 (26.5%)</div>
          <div class="text-[#64748b] pt-1 border-t border-[#243044]">Sum = 100.0%</div>
        </div>
      </div>

      <!-- Step 4 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#eef3fb] font-medium">4. Edge calculation</div>
        <p class="text-[#93a0b8]">
          Edge is the difference between the model's estimated probability and the market's fair probability:
        </p>
        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 font-mono text-[11px] text-[#93a0b8]">
          Edge = P_model - P_fair
        </div>
        <p class="text-[#93a0b8]">
          If the model estimates Home at <strong>0.5000 (50.0%)</strong>, the edge is <strong>+0.0457 (+4.6%)</strong>.
        </p>
      </div>

      <!-- Step 5 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#eef3fb] font-medium">5. Proper scoring: The Brier score</div>
        <p class="text-[#93a0b8]">
          The Brier score measures calibration error: sum of squared differences between probabilities and actual outcome (1 for event occurred, 0 otherwise):
        </p>
        <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 font-mono text-[11px] text-[#93a0b8]">
          Brier = (P_home - actual_home)² + (P_draw - actual_draw)² + (P_away - actual_away)²
        </div>
        <p class="text-[#93a0b8]">
          For probabilities [0.50, 0.25, 0.25] and a Home win: (0.50 - 1)² + 0.25² + 0.25² = <strong>0.375</strong>.
        </p>
      </div>
    </section>

    <!-- MyFootballFacts Quantitative Performance & Momentum Modeling -->
    <section class="bg-[#111722] border border-[#243044] rounded-xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-medium text-[#00f5ff] uppercase tracking-wider flex items-center gap-2">
          <span>⚡</span>
          <span>MyFootballFacts Momentum & Dixon-Coles Poisson Engine</span>
        </h2>
        <span class="text-[10px] font-mono text-[#93a0b8]">Version 2.0 Quant Synthesis</span>
      </div>

      <p class="text-xs text-[#93a0b8] leading-relaxed">
        OddsLab combines high-resolution match archives with statistical distributions to model soccer match outcomes beyond flat table standings:
      </p>

      <div class="space-y-3 text-xs">
        <div class="space-y-1">
          <div class="text-[#eef3fb] font-medium">1. Exponentially Decayed Momentum Score ($M \in [0, 100]$)</div>
          <p class="text-[#93a0b8]">
            Recent performances are weighted using exponential decay ($w = [1.0, 0.85, 0.70, 0.55, 0.40]$). Each match performance rewards result points (3 for W, 1 for D), adjusted by goal difference ($+0.25 \times \Delta G$), clean sheet bonuses, and a $+15\%$ multiplier for away matches to account for venue difficulty.
          </p>
        </div>

        <div class="space-y-1">
          <div class="text-[#eef3fb] font-medium">2. Dixon-Coles Low-Score Calibration Factor ($\tau$)</div>
          <p class="text-[#93a0b8]">
            Standard bivariate Poisson models systematically underestimate low-scoring draws ($0-0$ and $1-1$). The Dixon-Coles parameter $\rho \approx -0.12$ adjusts the joint probability matrix:
          </p>
          <div class="bg-[#0b0f16] border border-[#243044] rounded-lg p-3 font-mono text-[11px] text-[#93a0b8] space-y-1">
            <div>P(0,0) = (1 - λ_h · λ_a · ρ) · Pois(0; λ_h) · Pois(0; λ_a)</div>
            <div>P(1,1) = (1 - ρ) · Pois(1; λ_h) · Pois(1; λ_a)</div>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-[#eef3fb] font-medium">3. Head-to-Head (H2H) Historical Shrinkage</div>
          <p class="text-[#93a0b8]">
            Long-term derby archives (such as Sundowns vs Pirates or Soweto derbies) establish historical strike rates for Both Teams to Score (BTTS) and Over 2.5 Goals, shrinking Poisson goal expectancy towards empirical head-to-head baselines.
          </p>
        </div>
      </div>
    </section>

    <!-- Limits of modeling -->
    <section class="bg-[#111722] border border-[#243044] rounded-xl p-5 space-y-2 text-xs">
      <h2 class="text-xs font-medium text-[#eef3fb]">Limits & Uncertainty</h2>
      <p class="text-[#93a0b8] leading-relaxed">
        A positive theoretical edge does not guarantee a positive return. Over sample sizes under several hundred bets, results are dominated by variance. This tool evaluates probability calibration rather than providing tips or staking advice.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import PageHeader from './PageHeader.vue';
</script>
