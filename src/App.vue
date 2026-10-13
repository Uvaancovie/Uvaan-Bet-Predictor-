<template>
  <div class="min-h-screen bg-[#0f1115] text-[#f1f3f7] flex flex-col antialiased">
    <!-- Header -->
    <NavigationHeader />

    <!-- Main Content -->
    <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-12">
      <AnalyzerView v-if="store.activeTab === 'analyzer'" />
      <PredictionsLogView v-else-if="store.activeTab === 'log'" />
      <StatsView v-else-if="store.activeTab === 'stats'" />
      <MethodView v-else-if="store.activeTab === 'method'" />
    </main>

    <!-- Always visible 18+ and Responsible Gambling footer strip -->
    <ResponsibleGamblingBanner />

    <!-- Clean toast notification -->
    <div
      v-if="store.toastMessage"
      class="fixed bottom-12 right-4 z-50 max-w-sm px-3.5 py-2.5 rounded-lg bg-[#1c1f26] border border-[#323744] text-xs text-[#f1f3f7] flex items-center justify-between gap-3 shadow-none"
    >
      <span>{{ store.toastMessage }}</span>
      <button
        @click="store.toastMessage = null"
        class="text-[#9aa1b2] hover:text-[#f1f3f7]"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOddsStore } from '@/stores/oddsStore';
import NavigationHeader from '@/components/NavigationHeader.vue';
import ResponsibleGamblingBanner from '@/components/ResponsibleGamblingBanner.vue';
import AnalyzerView from '@/components/AnalyzerView.vue';
import PredictionsLogView from '@/components/PredictionsLogView.vue';
import StatsView from '@/components/StatsView.vue';
import MethodView from '@/components/MethodView.vue';

const store = useOddsStore();
</script>
