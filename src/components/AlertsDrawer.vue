<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
    <div class="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-slideLeft">
      <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 class="font-bold text-zinc-100 text-sm">Real-time Price Alerts</h2>
          <span v-if="store.unreadAlertsCount > 0" class="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {{ store.unreadAlertsCount }} new
          </span>
        </div>
        <button
          @click="$emit('close')"
          class="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          ✕
        </button>
      </div>

      <!-- Controls bar -->
      <div class="p-3 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
        <button
          @click="store.simulateOddsShift()"
          class="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg flex items-center gap-1.5 transition text-[11px]"
        >
          <span>⚡</span>
          <span>Simulate Odds Drift</span>
        </button>

        <button
          v-if="!store.notificationsEnabled"
          @click="store.requestNotificationPermission()"
          class="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold rounded-lg transition text-[11px]"
        >
          Enable Push
        </button>
        <span v-else class="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
          ✓ Push Active
        </span>
      </div>

      <!-- Alert list -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="store.alerts.length === 0" class="text-center py-12 text-zinc-500 text-xs">
          <div class="text-2xl mb-2">🔔</div>
          <p class="font-medium text-zinc-400">No price alerts yet</p>
          <p class="mt-1 text-zinc-600">
            Click "Simulate Odds Drift" to test real-time market movements and notifications.
          </p>
        </div>

        <div
          v-for="alert in store.alerts"
          :key="alert.id"
          class="p-3 bg-zinc-950 border border-zinc-800/90 rounded-xl space-y-1.5 hover:border-zinc-700 transition"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-zinc-200">{{ alert.matchName }}</span>
            <span class="text-[10px] text-zinc-500 font-mono">{{ alert.timestamp }}</span>
          </div>

          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-zinc-400 capitalize">
              Pick: <strong class="text-zinc-200">{{ alert.outcome }}</strong>
            </span>
            <div class="flex items-center gap-2">
              <span class="text-zinc-500 line-through">
                {{ (alert.oldOdds / 100).toFixed(2) }}
              </span>
              <span>→</span>
              <span class="font-bold text-emerald-400">
                {{ (alert.newOdds / 100).toFixed(2) }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-900">
            <span class="text-zinc-400">Emergent Edge:</span>
            <span :class="['font-mono font-bold', alert.edge > 0 ? 'text-emerald-400' : 'text-zinc-400']">
              {{ alert.edge > 0 ? '+' : '' }}{{ (alert.edge * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <div v-if="store.alerts.length > 0" class="p-3 border-t border-zinc-800 text-center">
        <button
          @click="store.clearAllAlerts()"
          class="text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          Clear alert history
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOddsStore } from '@/stores/oddsStore';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const store = useOddsStore();
</script>
