<template>
  <div class="space-y-1.5 text-[11px] font-mono tabular-nums">
    <!-- Market row -->
    <div class="flex items-center gap-2">
      <span class="w-12 text-[#8d9bb0] font-mono text-[10px] uppercase">Market</span>
      <div class="flex-1 h-2.5 bg-[#080a0f] rounded-xs flex overflow-hidden border border-[#1e2638]">
        <div
          class="bg-[#00f5d4] transition-all"
          :style="{ width: `${market[0] * 100}%` }"
          title="Home fair market prob"
        ></div>
        <div
          class="bg-[#94a3b8] transition-all"
          :style="{ width: `${market[1] * 100}%` }"
          title="Draw fair market prob"
        ></div>
        <div
          class="bg-[#f43f5e] transition-all"
          :style="{ width: `${market[2] * 100}%` }"
          title="Away fair market prob"
        ></div>
      </div>
      <div class="text-[10px] text-[#8d9bb0] w-28 text-right hidden sm:block">
        {{ (market[0] * 100).toFixed(1) }} / {{ (market[1] * 100).toFixed(1) }} / {{ (market[2] * 100).toFixed(1) }}%
      </div>
    </div>

    <!-- Model row -->
    <div class="flex items-center gap-2">
      <span class="w-12 text-[#8d9bb0] font-mono text-[10px] uppercase">Model</span>
      <div class="flex-1 h-2.5 bg-[#080a0f] rounded-xs flex overflow-hidden border border-[#1e2638]">
        <div
          class="bg-[#00f5d4] transition-all opacity-85"
          :style="{ width: `${model[0] * 100}%` }"
          title="Home model prob"
        ></div>
        <div
          class="bg-[#94a3b8] transition-all opacity-85"
          :style="{ width: `${model[1] * 100}%` }"
          title="Draw model prob"
        ></div>
        <div
          class="bg-[#f43f5e] transition-all opacity-85"
          :style="{ width: `${model[2] * 100}%` }"
          title="Away model prob"
        ></div>
      </div>
      <div class="text-[10px] text-[#8d9bb0] w-28 text-right hidden sm:block">
        {{ (model[0] * 100).toFixed(1) }} / {{ (model[1] * 100).toFixed(1) }} / {{ (model[2] * 100).toFixed(1) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  market: [number, number, number]; // [home, draw, away] fair probs summing to 1
  model: [number, number, number];  // [home, draw, away] model probs summing to 1
}>();
</script>
