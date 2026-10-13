import { describe, it, expect } from 'vitest';
import {
  impliedProb,
  overround,
  fairProbs,
  edge,
  brier,
  flatRoi,
  calibrationBuckets,
  predict,
  parseSlateLine,
  parseSlate,
} from './odds';

describe('odds.ts pure functions & exact test values', () => {
  const odds = [210, 340, 360];

  it('calculates implied probabilities correctly for 210/340/360', () => {
    const h = impliedProb(210);
    const d = impliedProb(340);
    const a = impliedProb(360);

    expect(Number(h.toFixed(4))).toBe(0.4762);
    expect(Number(d.toFixed(4))).toBe(0.2941);
    expect(Number(a.toFixed(4))).toBe(0.2778);
  });

  it('calculates overround correctly for 210/340/360 -> 1.0481 (4.81% margin)', () => {
    const total = overround(odds);
    expect(Number(total.toFixed(4))).toBe(1.0481);
    const margin = total - 1;
    expect(Number((margin * 100).toFixed(2))).toBe(4.81);
  });

  it('calculates fair probabilities correctly for 210/340/360 -> 0.4543/0.2806/0.2650 and sums to 1', () => {
    const fair = fairProbs(odds);
    expect(fair).toHaveLength(3);
    expect(Number(fair[0].toFixed(4))).toBe(0.4543);
    expect(Number(fair[1].toFixed(4))).toBe(0.2806);
    expect(Number(fair[2].toFixed(4))).toBe(0.2650);

    const sum = fair.reduce((a, b) => a + b, 0);
    expect(Number(sum.toFixed(6))).toBe(1.0);
  });

  it('calculates edge correctly: Model home 0.50 vs fair 0.4543 -> +0.0457', () => {
    const fairHome = 0.4543;
    const modelHome = 0.5;
    const modelEdge = edge(modelHome, fairHome);
    expect(Number(modelEdge.toFixed(4))).toBe(0.0457);
  });

  it('calculates Brier score correctly: (0.50, 0.25, 0.25) with outcome home (0) = 0.375', () => {
    const score = brier([0.5, 0.25, 0.25], 0);
    expect(score).toBe(0.375);
  });

  it('calculates flat ROI correctly: Flat 1-unit bets at 2.10 (win), 3.40 (loss), 1.90 (win) -> ROI +33.3%', () => {
    const bets = [
      { odds: 210, won: true, stake: 1 },
      { odds: 340, won: false, stake: 1 },
      { odds: 190, won: true, stake: 1 },
    ];
    const roi = flatRoi(bets);
    expect(Number((roi * 100).toFixed(1))).toBe(33.3);
  });

  it('groups predictions into 10 calibration buckets', () => {
    const preds = [
      { predictedProb: 0.15, won: false },
      { predictedProb: 0.18, won: true },
      { predictedProb: 0.45, won: true },
      { predictedProb: 0.82, won: true },
    ];
    const buckets = calibrationBuckets(preds, 10);
    expect(buckets).toHaveLength(10);

    // Bucket 1 (10% - 20%) has 2 items
    expect(buckets[1].count).toBe(2);
    expect(buckets[1].actualHitRate).toBe(0.5);
    expect(buckets[1].predictedAverage).toBeCloseTo(0.165, 3);

    // Bucket 4 (40% - 50%) has 1 item
    expect(buckets[4].count).toBe(1);
    expect(buckets[4].actualHitRate).toBe(1.0);

    // Bucket 8 (80% - 90%) has 1 item
    expect(buckets[8].count).toBe(1);
    expect(buckets[8].actualHitRate).toBe(1.0);
  });

  it('predict model returns valid normalized probabilities summing to 1', () => {
    const res = predict({ odds: [210, 340, 360] });
    expect(res.home + res.draw + res.away).toBeCloseTo(1.0, 5);
    expect(res.modelVersion).toBeDefined();
  });

  it('parses match slate lines properly', () => {
    const line = 'Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360';
    const match = parseSlateLine(line);
    expect(match).not.toBeNull();
    expect(match?.homeTeam).toBe('Sundowns');
    expect(match?.awayTeam).toBe('Pirates');
    expect(match?.league).toBe('PSL');
    expect(match?.kickoff).toBe('2026-10-18T15:30');
    expect(match?.homeOdds).toBe(210);
    expect(match?.drawOdds).toBe(340);
    expect(match?.awayOdds).toBe(360);
  });

  it('parses multi-line slates including comments and whitespace', () => {
    const text = `
      # Weekend PSL slate
      Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360
      Chiefs v Stellenbosch | PSL | 2026-10-18T18:00 | 240 310 290
    `;
    const matches = parseSlate(text);
    expect(matches).toHaveLength(2);
    expect(matches[0].homeTeam).toBe('Sundowns');
    expect(matches[1].homeTeam).toBe('Chiefs');
  });
});
