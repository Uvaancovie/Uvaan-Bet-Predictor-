<template>
  <header class="bg-[#16181e] border-b border-[#262a34] sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between gap-4">
      <!-- Title -->
      <div class="flex items-center gap-3">
        <span class="font-medium text-sm sm:text-base text-[#f1f3f7] tracking-tight">
          Uvaan's Bet Predictor
        </span>
        <span class="text-[11px] text-[#656c7d] hidden md:inline">
          Odds & calibration analysis
        </span>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex items-center gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="store.activeTab = tab.id"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-lg transition',
            store.activeTab === tab.id
              ? 'bg-[#222632] text-[#f1f3f7] border border-[#323744]'
              : 'text-[#9aa1b2] hover:text-[#f1f3f7] hover:bg-[#1c1f26]'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';

const store = useOddsStore();

const tabs = computed(() => [
  { id: 'analyzer' as const, name: 'Analyzer' },
  { id: 'log' as const, name: 'Predictions' },
  { id: 'stats' as const, name: 'Track Record' },
  { id: 'method' as const, name: 'Method' },
]);
</script>
