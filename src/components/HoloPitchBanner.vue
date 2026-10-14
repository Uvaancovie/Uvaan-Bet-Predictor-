<template>
  <section class="relative overflow-hidden rounded-2xl border border-line bg-surface">
    <div
      class="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center justify-end pr-8 text-accent opacity-25 md:flex"
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 240" class="h-auto w-full max-w-[320px]" fill="none" stroke="currentColor">
        <rect x="20" y="20" width="360" height="200" rx="4" stroke-width="1.5" />
        <line x1="200" y1="20" x2="200" y2="220" stroke-width="1.5" />
        <circle cx="200" cy="120" r="45" stroke-width="1.5" />
        <circle cx="200" cy="120" r="3" fill="currentColor" />
        <rect x="20" y="60" width="60" height="120" stroke-width="1" />
        <rect x="20" y="85" width="25" height="70" stroke-width="1" />
        <rect x="320" y="60" width="60" height="120" stroke-width="1" />
        <rect x="355" y="85" width="25" height="70" stroke-width="1" />
      </svg>
    </div>

    <div class="relative max-w-xl space-y-4 p-5 sm:p-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Fixtures</p>
      <div class="space-y-2">
        <h1 class="text-[1.7rem] font-semibold leading-none tracking-tight text-ink sm:text-3xl">
          Upcoming matches
        </h1>
        <p class="text-sm leading-relaxed text-muted">
          Decimal prices for the selected league. Open a match to remove the bookmaker margin and compare it with the model.
        </p>
      </div>

      <dl class="flex flex-wrap gap-2 text-xs">
        <div class="rounded-lg border border-line bg-inset px-2.5 py-1.5">
          <dt class="text-[10px] uppercase tracking-wider text-faint">On screen</dt>
          <dd class="font-mono text-sm text-ink">{{ store.matches.length }}</dd>
        </div>
        <div class="rounded-lg border border-line bg-inset px-2.5 py-1.5">
          <dt class="text-[10px] uppercase tracking-wider text-faint">Feed</dt>
          <dd class="font-mono text-sm text-ink">{{ feedLabel }}</dd>
        </div>
        <div class="rounded-lg border border-line bg-inset px-2.5 py-1.5">
          <dt class="text-[10px] uppercase tracking-wider text-faint">API left</dt>
          <dd class="font-mono text-sm text-ink">{{ quotaLabel }}</dd>
        </div>
        <div v-if="updatedLabel" class="rounded-lg border border-line bg-inset px-2.5 py-1.5">
          <dt class="text-[10px] uppercase tracking-wider text-faint">Updated</dt>
          <dd class="font-mono text-sm text-ink">{{ updatedLabel }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';

const store = useOddsStore();

const feedLabel = computed(() => {
  if (store.isLiveLoading) return 'Updating';
  if (store.isLiveCached) return 'Cached';
  if (store.lastLiveFetchedAt) return 'Live';
  return 'Local';
});

const quotaLabel = computed(() => {
  if (store.requestsRemaining === null) return '—';
  return `${store.requestsRemaining}/500`;
});

const updatedLabel = computed(() => {
  if (!store.lastLiveFetchedAt) return '';
  const parsed = new Date(store.lastLiveFetchedAt);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});
</script>
