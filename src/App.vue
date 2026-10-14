<template>
  <div class="flex min-h-screen flex-col bg-app text-ink antialiased">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
    >
      Skip to content
    </a>

    <NavigationHeader />

    <main id="main" class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-16 sm:px-6">
      <UpcomingMatchesView v-if="store.activeTab === 'upcoming'" />
      <AnalyzerView v-else-if="store.activeTab === 'analyzer'" />
      <PredictionsLogView v-else-if="store.activeTab === 'log'" />
      <StatsView v-else-if="store.activeTab === 'stats'" />
      <MethodView v-else-if="store.activeTab === 'method'" />
    </main>

    <ResponsibleGamblingBanner />

    <!-- Global bet-slip simulator entry point -->
    <button
      type="button"
      @click="store.openSlip()"
      class="fixed bottom-6 left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-xl border border-accent/40 bg-raised px-4 text-xs font-semibold text-accent shadow-lg shadow-black/40 transition hover:bg-accent/10"
      aria-label="Open bet slip simulator"
    >
      <span aria-hidden="true">🎲</span>
      <span>Simulate slip</span>
      <span
        v-if="store.slipLegs.length > 0"
        class="rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-app"
      >
        {{ store.slipLegs.length }}
      </span>
    </button>

    <BetSlipSimulatorModal />

    <div
      v-if="store.toastMessage"
      role="status"
      class="toast-in fixed bottom-6 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-line-strong bg-raised px-3.5 py-3 text-sm text-ink shadow-lg shadow-black/40"
    >
      <span class="mt-0.5 h-4 w-0.5 shrink-0 rounded-full bg-accent" aria-hidden="true"></span>
      <span class="leading-snug">{{ store.toastMessage }}</span>
      <button
        type="button"
        @click="store.toastMessage = null"
        class="ml-auto text-muted hover:text-ink"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import NavigationHeader from '@/components/NavigationHeader.vue';
import ResponsibleGamblingBanner from '@/components/ResponsibleGamblingBanner.vue';
import UpcomingMatchesView from '@/components/UpcomingMatchesView.vue';
import AnalyzerView from '@/components/AnalyzerView.vue';
import PredictionsLogView from '@/components/PredictionsLogView.vue';
import StatsView from '@/components/StatsView.vue';
import MethodView from '@/components/MethodView.vue';
import BetSlipSimulatorModal from '@/components/BetSlipSimulatorModal.vue';

const store = useOddsStore();

onMounted(() => {
  store.initFirebaseSync();
});
</script>
