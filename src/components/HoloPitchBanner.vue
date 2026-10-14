<template>
  <div class="relative w-full rounded-2xl bg-[#0c1017] border border-[#1e2638] overflow-hidden p-4 sm:p-6 mb-5 hud-bracket hud-glow">
    <!-- Subtle Grid background -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: linear-gradient(to right, #00f5ff 1px, transparent 1px), linear-gradient(to bottom, #00f5ff 1px, transparent 1px); background-size: 32px 32px;"></div>

    <!-- Glowing Holographic Wireframe Pitch SVG -->
    <div class="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-25 sm:opacity-35 pointer-events-none overflow-hidden flex items-center justify-end pr-2 sm:pr-8">
      <svg viewBox="0 0 400 240" class="w-full max-w-[340px] h-auto text-[#00f5ff]" fill="none" stroke="currentColor">
        <!-- Pitch boundary -->
        <rect x="20" y="20" width="360" height="200" rx="4" stroke-width="1.5" stroke-dasharray="4 2" />
        <!-- Center line & circle -->
        <line x1="200" y1="20" x2="200" y2="220" stroke-width="1.5" />
        <circle cx="200" cy="120" r="45" stroke-width="1.5" />
        <circle cx="200" cy="120" r="3" fill="currentColor" />
        <!-- Penalty boxes -->
        <rect x="20" y="60" width="60" height="120" stroke-width="1" />
        <rect x="20" y="85" width="25" height="70" stroke-width="1" />
        <rect x="320" y="60" width="60" height="120" stroke-width="1" />
        <rect x="355" y="85" width="25" height="70" stroke-width="1" />
        <!-- Corner arcs -->
        <path d="M 20 35 A 15 15 0 0 0 35 20" stroke-width="1" />
        <path d="M 380 35 A 15 15 0 0 1 365 20" stroke-width="1" />
        <path d="M 20 205 A 15 15 0 0 1 35 220" stroke-width="1" />
        <path d="M 380 205 A 15 15 0 0 0 365 220" stroke-width="1" />
        <!-- Tactical nodes -->
        <circle cx="120" cy="90" r="4" fill="#00f5d4" class="animate-pulse" />
        <circle cx="160" cy="150" r="4" fill="#00f5d4" />
        <circle cx="280" cy="80" r="4" fill="#f43f5e" class="animate-pulse" />
        <circle cx="240" cy="140" r="4" fill="#f43f5e" />
        <!-- Trajectory lines -->
        <line x1="120" y1="90" x2="200" y2="120" stroke="#00f5d4" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6" />
        <line x1="280" y1="80" x2="200" y2="120" stroke="#f43f5e" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6" />
      </svg>
    </div>

    <!-- Telemetry Content -->
    <div class="relative z-10 max-w-xl space-y-2">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono tracking-wider font-semibold uppercase bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-ping"></span>
          MARK VII // AI PREDICTOR
        </span>
        <span class="text-[10px] font-mono text-[#56647a]">
          SYS: 0076-EXP • RADAR_SYNC: ONLINE
        </span>
      </div>

      <h1 class="text-base sm:text-xl font-bold tracking-tight text-[#f0f4fc]">
        Quantum Probability & Live Fixture Radar
      </h1>

      <p class="text-xs text-[#8d9bb0] leading-relaxed max-w-md">
        Live odds telemetry streaming from The-Odds-API & cached via Firestore. Real-time implied probabilities, fair de-vigging, and divergence detection.
      </p>

      <!-- Real-time HUD badges -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#8d9bb0]">
        <div class="flex items-center gap-1.5 bg-[#080a0f] px-2.5 py-1 rounded border border-[#1e2638]">
          <span class="text-[#00f5ff]">●</span>
          <span>QUOTA: {{ store.requestsRemaining ?? 498 }}/500</span>
        </div>
        <div class="flex items-center gap-1.5 bg-[#080a0f] px-2.5 py-1 rounded border border-[#1e2638]">
          <span class="text-[#00f5d4]">⚡</span>
          <span>CACHE: {{ store.isLiveCached ? 'FIRESTORE' : 'STREAMING' }}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-[#080a0f] px-2.5 py-1 rounded border border-[#1e2638]">
          <span class="text-[#38bdf8]">⧖</span>
          <span>MODEL: DIRICHLET_DEVIG_v1</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOddsStore } from '@/stores/oddsStore';
const store = useOddsStore();
</script>
