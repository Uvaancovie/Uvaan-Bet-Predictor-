<template>
  <header class="sticky top-0 z-40 border-b border-line bg-app/85 backdrop-blur-xl">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="flex h-14 items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-2.5">
          <div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/40 bg-accent/10 font-mono text-[11px] font-semibold text-accent">
            UB
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold tracking-tight text-ink sm:text-base">
              Uvaan's Bet Predictor
            </div>
            <div class="hidden truncate text-[11px] text-faint sm:block">
              Fair price, edge, and calibration
            </div>
          </div>
        </div>

        <nav class="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="store.activeTab = tab.id"
            :aria-current="store.activeTab === tab.id ? 'page' : undefined"
            :class="tabClass(tab.id)"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <nav class="-mx-1 flex gap-1 overflow-x-auto pb-2.5 lg:hidden" aria-label="Primary">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="store.activeTab = tab.id"
          :aria-current="store.activeTab === tab.id ? 'page' : undefined"
          :class="tabClass(tab.id)"
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

function tabClass(id: (typeof tabs.value)[number]['id']) {
  const active = store.activeTab === id;
  return [
    'shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition',
    active
      ? 'border-accent/50 bg-accent/15 text-accent'
      : 'border-transparent text-muted hover:bg-raised hover:text-ink',
  ];
}
</script>
