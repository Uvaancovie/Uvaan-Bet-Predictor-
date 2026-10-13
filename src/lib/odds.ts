/**
 * Pure odds and probability calculation functions for Odds Lab.
 * All odds are represented as integer cents (e.g. 210 = 2.10 decimal odds).
 */

export interface BetRecord {
  /** Integer odds (e.g. 210 for 2.10) or decimal odds */
  odds: number;
  /** Whether the bet won */
  won: boolean;
  /** Stake (defaults to 1 unit) */
  stake?: number;
}

export interface CalibrationItem {
  /** Predicted probability between 0 and 1 */
  predictedProb: number;
  /** Whether the event actually occurred */
  won: boolean;
}

export interface CalibrationBucket {
  bucketIndex: number;
  min: number;
  max: number;
  label: string;
  count: number;
  predictedAverage: number;
  actualHitRate: number;
  diff: number;
}

export interface ModelPredictionInput {
  odds: [number, number, number]; // [homeOdds, drawOdds, awayOdds] as integer cents
  sentiment?: {
    home?: number; // -1 to +1
    away?: number; // -1 to +1
  };
  goals?: {
    homeExpected?: number;
    awayExpected?: number;
  };
}

export interface ModelPredictionOutput {
  home: number;
  draw: number;
  away: number;
  modelVersion: string;
}

export interface ParsedMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  rawText?: string;
}

/**
 * 1. impliedProb(odds) = 1 / (odds / 100)
 * Calculates the raw implied probability from integer decimal odds.
 */
export function impliedProb(odds: number): number {
  if (odds <= 0) return 0;
  const decimalOdds = odds >= 10 ? odds / 100 : odds;
  return 1 / decimalOdds;
}

/**
 * 2. overround(oddsArray) = sum of implied probs
 * Represents the total bookmaker margin / book percentage (e.g. 1.0481 = 4.81% margin).
 */
export function overround(oddsArray: number[]): number {
  if (!oddsArray || oddsArray.length === 0) return 0;
  return oddsArray.reduce((acc, odds) => acc + impliedProb(odds), 0);
}

/**
 * 3. fairProbs(oddsArray) = each implied prob / overround
 * De-vigs the market using proportional normalization so fair probabilities sum to 1.
 */
export function fairProbs(oddsArray: number[]): number[] {
  const total = overround(oddsArray);
  if (total <= 0) return oddsArray.map(() => 0);
  return oddsArray.map((odds) => impliedProb(odds) / total);
}

/**
 * 4. edge(modelProb, fairProb) = modelProb - fairProb
 * Difference between model estimated probability and the devigged fair market probability.
 */
export function edge(modelProb: number, fairProb: number): number {
  return modelProb - fairProb;
}

/**
 * 5. brier(probs, outcomeIndex) = sum over outcomes of (p - actual)^2
 * Proper scoring rule measuring probabilistic accuracy. Lower is better (0 = perfect).
 */
export function brier(probs: number[], outcomeIndex: number): number {
  if (!probs || probs.length === 0) return 0;
  return probs.reduce((sum, p, i) => {
    const actual = i === outcomeIndex ? 1 : 0;
    const diff = p - actual;
    return sum + diff * diff;
  }, 0);
}

/**
 * 6. flatRoi(bets) = (total returns - total stakes) / total stakes
 * Calculates return on investment under flat staking.
 */
export function flatRoi(bets: BetRecord[]): number {
  if (!bets || bets.length === 0) return 0;
  let totalStakes = 0;
  let totalReturns = 0;

  for (const bet of bets) {
    const stake = bet.stake !== undefined && bet.stake > 0 ? bet.stake : 1;
    const decimalOdds = bet.odds >= 10 ? bet.odds / 100 : bet.odds;
    totalStakes += stake;
    if (bet.won) {
      totalReturns += stake * decimalOdds;
    }
  }

  if (totalStakes === 0) return 0;
  return (totalReturns - totalStakes) / totalStakes;
}

/**
 * 7. calibrationBuckets(predictions) = 10 probability buckets,
 * predicted average vs actual hit rate.
 */
export function calibrationBuckets(
  predictions: CalibrationItem[],
  numBuckets = 10
): CalibrationBucket[] {
  const buckets: {
    items: CalibrationItem[];
    min: number;
    max: number;
    label: string;
  }[] = [];

  const step = 1 / numBuckets;
  for (let i = 0; i < numBuckets; i++) {
    const min = i * step;
    const max = (i + 1) * step;
    const label = `${Math.round(min * 100)}% - ${Math.round(max * 100)}%`;
    buckets.push({ items: [], min, max, label });
  }

  for (const p of predictions) {
    const prob = Math.max(0, Math.min(1, p.predictedProb));
    let idx = Math.floor(prob / step);
    if (idx >= numBuckets) idx = numBuckets - 1;
    buckets[idx].items.push(p);
  }

  return buckets.map((b, bucketIndex) => {
    const count = b.items.length;
    let predictedAverage = 0;
    let actualHitRate = 0;

    if (count > 0) {
      const sumPred = b.items.reduce((acc, curr) => acc + curr.predictedProb, 0);
      const wins = b.items.filter((curr) => curr.won).length;
      predictedAverage = sumPred / count;
      actualHitRate = wins / count;
    } else {
      predictedAverage = (b.min + b.max) / 2;
      actualHitRate = 0;
    }

    return {
      bucketIndex,
      min: b.min,
      max: b.max,
      label: b.label,
      count,
      predictedAverage,
      actualHitRate,
      diff: count > 0 ? actualHitRate - predictedAverage : 0,
    };
  });
}

/**
 * Swappable predictive model function.
 * Takes market odds, sentiment, and goal expectancies and outputs normalized
 * { home, draw, away, modelVersion } summing to 1.
 */
export function predict(input: ModelPredictionInput): ModelPredictionOutput {
  const modelVersion = 'odds-lab-v1.0-dirichlet-devig';
  const fair = fairProbs(input.odds);
  let [h, d, a] = fair;

  // Optional sentiment tilt (-0.05 to +0.05 max shift)
  if (input.sentiment) {
    const homeTilt = (input.sentiment.home ?? 0) * 0.03;
    const awayTilt = (input.sentiment.away ?? 0) * 0.03;
    h += homeTilt - awayTilt * 0.5;
    a += awayTilt - homeTilt * 0.5;
  }

  // Optional goals expectancy tilt
  if (input.goals) {
    const hExp = input.goals.homeExpected ?? 1.35;
    const aExp = input.goals.awayExpected ?? 1.1;
    const goalDiff = (hExp - aExp) * 0.04;
    h += goalDiff;
    a -= goalDiff;
  }

  // Bound to positive numbers
  h = Math.max(0.02, h);
  d = Math.max(0.02, d);
  a = Math.max(0.02, a);

  // Normalize so probabilities strictly sum to 1.0
  const sum = h + d + a;
  return {
    home: h / sum,
    draw: d / sum,
    away: a / sum,
    modelVersion,
  };
}

/**
 * Parses match slate line:
 * "Home v Away | league | kickoff ISO | homeOdds drawOdds awayOdds"
 * Example: "Sundowns v Pirates | PSL | 2026-10-18T15:30 | 210 340 360"
 */
export function parseSlateLine(line: string): ParsedMatch | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const parts = trimmed.split('|').map((p) => p.trim());
  if (parts.length < 4) return null;

  const teamsPart = parts[0];
  const league = parts[1];
  const kickoff = parts[2];
  const oddsPart = parts[3];

  let homeTeam = '';
  let awayTeam = '';

  if (teamsPart.includes(' v ')) {
    const [h, a] = teamsPart.split(' v ');
    homeTeam = h.trim();
    awayTeam = a.trim();
  } else if (teamsPart.includes(' vs ')) {
    const [h, a] = teamsPart.split(' vs ');
    homeTeam = h.trim();
    awayTeam = a.trim();
  } else if (teamsPart.includes(' - ')) {
    const [h, a] = teamsPart.split(' - ');
    homeTeam = h.trim();
    awayTeam = a.trim();
  } else {
    homeTeam = teamsPart;
    awayTeam = 'Opponent';
  }

  const oddsNumbers = oddsPart
    .split(/\s+/)
    .map((o) => parseFloat(o))
    .filter((n) => !isNaN(n));

  if (oddsNumbers.length < 3) return null;

  // Convert decimal to integer if user wrote 2.10 instead of 210
  const cleanOdds = oddsNumbers.slice(0, 3).map((val) => {
    return val < 10 ? Math.round(val * 100) : Math.round(val);
  });

  return {
    id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    homeTeam,
    awayTeam,
    league,
    kickoff,
    homeOdds: cleanOdds[0],
    drawOdds: cleanOdds[1],
    awayOdds: cleanOdds[2],
    rawText: line,
  };
}

export function parseSlate(text: string): ParsedMatch[] {
  const lines = text.split('\n');
  const results: ParsedMatch[] = [];
  for (const line of lines) {
    const match = parseSlateLine(line);
    if (match) results.push(match);
  }
  return results;
}

/**
 * Format helpers
 */
export function formatOdds(odds: number): string {
  const decimal = odds >= 10 ? odds / 100 : odds;
  return decimal.toFixed(2);
}

export function formatPercent(prob: number, decimals = 1): string {
  return `${(prob * 100).toFixed(decimals)}%`;
}

export function formatEdge(val: number, decimals = 1): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${(val * 100).toFixed(decimals)}%`;
}
