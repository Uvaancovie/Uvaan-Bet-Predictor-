<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <div class="space-y-1">
      <h1 class="text-base font-medium text-[#f1f3f7]">Method & Margin Removal</h1>
      <p class="text-xs text-[#9aa1b2]">
        How Odds Lab calculates fair probabilities, edges, and model calibration.
      </p>
    </div>

    <!-- Worked Example -->
    <section class="bg-[#16181e] border border-[#262a34] rounded-xl p-5 space-y-4">
      <h2 class="text-xs font-medium text-[#f1f3f7] uppercase tracking-wider">
        Worked Example: De-vigging a 3-way Market
      </h2>

      <p class="text-xs text-[#9aa1b2] leading-relaxed">
        Consider a match with published decimal odds of <strong>2.10</strong> (Home), <strong>3.40</strong> (Draw), and <strong>3.60</strong> (Away).
      </p>

      <!-- Step 1 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#f1f3f7] font-medium">1. Compute raw implied probabilities</div>
        <p class="text-[#9aa1b2]">
          Implied probability is the reciprocal of the decimal odds:
        </p>
        <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 font-mono text-[11px] text-[#9aa1b2] space-y-1">
          <div>P_raw(Home) = 1 / 2.10 = 0.4762 (47.6%)</div>
          <div>P_raw(Draw) = 1 / 3.40 = 0.2941 (29.4%)</div>
          <div>P_raw(Away) = 1 / 3.60 = 0.2778 (27.8%)</div>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#f1f3f7] font-medium">2. Calculate the overround (margin)</div>
        <p class="text-[#9aa1b2]">
          Summing the raw implied probabilities yields a total greater than 1.0:
        </p>
        <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 font-mono text-[11px] text-[#9aa1b2]">
          Overround = 0.4762 + 0.2941 + 0.2778 = 1.0481 (+4.81% bookmaker margin)
        </div>
      </div>

      <!-- Step 3 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#f1f3f7] font-medium">3. Remove the margin (Proportional De-vig)</div>
        <p class="text-[#9aa1b2]">
          Divide each raw probability by the overround so the sum equals exactly 1.0:
        </p>
        <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 font-mono text-[11px] text-[#f1f3f7] space-y-1">
          <div>P_fair(Home) = 0.4762 / 1.0481 = 0.4543 (45.4%)</div>
          <div>P_fair(Draw) = 0.2941 / 1.0481 = 0.2806 (28.1%)</div>
          <div>P_fair(Away) = 0.2778 / 1.0481 = 0.2650 (26.5%)</div>
          <div class="text-[#656c7d] pt-1 border-t border-[#262a34]">Sum = 100.0%</div>
        </div>
      </div>

      <!-- Step 4 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#f1f3f7] font-medium">4. Edge calculation</div>
        <p class="text-[#9aa1b2]">
          Edge is the difference between the model's estimated probability and the market's fair probability:
        </p>
        <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 font-mono text-[11px] text-[#9aa1b2]">
          Edge = P_model - P_fair
        </div>
        <p class="text-[#9aa1b2]">
          If the model estimates Home at <strong>0.5000 (50.0%)</strong>, the edge is <strong>+0.0457 (+4.6%)</strong>.
        </p>
      </div>

      <!-- Step 5 -->
      <div class="space-y-1.5 text-xs">
        <div class="text-[#f1f3f7] font-medium">5. Proper scoring: The Brier score</div>
        <p class="text-[#9aa1b2]">
          The Brier score measures calibration error: sum of squared differences between probabilities and actual outcome (1 for event occurred, 0 otherwise):
        </p>
        <div class="bg-[#0f1115] border border-[#262a34] rounded-lg p-3 font-mono text-[11px] text-[#9aa1b2]">
          Brier = (P_home - actual_home)² + (P_draw - actual_draw)² + (P_away - actual_away)²
        </div>
        <p class="text-[#9aa1b2]">
          For probabilities [0.50, 0.25, 0.25] and a Home win: (0.50 - 1)² + 0.25² + 0.25² = <strong>0.375</strong>.
        </p>
      </div>
    </section>

    <!-- Limits of modeling -->
    <section class="bg-[#16181e] border border-[#262a34] rounded-xl p-5 space-y-2 text-xs">
      <h2 class="text-xs font-medium text-[#f1f3f7]">Limits & Uncertainty</h2>
      <p class="text-[#9aa1b2] leading-relaxed">
        A positive theoretical edge does not guarantee a positive return. Over sample sizes under several hundred bets, results are dominated by variance. This tool evaluates probability calibration rather than providing tips or staking advice.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
// Minimalist Method view
</script>
