<template>
  <header class="bg-[#0c1017] border-b border-[#1e2638] sticky top-0 z-40 backdrop-blur-md">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
      <!-- Title & Tony Stark HUD Badge -->
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/40 flex items-center justify-center font-mono text-[#00f5ff] text-xs font-bold shadow-[0_0_10px_rgba(0,245,255,0.2)]">
          ◈
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm sm:text-base text-[#f0f4fc] tracking-tight">
              Uvaan's Bet Predictor
            </span>
            <span class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-xs bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30 hidden xs:inline">
              AI // MARK-VII
            </span>
          </div>
          <div class="text-[10px] text-[#56647a] font-mono -mt-0.5 hidden md:block">
            TACTICAL RADAR & PROBABILITY TELEMETRY
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex items-center gap-1 overflow-x-auto py-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="store.activeTab = tab.id"
          :class="[
            'px-2.5 sm:px-3 py-1.5 text-xs font-mono rounded transition whitespace-nowrap border',
            store.activeTab === tab.id
              ? 'bg-[#00f5ff]/15 text-[#00f5ff] border-[#00f5ff]/50 shadow-[0_0_10px_rgba(0,245,255,0.15)] font-semibold'
              : 'text-[#8d9bb0] border-transparent hover:text-[#f0f4fc] hover:bg-[#141a26]'
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
  { id: 'upcoming' as const, name: 'Upcoming' },
  { id: 'analyzer' as const, name: 'Analyzer' },
  { id: 'log' as const, name: 'Predictions' },
  { id: 'stats' as const, name: 'Track Record' },
  { id: 'method' as const, name: 'Method' },
]);
</script>
