<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 class="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Import Match Slate
          </h2>
          <p class="text-xs text-zinc-400 mt-0.5">
            Paste one fixture per line using the standard pipe delimited schema
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          ✕
        </button>
      </div>

      <div class="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-xs space-y-1.5 font-mono text-zinc-300">
        <div class="text-[11px] font-sans font-semibold text-zinc-400 uppercase tracking-wider">
          Required Format
        </div>
        <p class="text-emerald-400 select-all">
          Home v Away | league | kickoff ISO | homeOdds drawOdds awayOdds
        </p>
        <div class="text-zinc-400 text-[11px] font-sans">
          Odds are integers (decimal × 100): <strong class="text-zinc-200">210 = 2.10</strong>, <strong class="text-zinc-200">340 = 3.40</strong>.
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-semibold text-zinc-300">
            Slate Text
          </label>
          <button
            type="button"
            @click="insertSampleSlate"
            class="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-mono"
          >
            + Load Sample PSL Slate
          </button>
        </div>
        <textarea
          v-model="slateText"
          rows="6"
          placeholder="Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360&#10;Chiefs v Stellenbosch | PSL | 2026-10-18T18:00 | 240 310 290"
          class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition"
        ></textarea>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/80 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleImport"
          :disabled="!slateText.trim()"
          class="px-5 py-2 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          Parse & Add to Analyzer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useOddsStore();
const slateText = ref('');

const samplePslSlate = `# South African Premier Soccer League Slate
Sundowns v Pirates | PSL | 2026-10-24T15:30 | 210 340 360
Chiefs v Stellenbosch | PSL | 2026-10-24T18:00 | 240 310 290
SuperSport v Cape Town City | PSL | 2026-10-25T15:00 | 225 315 330
Sekhukhune v AmaZulu | PSL | 2026-10-25T17:30 | 250 300 285`;

function insertSampleSlate() {
  slateText.value = samplePslSlate;
}

function handleImport() {
  if (!slateText.value.trim()) return;
  const count = store.importSlate(slateText.value);
  if (count > 0) {
    slateText.value = '';
    emit('close');
  }
}
</script>
