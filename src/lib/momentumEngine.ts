/**
 * Momentum Engine and Dixon-Coles Bivariate Poisson Quantitative Match Prediction.
 * Combines rolling exponentially weighted form, H2H statistics, and goal distributions.
 */

import { getTeamRecentMatches, getHeadToHead, type FormMatch, type HeadToHeadSummary } from './historicalData';
import { fairProbs, impliedProb } from './odds';

export interface TeamMomentum {
  teamName: string;
  momentumScore: number; // 0 to 100
  trend: 'surging' | 'stable' | 'declining';
  trendDelta: number; // e.g. +8.2 or -4.5
  recentMatches: FormMatch[];
  cleanSheetRate: number; // 0 - 100 %
  failToScoreRate: number; // 0 - 100 %
  avgGoalsScored5: number;
  avgGoalsConceded5: number;
  recentPointsEarned: number; // out of 15
}

export interface ScorelineProb {
  score: string;
  homeScore: number;
  awayScore: number;
  probability: number; // 0 - 1
  percent: string; // e.g. "14.2%"
}

export interface QuantitativePrediction {
  homeTeam: string;
  awayTeam: string;
  lambdaHome: number;
  lambdaAway: number;
  
  // Model probabilities (sums to 1.0)
  homeProb: number;
  drawProb: number;
  awayProb: number;

  // Market fair probabilities
  fairHomeProb: number;
  fairDrawProb: number;
  fairAwayProb: number;

  // Edges (model - fair)
  edgeHome: number;
  edgeDraw: number;
  edgeAway: number;

  // Best value bet
  recommendedOutcome: 'home' | 'draw' | 'away';
  recommendedEdge: number;
  hasPositiveEdge: boolean;

  // Derivative markets
  bttsProb: number;      // Both Teams to Score Yes (0 - 1)
  over25Prob: number;    // Over 2.5 Goals (0 - 1)
  under25Prob: number;   // Under 2.5 Goals (0 - 1)

  // Top exact scorelines
  topScorelines: ScorelineProb[];

  // Explanatory breakdown
  homeMomentum: TeamMomentum;
  awayMomentum: TeamMomentum;
  momentumDiff: number; // home - away
  h2hSummary: HeadToHeadSummary;
  momentumTiltExplanation: string;
}

/**
 * Calculates a 0-100 Momentum Score for a team based on exponentially decayed recent performances.
 */
export function calculateTeamMomentum(teamName: string, league = 'League'): TeamMomentum {
  const matches = getTeamRecentMatches(teamName, league).slice(0, 5);
  // Recency weights: match 0 (newest) has weight 1.0, match 4 (oldest) has weight 0.40
  const weights = [1.0, 0.85, 0.70, 0.55, 0.40];
  const maxPossibleSingle = 3.0 + (3 * 0.25) + 0.3; // 3 pts + 3 goal diff + clean sheet ≈ 4.05

  let weightedPoints = 0;
  let totalWeight = 0;
  let pointsSum = 0;
  let cleanSheets = 0;
  let failedToScore = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  matches.forEach((m, idx) => {
    const w = weights[idx] ?? 0.4;
    totalWeight += w;

    let pts = 0;
    if (m.result === 'W') pts = 3;
    else if (m.result === 'D') pts = 1;
    else pts = 0;

    pointsSum += pts;

    const diff = m.teamScore - m.opponentScore;
    const diffBonus = Math.max(-1.0, Math.min(1.0, diff * 0.25));
    const cleanBonus = m.opponentScore === 0 ? 0.3 : 0;
    const awayMultiplier = m.venue === 'A' ? 1.15 : 1.0;

    const matchPerformance = Math.max(0, (pts + diffBonus + cleanBonus) * awayMultiplier);
    weightedPoints += matchPerformance * w;

    if (m.opponentScore === 0) cleanSheets++;
    if (m.teamScore === 0) failedToScore++;
    goalsFor += m.teamScore;
    goalsAgainst += m.opponentScore;
  });

  const count = matches.length || 1;
  const theoreticalMax = totalWeight * maxPossibleSingle * 1.15;
  const rawScore = (weightedPoints / theoreticalMax) * 100;
  // Bound between 15 and 95
  const momentumScore = Math.round(Math.max(18, Math.min(94, rawScore)));

  // Calculate trend comparing first 2 matches (newest) vs older matches
  const recentSlice = matches.slice(0, 2);
  const olderSlice = matches.slice(2);
  const recentAvgPts = recentSlice.length ? recentSlice.reduce((s, m) => s + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0) / recentSlice.length : 1;
  const olderAvgPts = olderSlice.length ? olderSlice.reduce((s, m) => s + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0) / olderSlice.length : 1;
  const trendDelta = Number(((recentAvgPts - olderAvgPts) * 33.3).toFixed(1));

  let trend: 'surging' | 'stable' | 'declining' = 'stable';
  if (trendDelta >= 8) trend = 'surging';
  else if (trendDelta <= -8) trend = 'declining';

  return {
    teamName,
    momentumScore,
    trend,
    trendDelta,
    recentMatches: matches,
    cleanSheetRate: Math.round((cleanSheets / count) * 100),
    failToScoreRate: Math.round((failedToScore / count) * 100),
    avgGoalsScored5: Number((goalsFor / count).toFixed(2)),
    avgGoalsConceded5: Number((goalsAgainst / count).toFixed(2)),
    recentPointsEarned: pointsSum,
  };
}

/**
 * Factorial helper for Poisson distribution.
 */
const FACTORIALS: number[] = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];
function factorial(n: number): number {
  if (n <= 1) return 1;
  if (n < FACTORIALS.length) return FACTORIALS[n];
  let res = FACTORIALS[FACTORIALS.length - 1];
  for (let i = FACTORIALS.length; i <= n; i++) res *= i;
  return res;
}

/**
 * Pure Poisson probability P(k; lambda) = (lambda^k * e^-lambda) / k!
 */
function poissonProb(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Dixon-Coles tau factor for low scores to calibrate interdependence of low goals.
 * Parameter rho typically around -0.11 for modern professional leagues.
 */
function dixonColesTau(x: number, y: number, lambdaH: number, lambdaA: number, rho = -0.12): number {
  if (x === 0 && y === 0) return 1 - (lambdaH * lambdaA * rho);
  if (x === 0 && y === 1) return 1 + (lambdaH * rho);
  if (x === 1 && y === 0) return 1 + (lambdaA * rho);
  if (x === 1 && y === 1) return 1 - rho;
  return 1.0;
}

/**
 * Synthesizes quantitative model prediction combining:
 * 1. Market Devigged Fair Baseline
 * 2. Bivariate Dixon-Coles Poisson Distribution
 * 3. 5-Match Exponentially Decayed Momentum Differential
 * 4. Head-to-Head Win History Anchor
 */
export function generateQuantitativePrediction(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  odds: [number, number, number]; // [H, D, A] in integer cents
  homeExpGoals?: number;
  awayExpGoals?: number;
}): QuantitativePrediction {
  const { homeTeam, awayTeam, league, odds } = params;

  // 1. Devigged market probabilities
  const [fairHome, fairDraw, fairAway] = fairProbs(odds);

  // 2. Momentum analysis
  const homeMom = calculateTeamMomentum(homeTeam, league);
  const awayMom = calculateTeamMomentum(awayTeam, league);
  const momDiff = homeMom.momentumScore - awayMom.momentumScore;

  // 3. Head-to-Head history
  const h2h = getHeadToHead(homeTeam, awayTeam, league);

  // 4. Expected goals (lambda) calculation
  // Start from baseline expected goals or estimate from momentum + form
  let baseLambdaH = params.homeExpGoals ?? (1.35 + (homeMom.avgGoalsScored5 - 1.2) * 0.35 + (awayMom.avgGoalsConceded5 - 1.1) * 0.25);
  let baseLambdaA = params.awayExpGoals ?? (1.05 + (awayMom.avgGoalsScored5 - 1.1) * 0.35 + (homeMom.avgGoalsConceded5 - 1.0) * 0.25);

  // Tilt lambdas slightly by momentum differential (-0.25 to +0.25 goal edge)
  const momGoalTilt = (momDiff / 100) * 0.35;
  baseLambdaH = Math.max(0.4, Number((baseLambdaH + momGoalTilt * 0.6).toFixed(2)));
  baseLambdaA = Math.max(0.3, Number((baseLambdaA - momGoalTilt * 0.4).toFixed(2)));

  // 5. Dixon-Coles Bivariate Poisson Matrix (0 to 6 goals)
  const maxGoals = 6;
  const scoreGrid: { h: number; a: number; prob: number }[] = [];
  let poissonHomeSum = 0;
  let poissonDrawSum = 0;
  let poissonAwaySum = 0;
  let bttsSum = 0;
  let over25Sum = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const pH = poissonProb(h, baseLambdaH);
      const pA = poissonProb(a, baseLambdaA);
      const tau = dixonColesTau(h, a, baseLambdaH, baseLambdaA);
      const jointProb = Math.max(0, pH * pA * tau);

      scoreGrid.push({ h, a, prob: jointProb });

      if (h > a) poissonHomeSum += jointProb;
      else if (h === a) poissonDrawSum += jointProb;
      else poissonAwaySum += jointProb;

      if (h > 0 && a > 0) bttsSum += jointProb;
      if (h + a > 2.5) over25Sum += jointProb;
    }
  }

  // Normalize Poisson outcomes to 1.0
  const totalPois = poissonHomeSum + poissonDrawSum + poissonAwaySum || 1;
  const nPoisH = poissonHomeSum / totalPois;
  const nPoisD = poissonDrawSum / totalPois;
  const nPoisA = poissonAwaySum / totalPois;

  // 6. Blend Poisson with Market Devig & Momentum + H2H Tilt
  // Weights: 45% Market Baseline (Efficient market hypothesis) + 40% Dixon-Coles Poisson + 15% Momentum & H2H Tilt
  const h2hHomeEdge = h2h.totalPlayed >= 3 ? (h2h.homeWinPct - h2h.awayWinPct) / 200 : 0;
  const momProbShift = (momDiff / 100) * 0.08 + (h2hHomeEdge * 0.04);

  let rawModelH = (fairHome * 0.45) + (nPoisH * 0.40) + (fairHome + momProbShift) * 0.15;
  let rawModelA = (fairAway * 0.45) + (nPoisA * 0.40) + (fairAway - momProbShift) * 0.15;
  let rawModelD = (fairDraw * 0.50) + (nPoisD * 0.50);

  // Guarantee minimum safety bound
  rawModelH = Math.max(0.04, rawModelH);
  rawModelD = Math.max(0.04, rawModelD);
  rawModelA = Math.max(0.04, rawModelA);

  const modelSum = rawModelH + rawModelD + rawModelA;
  const homeProb = rawModelH / modelSum;
  const drawProb = rawModelD / modelSum;
  const awayProb = rawModelA / modelSum;

  // 7. Edges vs Fair Market
  const edgeHome = homeProb - fairHome;
  const edgeDraw = drawProb - fairDraw;
  const edgeAway = awayProb - fairAway;

  // Find best value
  let recommendedOutcome: 'home' | 'draw' | 'away' = 'home';
  let recommendedEdge = edgeHome;
  if (edgeDraw > recommendedEdge) {
    recommendedOutcome = 'draw';
    recommendedEdge = edgeDraw;
  }
  if (edgeAway > recommendedEdge) {
    recommendedOutcome = 'away';
    recommendedEdge = edgeAway;
  }

  // Top scorelines
  const sortedScores = [...scoreGrid]
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 5)
    .map((s) => ({
      score: `${s.h} - ${s.a}`,
      homeScore: s.h,
      awayScore: s.a,
      probability: Number((s.prob / totalPois).toFixed(4)),
      percent: `${((s.prob / totalPois) * 100).toFixed(1)}%`,
    }));

  // Human-readable narrative explanation
  let explanation = '';
  if (Math.abs(momDiff) >= 12) {
    const higherTeam = momDiff > 0 ? homeTeam : awayTeam;
    const lowerTeam = momDiff > 0 ? awayTeam : homeTeam;
    const diffVal = Math.abs(momDiff);
    explanation = `${higherTeam} holds a +${diffVal} pt momentum edge over ${lowerTeam} (${homeMom.momentumScore} vs ${awayMom.momentumScore}), driven by stronger rolling goal supremacy and recent points. `;
  } else {
    explanation = `Momentum between ${homeTeam} (${homeMom.momentumScore} pts) and ${awayTeam} (${awayMom.momentumScore} pts) is closely matched. `;
  }

  if (h2h.totalPlayed >= 3) {
    explanation += `In the last ${h2h.totalPlayed} head-to-head meetings, ${homeTeam} won ${h2h.homeWins}, ${awayTeam} won ${h2h.awayWins}, with ${h2h.draws} draws (BTTS ${h2h.bttsPct}%).`;
  }

  return {
    homeTeam,
    awayTeam,
    lambdaHome: baseLambdaH,
    lambdaAway: baseLambdaA,
    homeProb,
    drawProb,
    awayProb,
    fairHomeProb: fairHome,
    fairDrawProb: fairDraw,
    fairAwayProb: fairAway,
    edgeHome,
    edgeDraw,
    edgeAway,
    recommendedOutcome,
    recommendedEdge,
    hasPositiveEdge: recommendedEdge >= 0.02,
    bttsProb: Math.min(0.92, Math.max(0.18, (bttsSum / totalPois + (h2h.bttsPct / 100)) / 2)),
    over25Prob: Math.min(0.88, Math.max(0.18, (over25Sum / totalPois + (h2h.over25Pct / 100)) / 2)),
    under25Prob: 1 - Math.min(0.88, Math.max(0.18, (over25Sum / totalPois + (h2h.over25Pct / 100)) / 2)),
    topScorelines: sortedScores,
    homeMomentum: homeMom,
    awayMomentum: awayMom,
    momentumDiff: momDiff,
    h2hSummary: h2h,
    momentumTiltExplanation: explanation.trim(),
  };
}
