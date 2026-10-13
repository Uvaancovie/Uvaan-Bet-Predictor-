import { defineStore } from 'pinia';
import {
  impliedProb,
  overround,
  fairProbs,
  edge,
  brier,
  predict,
  parseSlate,
  type ModelPredictionInput,
} from '@/lib/odds';
import type {
  MatchAnalysis,
  PredictionRecord,
  OutcomeType,
  SettlementResult,
  PriceAlert,
} from '@/types';

const STORAGE_KEY = 'odds_lab_store_v1';

// Seed upcoming matches
const INITIAL_MATCHES: MatchAnalysis[] = [
  {
    id: 'm-psl-1',
    homeTeam: 'Mamelodi Sundowns',
    awayTeam: 'Orlando Pirates',
    league: 'PSL',
    kickoff: '2026-10-18T15:30',
    homeOdds: 210,
    drawOdds: 340,
    awayOdds: 360,
    sentimentHome: 0.3,
    sentimentAway: -0.1,
    homeExpGoals: 1.6,
    awayExpGoals: 0.9,
    priceAlertActive: true,
    alertEdgeThreshold: 0.03,
  },
  {
    id: 'm-psl-2',
    homeTeam: 'Kaizer Chiefs',
    awayTeam: 'Stellenbosch FC',
    league: 'PSL',
    kickoff: '2026-10-18T18:00',
    homeOdds: 245,
    drawOdds: 310,
    awayOdds: 295,
    sentimentHome: 0.0,
    sentimentAway: 0.2,
    homeExpGoals: 1.2,
    awayExpGoals: 1.15,
    priceAlertActive: false,
    alertEdgeThreshold: 0.04,
  },
  {
    id: 'm-psl-3',
    homeTeam: 'SuperSport United',
    awayTeam: 'Cape Town City',
    league: 'PSL',
    kickoff: '2026-10-19T15:00',
    homeOdds: 220,
    drawOdds: 315,
    awayOdds: 340,
    sentimentHome: -0.2,
    sentimentAway: 0.0,
    homeExpGoals: 1.1,
    awayExpGoals: 1.0,
    priceAlertActive: true,
    alertEdgeThreshold: 0.02,
  },
  {
    id: 'm-epl-1',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    kickoff: '2026-10-24T17:30',
    homeOdds: 185,
    drawOdds: 375,
    awayOdds: 420,
    sentimentHome: 0.4,
    sentimentAway: 0.1,
    homeExpGoals: 1.9,
    awayExpGoals: 1.05,
    priceAlertActive: false,
    alertEdgeThreshold: 0.03,
  },
  {
    id: 'm-caf-1',
    homeTeam: 'Al Ahly',
    awayTeam: 'Esperance ST',
    league: 'CAF Champions League',
    kickoff: '2026-10-25T20:00',
    homeOdds: 170,
    drawOdds: 350,
    awayOdds: 500,
    sentimentHome: 0.2,
    sentimentAway: -0.2,
    homeExpGoals: 1.75,
    awayExpGoals: 0.7,
    priceAlertActive: false,
    alertEdgeThreshold: 0.03,
  },
];

// Seed settled predictions for instant calibration and statistics demonstration
const INITIAL_PREDICTIONS: PredictionRecord[] = [
  {
    id: 'pred-101',
    matchId: 'seed-past-1',
    homeTeam: 'Golden Arrows',
    awayTeam: 'Richards Bay',
    league: 'PSL',
    kickoff: '2026-10-02T15:00',
    createdAt: '2026-10-01T12:00:00Z',
    oddsSnapshot: { home: 210, draw: 320, away: 370 },
    fairSnapshot: { home: 0.457, draw: 0.300, away: 0.243 },
    modelSnapshot: { home: 0.505, draw: 0.285, away: 0.210, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: 0.048, draw: -0.015, away: -0.033 },
    selectedOutcome: 'home',
    selectedOdds: 210,
    selectedModelProb: 0.505,
    selectedFairProb: 0.457,
    selectedEdge: 0.048,
    settled: true,
    actualOutcome: 'home',
    actualScore: '2 - 0',
    settledAt: '2026-10-02T17:15:00Z',
    won: true,
    pnlUnits: 1.10, // 2.10 - 1
    brierScore: brier([0.505, 0.285, 0.210], 0),
  },
  {
    id: 'pred-102',
    matchId: 'seed-past-2',
    homeTeam: 'Chippa United',
    awayTeam: 'Polokwane City',
    league: 'PSL',
    kickoff: '2026-10-03T15:00',
    createdAt: '2026-10-02T10:00:00Z',
    oddsSnapshot: { home: 280, draw: 300, away: 265 },
    fairSnapshot: { home: 0.339, draw: 0.317, away: 0.344 },
    modelSnapshot: { home: 0.290, draw: 0.330, away: 0.380, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: -0.049, draw: 0.013, away: 0.036 },
    selectedOutcome: 'away',
    selectedOdds: 265,
    selectedModelProb: 0.380,
    selectedFairProb: 0.344,
    selectedEdge: 0.036,
    settled: true,
    actualOutcome: 'draw',
    actualScore: '1 - 1',
    settledAt: '2026-10-03T17:10:00Z',
    won: false,
    pnlUnits: -1.00,
    brierScore: brier([0.290, 0.330, 0.380], 1),
  },
  {
    id: 'pred-103',
    matchId: 'seed-past-3',
    homeTeam: 'Royal AM',
    awayTeam: 'Sekhukhune Utd',
    league: 'PSL',
    kickoff: '2026-10-04T15:30',
    createdAt: '2026-10-03T11:00:00Z',
    oddsSnapshot: { home: 310, draw: 310, away: 235 },
    fairSnapshot: { home: 0.306, draw: 0.306, away: 0.388 },
    modelSnapshot: { home: 0.280, draw: 0.290, away: 0.430, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: -0.026, draw: -0.016, away: 0.042 },
    selectedOutcome: 'away',
    selectedOdds: 235,
    selectedModelProb: 0.430,
    selectedFairProb: 0.388,
    selectedEdge: 0.042,
    settled: true,
    actualOutcome: 'away',
    actualScore: '0 - 1',
    settledAt: '2026-10-04T17:40:00Z',
    won: true,
    pnlUnits: 1.35,
    brierScore: brier([0.280, 0.290, 0.430], 2),
  },
  {
    id: 'pred-104',
    matchId: 'seed-past-4',
    homeTeam: 'TS Galaxy',
    awayTeam: 'AmaZulu',
    league: 'PSL',
    kickoff: '2026-10-05T17:30',
    createdAt: '2026-10-04T16:00:00Z',
    oddsSnapshot: { home: 220, draw: 310, away: 350 },
    fairSnapshot: { home: 0.439, draw: 0.311, away: 0.250 },
    modelSnapshot: { home: 0.485, draw: 0.305, away: 0.210, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: 0.046, draw: -0.006, away: -0.040 },
    selectedOutcome: 'home',
    selectedOdds: 220,
    selectedModelProb: 0.485,
    selectedFairProb: 0.439,
    selectedEdge: 0.046,
    settled: true,
    actualOutcome: 'home',
    actualScore: '1 - 0',
    settledAt: '2026-10-05T19:35:00Z',
    won: true,
    pnlUnits: 1.20,
    brierScore: brier([0.485, 0.305, 0.210], 0),
  },
  {
    id: 'pred-105',
    matchId: 'seed-past-5',
    homeTeam: 'Newcastle',
    awayTeam: 'Brighton',
    league: 'Premier League',
    kickoff: '2026-10-06T14:00',
    createdAt: '2026-10-05T11:00:00Z',
    oddsSnapshot: { home: 200, draw: 370, away: 350 },
    fairSnapshot: { home: 0.474, draw: 0.256, away: 0.270 },
    modelSnapshot: { home: 0.520, draw: 0.260, away: 0.220, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: 0.046, draw: 0.004, away: -0.050 },
    selectedOutcome: 'home',
    selectedOdds: 200,
    selectedModelProb: 0.520,
    selectedFairProb: 0.474,
    selectedEdge: 0.046,
    settled: true,
    actualOutcome: 'away',
    actualScore: '1 - 2',
    settledAt: '2026-10-06T16:10:00Z',
    won: false,
    pnlUnits: -1.00,
    brierScore: brier([0.520, 0.260, 0.220], 2),
  },
  {
    id: 'pred-106',
    matchId: 'seed-past-6',
    homeTeam: 'Aston Villa',
    awayTeam: 'Fulham',
    league: 'Premier League',
    kickoff: '2026-10-07T16:30',
    createdAt: '2026-10-06T18:00:00Z',
    oddsSnapshot: { home: 185, draw: 380, away: 410 },
    fairSnapshot: { home: 0.513, draw: 0.249, away: 0.238 },
    modelSnapshot: { home: 0.550, draw: 0.245, away: 0.205, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: 0.037, draw: -0.004, away: -0.033 },
    selectedOutcome: 'home',
    selectedOdds: 185,
    selectedModelProb: 0.550,
    selectedFairProb: 0.513,
    selectedEdge: 0.037,
    settled: true,
    actualOutcome: 'home',
    actualScore: '3 - 1',
    settledAt: '2026-10-07T18:35:00Z',
    won: true,
    pnlUnits: 0.85,
    brierScore: brier([0.550, 0.245, 0.205], 0),
  },
  {
    id: 'pred-107',
    matchId: 'seed-past-7',
    homeTeam: 'Everton',
    awayTeam: 'Wolves',
    league: 'Premier League',
    kickoff: '2026-10-08T19:00',
    createdAt: '2026-10-07T14:00:00Z',
    oddsSnapshot: { home: 240, draw: 330, away: 300 },
    fairSnapshot: { home: 0.395, draw: 0.287, away: 0.318 },
    modelSnapshot: { home: 0.360, draw: 0.320, away: 0.320, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: -0.035, draw: 0.033, away: 0.002 },
    selectedOutcome: 'draw',
    selectedOdds: 330,
    selectedModelProb: 0.320,
    selectedFairProb: 0.287,
    selectedEdge: 0.033,
    settled: true,
    actualOutcome: 'draw',
    actualScore: '0 - 0',
    settledAt: '2026-10-08T21:05:00Z',
    won: true,
    pnlUnits: 2.30,
    brierScore: brier([0.360, 0.320, 0.320], 1),
  },
  {
    id: 'pred-108',
    matchId: 'seed-past-8',
    homeTeam: 'Juventus',
    awayTeam: 'Lazio',
    league: 'Serie A',
    kickoff: '2026-10-09T19:45',
    createdAt: '2026-10-08T15:00:00Z',
    oddsSnapshot: { home: 195, draw: 340, away: 410 },
    fairSnapshot: { home: 0.488, draw: 0.280, away: 0.232 },
    modelSnapshot: { home: 0.525, draw: 0.275, away: 0.200, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: 0.037, draw: -0.005, away: -0.032 },
    selectedOutcome: 'home',
    selectedOdds: 195,
    selectedModelProb: 0.525,
    selectedFairProb: 0.488,
    selectedEdge: 0.037,
    settled: true,
    actualOutcome: 'home',
    actualScore: '1 - 0',
    settledAt: '2026-10-09T21:55:00Z',
    won: true,
    pnlUnits: 0.95,
    brierScore: brier([0.525, 0.275, 0.200], 0),
  },
  {
    id: 'pred-109',
    matchId: 'seed-past-9',
    homeTeam: 'Roma',
    awayTeam: 'Inter',
    league: 'Serie A',
    kickoff: '2026-10-10T19:45',
    createdAt: '2026-10-09T12:00:00Z',
    oddsSnapshot: { home: 380, draw: 360, away: 195 },
    fairSnapshot: { home: 0.249, draw: 0.263, away: 0.488 },
    modelSnapshot: { home: 0.220, draw: 0.250, away: 0.530, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: -0.029, draw: -0.013, away: 0.042 },
    selectedOutcome: 'away',
    selectedOdds: 195,
    selectedModelProb: 0.530,
    selectedFairProb: 0.488,
    selectedEdge: 0.042,
    settled: true,
    actualOutcome: 'away',
    actualScore: '0 - 1',
    settledAt: '2026-10-10T21:50:00Z',
    won: true,
    pnlUnits: 0.95,
    brierScore: brier([0.220, 0.250, 0.530], 2),
  },
  {
    id: 'pred-110',
    matchId: 'seed-past-10',
    homeTeam: 'Bayer Leverkusen',
    awayTeam: 'Eintracht Frankfurt',
    league: 'Bundesliga',
    kickoff: '2026-10-11T14:30',
    createdAt: '2026-10-10T10:00:00Z',
    oddsSnapshot: { home: 155, draw: 460, away: 550 },
    fairSnapshot: { home: 0.618, draw: 0.208, away: 0.174 },
    modelSnapshot: { home: 0.660, draw: 0.190, away: 0.150, modelVersion: 'odds-lab-v1.0-dirichlet-devig' },
    edges: { home: 0.042, draw: -0.018, away: -0.024 },
    selectedOutcome: 'home',
    selectedOdds: 155,
    selectedModelProb: 0.660,
    selectedFairProb: 0.618,
    selectedEdge: 0.042,
    settled: true,
    actualOutcome: 'draw',
    actualScore: '2 - 2',
    settledAt: '2026-10-11T16:35:00Z',
    won: false,
    pnlUnits: -1.00,
    brierScore: brier([0.660, 0.190, 0.150], 1),
  },
];

export const useOddsStore = defineStore('odds', {
  state: () => {
    let loadedMatches = INITIAL_MATCHES;
    let loadedPredictions = INITIAL_PREDICTIONS;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.matches)) loadedMatches = parsed.matches;
        if (Array.isArray(parsed.predictions)) loadedPredictions = parsed.predictions;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data', e);
    }

    return {
      activeTab: 'analyzer' as 'analyzer' | 'log' | 'stats' | 'method',
      matches: loadedMatches,
      predictions: loadedPredictions,
      alerts: [] as PriceAlert[],
      notificationsEnabled: false,
      toastMessage: null as string | null,
      toastType: 'info' as 'info' | 'success' | 'warning' | 'error',
      searchQuery: '',
      selectedLeagueFilter: 'ALL',
      minEdgeFilter: 0, // e.g. 0% or 2%
    };
  },

  getters: {
    availableLeagues(state): string[] {
      const leagues = new Set<string>();
      state.matches.forEach((m) => leagues.add(m.league));
      state.predictions.forEach((p) => leagues.add(p.league));
      return Array.from(leagues).sort();
    },

    filteredMatches(state): MatchAnalysis[] {
      return state.matches.filter((m) => {
        if (state.selectedLeagueFilter !== 'ALL' && m.league !== state.selectedLeagueFilter) {
          return false;
        }
        if (state.searchQuery.trim()) {
          const q = state.searchQuery.toLowerCase();
          const matchTitle = `${m.homeTeam} ${m.awayTeam} ${m.league}`.toLowerCase();
          if (!matchTitle.includes(q)) return false;
        }
        return true;
      });
    },

    settledPredictions(state): PredictionRecord[] {
      return state.predictions.filter((p) => p.settled);
    },

    pendingPredictions(state): PredictionRecord[] {
      return state.predictions.filter((p) => !p.settled);
    },

    unreadAlertsCount(state): number {
      return state.alerts.filter((a) => !a.read).length;
    },
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            matches: this.matches,
            predictions: this.predictions,
          })
        );
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
    },

    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => {
        if (this.toastMessage === message) {
          this.toastMessage = null;
        }
      }, 4000);
    },

    // Evaluates live match metrics (overround, fair, model, edge)
    evaluateMatch(match: MatchAnalysis) {
      const odds = [match.homeOdds, match.drawOdds, match.awayOdds];
      const ovr = overround(odds);
      const fair = fairProbs(odds);

      const modelInput: ModelPredictionInput = {
        odds: [match.homeOdds, match.drawOdds, match.awayOdds],
        sentiment: {
          home: match.sentimentHome,
          away: match.sentimentAway,
        },
        goals: {
          homeExpected: match.homeExpGoals,
          awayExpected: match.awayExpGoals,
        },
      };

      const mod = predict(modelInput);
      const modelProbs = [mod.home, mod.draw, mod.away];

      const edges = [
        edge(mod.home, fair[0]),
        edge(mod.draw, fair[1]),
        edge(mod.away, fair[2]),
      ];

      return {
        overround: ovr,
        marginPercent: (ovr - 1) * 100,
        implied: [impliedProb(match.homeOdds), impliedProb(match.drawOdds), impliedProb(match.awayOdds)],
        fair,
        model: modelProbs,
        modelVersion: mod.modelVersion,
        edges,
      };
    },

    addMatch(data: Omit<MatchAnalysis, 'id'>) {
      const id = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newMatch: MatchAnalysis = {
        ...data,
        id,
      };
      this.matches.unshift(newMatch);
      this.persist();
      this.showToast(`Added match: ${newMatch.homeTeam} vs ${newMatch.awayTeam}`, 'success');
      return newMatch;
    },

    updateMatch(id: string, updates: Partial<MatchAnalysis>) {
      const idx = this.matches.findIndex((m) => m.id === id);
      if (idx !== -1) {
        this.matches[idx] = { ...this.matches[idx], ...updates };
        this.persist();
      }
    },

    removeMatch(id: string) {
      this.matches = this.matches.filter((m) => m.id !== id);
      this.persist();
      this.showToast('Match removed from analyzer', 'info');
    },

    importSlate(text: string) {
      const parsed = parseSlate(text);
      if (parsed.length === 0) {
        this.showToast('No valid matches found in slate text. Check the format.', 'warning');
        return 0;
      }

      let count = 0;
      for (const item of parsed) {
        this.matches.unshift({
          id: item.id,
          homeTeam: item.homeTeam,
          awayTeam: item.awayTeam,
          league: item.league || 'Custom League',
          kickoff: item.kickoff || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          homeOdds: item.homeOdds,
          drawOdds: item.drawOdds,
          awayOdds: item.awayOdds,
          sentimentHome: 0,
          sentimentAway: 0,
          homeExpGoals: 1.35,
          awayExpGoals: 1.1,
          priceAlertActive: false,
          alertEdgeThreshold: 0.03,
        });
        count++;
      }

      this.persist();
      this.showToast(`Imported ${count} match${count > 1 ? 'es' : ''} into analyzer`, 'success');
      return count;
    },

    // Save prediction - strictly rejects if kickoff has passed
    savePrediction(matchId: string, outcome: OutcomeType) {
      const match = this.matches.find((m) => m.id === matchId);
      if (!match) {
        this.showToast('Match not found', 'error');
        return { success: false, reason: 'NOT_FOUND' };
      }

      const kickoffTime = new Date(match.kickoff).getTime();
      const now = Date.now();

      // Rule: Reject saving if kickoff has passed
      if (isNaN(kickoffTime) || kickoffTime <= now) {
        this.showToast('Rejected: Cannot save prediction after kickoff time has passed.', 'error');
        return {
          success: false,
          reason: 'KICKOFF_PASSED',
          message: 'Kickoff has already passed. Predictions must be recorded prior to match start.',
        };
      }

      const evalData = this.evaluateMatch(match);
      const outcomeIndex = outcome === 'home' ? 0 : outcome === 'draw' ? 1 : 2;
      const selectedOdds = outcome === 'home' ? match.homeOdds : outcome === 'draw' ? match.drawOdds : match.awayOdds;

      const prediction: PredictionRecord = {
        id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        kickoff: match.kickoff,
        createdAt: new Date().toISOString(),
        oddsSnapshot: {
          home: match.homeOdds,
          draw: match.drawOdds,
          away: match.awayOdds,
        },
        fairSnapshot: {
          home: evalData.fair[0],
          draw: evalData.fair[1],
          away: evalData.fair[2],
        },
        modelSnapshot: {
          home: evalData.model[0],
          draw: evalData.model[1],
          away: evalData.model[2],
          modelVersion: evalData.modelVersion,
        },
        edges: {
          home: evalData.edges[0],
          draw: evalData.edges[1],
          away: evalData.edges[2],
        },
        selectedOutcome: outcome,
        selectedOdds,
        selectedModelProb: evalData.model[outcomeIndex],
        selectedFairProb: evalData.fair[outcomeIndex],
        selectedEdge: evalData.edges[outcomeIndex],
        settled: false,
        actualOutcome: null,
      };

      this.predictions.unshift(prediction);
      this.persist();
      this.showToast(
        `Logged prediction for ${match.homeTeam} vs ${match.awayTeam} (${outcome.toUpperCase()})`,
        'success'
      );
      return { success: true, prediction };
    },

    // Settle prediction
    settlePrediction(predictionId: string, actualOutcome: SettlementResult, actualScore?: string) {
      const pred = this.predictions.find((p) => p.id === predictionId);
      if (!pred) return;

      pred.settled = true;
      pred.actualOutcome = actualOutcome;
      pred.actualScore = actualScore || undefined;
      pred.settledAt = new Date().toISOString();

      if (actualOutcome === 'void') {
        pred.won = false;
        pred.pnlUnits = 0;
        pred.brierScore = undefined;
      } else if (actualOutcome !== null) {
        pred.won = pred.selectedOutcome === actualOutcome;
        const decimalOdds = pred.selectedOdds >= 10 ? pred.selectedOdds / 100 : pred.selectedOdds;
        pred.pnlUnits = pred.won ? Number((decimalOdds - 1).toFixed(3)) : -1.0;

        const outcomeIdx = actualOutcome === 'home' ? 0 : actualOutcome === 'draw' ? 1 : 2;
        const probs = [
          pred.modelSnapshot.home,
          pred.modelSnapshot.draw,
          pred.modelSnapshot.away,
        ];
        pred.brierScore = brier(probs, outcomeIdx);
      }

      this.persist();
      this.showToast(
        `Prediction settled: ${pred.homeTeam} vs ${pred.awayTeam} — ${pred.won ? 'WIN' : 'LOSS'}`,
        pred.won ? 'success' : 'info'
      );
    },

    deletePrediction(id: string) {
      this.predictions = this.predictions.filter((p) => p.id !== id);
      this.persist();
      this.showToast('Prediction removed from log', 'info');
    },

    // Real-time price alert simulation & detection
    simulateOddsShift() {
      if (this.matches.length === 0) return;

      // Pick a random match
      const randIdx = Math.floor(Math.random() * this.matches.length);
      const match = this.matches[randIdx];

      // Shift one random outcome odds by 10-30 ticks
      const outcomes: OutcomeType[] = ['home', 'draw', 'away'];
      const targetOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const delta = (Math.random() > 0.4 ? 1 : -1) * (10 + Math.floor(Math.random() * 20));

      const oldOdds =
        targetOutcome === 'home'
          ? match.homeOdds
          : targetOutcome === 'draw'
          ? match.drawOdds
          : match.awayOdds;

      const newOdds = Math.max(110, oldOdds + delta);

      if (targetOutcome === 'home') match.homeOdds = newOdds;
      else if (targetOutcome === 'draw') match.drawOdds = newOdds;
      else match.awayOdds = newOdds;

      const evalData = this.evaluateMatch(match);
      const outcomeIdx = targetOutcome === 'home' ? 0 : targetOutcome === 'draw' ? 1 : 2;
      const currentEdge = evalData.edges[outcomeIdx];

      // Check if price alert triggered
      const isSignificant =
        match.priceAlertActive ||
        Math.abs(delta) >= 15 ||
        currentEdge >= (match.alertEdgeThreshold ?? 0.03);

      if (isSignificant) {
        const alert: PriceAlert = {
          id: `alert_${Date.now()}`,
          matchId: match.id,
          matchName: `${match.homeTeam} v ${match.awayTeam}`,
          outcome: targetOutcome,
          oldOdds,
          newOdds,
          edge: currentEdge,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        };

        this.alerts.unshift(alert);

        const changeStr = delta > 0 ? `+${(delta / 100).toFixed(2)}` : `${(delta / 100).toFixed(2)}`;
        const alertMsg = `Price Alert: ${match.homeTeam} v ${match.awayTeam} (${targetOutcome.toUpperCase()}) odds drifted ${changeStr} -> ${(newOdds / 100).toFixed(2)} (Edge: ${(currentEdge * 100).toFixed(1)}%)`;

        this.showToast(alertMsg, currentEdge > 0.03 ? 'success' : 'info');

        // Trigger native notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Odds Lab Price Alert', {
              body: alertMsg,
              icon: '/favicon.ico',
            });
          } catch (e) {
            console.log('Notification API notification error:', e);
          }
        }
      }

      this.persist();
    },

    requestNotificationPermission() {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            this.notificationsEnabled = true;
            this.showToast('Browser price notifications enabled!', 'success');
          } else {
            this.notificationsEnabled = false;
            this.showToast('Browser notifications permission denied.', 'warning');
          }
        });
      } else {
        this.showToast('Browser notifications not supported in this environment.', 'info');
      }
    },

    markAlertAsRead(id: string) {
      const alert = this.alerts.find((a) => a.id === id);
      if (alert) alert.read = true;
    },

    clearAllAlerts() {
      this.alerts = [];
    },

    resetToDefaults() {
      this.matches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
      this.predictions = JSON.parse(JSON.stringify(INITIAL_PREDICTIONS));
      this.alerts = [];
      this.persist();
      this.showToast('Reset sample matches and prediction logs to default dataset', 'info');
    },

    exportDataJson(): string {
      return JSON.stringify(
        {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          matches: this.matches,
          predictions: this.predictions,
        },
        null,
        2
      );
    },

    importDataJson(jsonStr: string): boolean {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.matches)) this.matches = parsed.matches;
        if (Array.isArray(parsed.predictions)) this.predictions = parsed.predictions;
        this.persist();
        this.showToast('Data imported successfully!', 'success');
        return true;
      } catch (e) {
        this.showToast('Invalid JSON file format.', 'error');
        return false;
      }
    },
  },
});
