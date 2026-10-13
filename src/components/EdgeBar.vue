<template>
  <div class="flex items-center gap-2 w-full min-w-[120px]">
    <!-- Diverging bar container with center line at 0 -->
    <div class="relative flex-1 h-3 bg-[#1e222b] rounded flex items-center overflow-hidden border border-[#2a2f3d]">
      <!-- Center 0-line -->
      <div class="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#424858] z-10"></div>

      <!-- Negative bar (Grey, extends left from center) -->
      <div
        v-if="edge < 0"
        class="absolute right-1/2 top-0.5 bottom-0.5 bg-[#64748b] rounded-l-xs transition-all"
        :style="{ width: `${Math.min(50, Math.abs(edge) * 250)}%` }"
      ></div>

      <!-- Positive bar (Blue, extends right from center) -->
      <div
        v-if="edge > 0"
        class="absolute left-1/2 top-0.5 bottom-0.5 bg-[#3b82f6] rounded-r-xs transition-all"
        :style="{ width: `${Math.min(50, edge * 250)}%` }"
      ></div>
    </div>

    <!-- Numeric value -->
    <span
      :class="[
        'w-12 text-right text-xs font-mono tabular-nums',
        edge > 0 ? 'text-[#93c5fd]' : edge < 0 ? 'text-[#94a3b8]' : 'text-[#64748b]'
      ]"
    >
      {{ edge > 0 ? '+' : '' }}{{ (edge * 100).toFixed(1) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  edge: number; // e.g. +0.0457 or -0.0210
}>();
</script>
