<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Notice: Local data / sample data disclaimer -->
    <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-[#9aa1b2]">
      <div>
        <span class="text-[#f1f3f7] font-medium">Local data only. Not a verified track record.</span>
        <span class="block sm:inline sm:ml-1 text-[#656c7d]">All figures calculated from local browser storage.</span>
      </div>
      <span class="text-[11px] font-mono text-[#9aa1b2] px-2 py-0.5 rounded bg-[#0f1115] border border-[#262a34]">
        sample data
      </span>
    </div>

    <!-- Four Top Cards: Hit rate, Brier score, Flat-stake ROI, Pending -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- 1. Hit Rate -->
      <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-1">
        <div class="text-xs text-[#9aa1b2]">Hit rate</div>
        <div class="text-xl sm:text-2xl font-medium text-[#f1f3f7] font-mono tabular-nums">
          {{ hitRatePercent }}
        </div>
        <div class="text-[11px] text-[#656c7d] font-mono">
          n = {{ sampleSize }} settled (sample data)
        </div>
      </div>

      <!-- 2. Brier Score -->
      <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-1">
        <div class="text-xs text-[#9aa1b2]">Brier score</div>
        <div class="text-xl sm:text-2xl font-medium text-[#f1f3f7] font-mono tabular-nums">
          {{ meanBrierScore }}
        </div>
        <div class="text-[11px] text-[#656c7d] font-mono">
          n = {{ sampleSize }} settled (sample data)
        </div>
      </div>

      <!-- 3. Flat-stake ROI -->
      <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-1">
        <div class="text-xs text-[#9aa1b2]">Flat-stake ROI</div>
        <div :class="['text-xl sm:text-2xl font-medium font-mono tabular-nums', roiValue >= 0 ? 'text-[#38bdf8]' : 'text-[#94a3b8]']">
          {{ roiFormatted }}
        </div>
        <div class="text-[11px] text-[#656c7d] font-mono">
          n = {{ sampleSize }} settled (sample data)
        </div>
      </div>

      <!-- 4. Pending -->
      <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-1">
        <div class="text-xs text-[#9aa1b2]">Pending matches</div>
        <div class="text-xl sm:text-2xl font-medium text-[#f1f3f7] font-mono tabular-nums">
          {{ store.pendingPredictions.length }}
        </div>
        <div class="text-[11px] text-[#656c7d] font-mono">
          n = {{ store.pendingPredictions.length }} awaiting kickoff
        </div>
      </div>
    </div>

    <!-- Charts Container: Calibration Chart & ROI Curve with visible losing stretches -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Calibration Chart (Chart.js) -->
      <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-[#262a34] pb-2">
          <div>
            <h2 class="text-xs font-medium text-[#f1f3f7]">Calibration Curve</h2>
            <div class="text-[10px] text-[#656c7d] font-mono">n = {{ sampleSize }} settled (sample data)</div>
          </div>
          <div class="flex items-center gap-3 text-[10px] text-[#9aa1b2]">
            <span class="flex items-center gap-1">
              <span class="w-2.5 h-0.5 bg-[#3b82f6]"></span> Model
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2.5 h-0.5 bg-[#64748b] border-t border-dashed"></span> Ideal
            </span>
          </div>
        </div>

        <div class="h-60 relative">
          <canvas ref="calibrationCanvas"></canvas>
        </div>

        <div class="text-[11px] text-[#9aa1b2] leading-relaxed pt-1">
          Observed hit rate across 10 probability buckets vs diagonal calibration line.
        </div>
      </div>

      <!-- Cumulative ROI Curve (Chart.js) with losing stretches clearly visible -->
      <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-[#262a34] pb-2">
          <div>
            <h2 class="text-xs font-medium text-[#f1f3f7]">Cumulative Return Curve (1-unit flat)</h2>
            <div class="text-[10px] text-[#656c7d] font-mono">n = {{ sampleSize }} settled (sample data)</div>
          </div>
          <div class="text-[10px] text-[#9aa1b2] font-mono">
            Net: <strong :class="totalPnlUnits >= 0 ? 'text-[#38bdf8]' : 'text-[#94a3b8]'">{{ totalPnlUnits >= 0 ? '+' : '' }}{{ totalPnlUnits.toFixed(2) }} u</strong>
          </div>
        </div>

        <div class="h-60 relative">
          <canvas ref="roiCanvas"></canvas>
        </div>

        <div class="text-[11px] text-[#9aa1b2] leading-relaxed pt-1">
          Downswings and drawdown periods represent normal mathematical variance under flat staking.
        </div>
      </div>
    </div>

    <!-- 10 Probability Buckets Matrix -->
    <div class="bg-[#16181e] border border-[#262a34] rounded-xl p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-[#262a34] pb-2">
        <h3 class="text-xs font-medium text-[#f1f3f7]">Calibration Buckets Breakdown</h3>
        <span class="text-[10px] text-[#656c7d] font-mono">n = {{ sampleSize }} settled (sample data)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono tabular-nums">
          <thead>
            <tr class="text-[10px] text-[#656c7d] uppercase border-b border-[#262a34]">
              <th class="py-1.5 font-normal">Bucket</th>
              <th class="py-1.5 text-right font-normal">Count (n)</th>
              <th class="py-1.5 text-right font-normal">Pred Avg</th>
              <th class="py-1.5 text-right font-normal">Observed Hit Rate</th>
              <th class="py-1.5 text-right font-normal">Calibration Gap</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#262a34]/40">
            <tr v-for="b in bucketsData" :key="b.bucketIndex">
              <td class="py-2 text-[#9aa1b2] font-sans">{{ b.label }}</td>
              <td class="py-2 text-right text-[#f1f3f7]">{{ b.count }}</td>
              <td class="py-2 text-right text-[#9aa1b2]">{{ (b.predictedAverage * 100).toFixed(1) }}%</td>
              <td class="py-2 text-right text-[#f1f3f7]">
                {{ b.count > 0 ? (b.actualHitRate * 100).toFixed(1) + '%' : '—' }}
              </td>
              <td class="py-2 text-right">
                <span v-if="b.count > 0" :class="Math.abs(b.diff) <= 0.05 ? 'text-[#38bdf8]' : 'text-[#94a3b8]'">
                  {{ b.diff > 0 ? '+' : '' }}{{ (b.diff * 100).toFixed(1) }}%
                </span>
                <span v-else class="text-[#656c7d]">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useOddsStore } from '@/stores/oddsStore';
import { flatRoi, calibrationBuckets } from '@/lib/odds';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const store = useOddsStore();
const calibrationCanvas = ref<HTMLCanvasElement | null>(null);
const roiCanvas = ref<HTMLCanvasElement | null>(null);

let calChartInstance: Chart | null = null;
let roiChartInstance: Chart | null = null;

const settled = computed(() => store.settledPredictions);
const sampleSize = computed(() => settled.value.length);

const wonCount = computed(() => settled.value.filter((p) => p.won).length);
const hitRatePercent = computed(() => {
  if (sampleSize.value === 0) return '0.0%';
  return `${((wonCount.value / sampleSize.value) * 100).toFixed(1)}%`;
});

const meanBrierScore = computed(() => {
  const scores = settled.value
    .map((p) => p.brierScore)
    .filter((s): s is number => s !== undefined);
  if (scores.length === 0) return '0.0000';
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(4);
});

const roiValue = computed(() => {
  const bets = settled.value
    .filter((p) => p.actualOutcome !== 'void')
    .map((p) => ({
      odds: p.selectedOdds,
      won: !!p.won,
      stake: 1,
    }));
  return flatRoi(bets);
});

const roiFormatted = computed(() => {
  const val = roiValue.value * 100;
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
});

const totalPnlUnits = computed(() => {
  return settled.value.reduce((acc, curr) => acc + (curr.pnlUnits ?? 0), 0);
});

const bucketsData = computed(() => {
  const items = settled.value.map((p) => ({
    predictedProb: p.selectedModelProb,
    won: !!p.won,
  }));
  return calibrationBuckets(items, 10);
});

function initCharts() {
  // Calibration Chart
  if (calibrationCanvas.value) {
    if (calChartInstance) calChartInstance.destroy();

    const buckets = bucketsData.value;
    const labels = buckets.map((b) => b.label);
    const modelHitRates = buckets.map((b) => (b.count > 0 ? Number((b.actualHitRate * 100).toFixed(1)) : null));
    const idealRates = buckets.map((b) => Number((b.predictedAverage * 100).toFixed(1)));

    calChartInstance = new Chart(calibrationCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Observed Hit Rate',
            data: modelHitRates,
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            pointRadius: 4,
            borderWidth: 2,
            spanGaps: true,
          },
          {
            label: 'Perfect Calibration',
            data: idealRates,
            borderColor: '#64748b',
            borderDash: [4, 4],
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#16181e',
            titleColor: '#f1f3f7',
            bodyColor: '#9aa1b2',
            borderColor: '#262a34',
            borderWidth: 1,
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: '#1e222b' },
            ticks: { color: '#656c7d', font: { size: 9, family: 'sans-serif' } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#1e222b' },
            ticks: {
              color: '#656c7d',
              font: { size: 9, family: 'sans-serif' },
              callback(val) {
                return `${val}%`;
              },
            },
          },
        },
      },
    });
  }

  // Cumulative ROI Curve
  if (roiCanvas.value) {
    if (roiChartInstance) roiChartInstance.destroy();

    let cumulative = 0;
    const pnlHistory = [0];
    const labels = ['Start'];

    settled.value.forEach((p, idx) => {
      cumulative += p.pnlUnits ?? 0;
      pnlHistory.push(Number(cumulative.toFixed(2)));
      labels.push(`#${idx + 1}`);
    });

    roiChartInstance = new Chart(roiCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Cumulative Units',
            data: pnlHistory,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            borderWidth: 2,
            pointRadius: 2,
            fill: true,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#16181e',
            titleColor: '#f1f3f7',
            bodyColor: '#9aa1b2',
            borderColor: '#262a34',
            borderWidth: 1,
            callbacks: {
              label(context) {
                return `${context.parsed.y} units`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: '#1e222b' },
            ticks: { color: '#656c7d', font: { size: 9, family: 'sans-serif' } },
          },
          y: {
            grid: { color: '#1e222b' },
            ticks: {
              color: '#656c7d',
              font: { size: 9, family: 'sans-serif' },
              callback(val) {
                return `${val} u`;
              },
            },
          },
        },
      },
    });
  }
}

onMounted(() => {
  nextTick(initCharts);
});

watch(
  () => settled.value,
  () => {
    nextTick(initCharts);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (calChartInstance) calChartInstance.destroy();
  if (roiChartInstance) roiChartInstance.destroy();
});
</script>
