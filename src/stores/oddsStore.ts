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
  SlipLeg,
} from '@/types';
import { fetchLiveOdds, SPORTS_CONFIG, ODDS_API_KEY } from '@/lib/oddsApi';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'odds_lab_store_v1';

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
    id: 'm-epl-2',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    kickoff: '2026-10-25T16:30',
    homeOdds: 205,
    drawOdds: 360,
    awayOdds: 340,
    sentimentHome: 0.2,
    sentimentAway: 0.2,
    homeExpGoals: 2.1,
    awayExpGoals: 1.8,
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
  },
];

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
    pnlUnits: 1.10,
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
];

export const useOddsStore = defineStore('odds', {
  state: () => {
    let loadedMatches = INITIAL_MATCHES;
    let loadedPredictions = INITIAL_PREDICTIONS;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.matches) && parsed.matches.length > 0) loadedMatches = parsed.matches;
        if (Array.isArray(parsed.predictions) && parsed.predictions.length > 0) loadedPredictions = parsed.predictions;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data', e);
    }

    return {
      activeTab: 'upcoming' as 'upcoming' | 'analyzer' | 'log' | 'stats' | 'method',
      matches: loadedMatches,
      predictions: loadedPredictions,
      selectedLeague: 'soccer_epl',
      isLiveLoading: false,
      lastLiveFetchedAt: null as string | null,
      isLiveCached: false,
      requestsRemaining: null as number | null,
      requestsUsed: null as number | null,
      toastMessage: null as string | null,
      focusedMatchId: null as string | null,
      firebaseInitialized: false,
      hasLiveKey: !!ODDS_API_KEY,
      slipLegs: [] as SlipLeg[],
      isSlipOpen: false,
    };
  },

  getters: {
    settledPredictions(state): PredictionRecord[] {
      return state.predictions.filter((p) => p.settled);
    },
    pendingPredictions(state): PredictionRecord[] {
      return state.predictions.filter((p) => !p.settled);
    },
  },

  actions: {
    initFirebaseSync() {
      if (this.firebaseInitialized) return;
      this.firebaseInitialized = true;

      // Subscribe to predictions collection
      try {
        const predsCol = collection(db, 'predictions');
        onSnapshot(
          predsCol,
          (snap) => {
            if (!snap.empty) {
              const cloudPreds: PredictionRecord[] = [];
              snap.forEach((docSnap) => {
                cloudPreds.push(docSnap.data() as PredictionRecord);
              });

              // Merge with local predictions (avoiding duplicates)
              const existingIds = new Set(cloudPreds.map((p) => p.id));
              const localUnique = this.predictions.filter((p) => !existingIds.has(p.id));
              this.predictions = [...cloudPreds, ...localUnique].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              this.persist();
            }
          },
          (err) => {
            console.warn('Firestore predictions sync listener offline or denied:', err);
          }
        );
      } catch (e) {
        console.warn('Error setting up Firestore listener:', e);
      }
    },

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

    showToast(message: string) {
      this.toastMessage = message;
      setTimeout(() => {
        if (this.toastMessage === message) {
          this.toastMessage = null;
        }
      }, 4000);
    },

    async loadLiveOdds(sportKey?: string, forceRefresh = false) {
      const targetSport = sportKey || this.selectedLeague;
      this.selectedLeague = targetSport;
      this.isLiveLoading = true;
      try {
        const res = await fetchLiveOdds(targetSport, forceRefresh);
        if (res.fixtures && res.fixtures.length > 0) {
          this.matches = res.fixtures;
          this.isLiveCached = res.cached;
          this.lastLiveFetchedAt = res.cachedAt;
          this.requestsRemaining = res.requestsRemaining;
          this.requestsUsed = res.requestsUsed;
          this.persist();
          if (res.notice) {
            this.showToast(res.notice);
          } else {
            this.showToast(
              res.cached
                ? `Loaded ${res.fixtures.length} matches from Firestore cache (0 API quota used)`
                : `Fetched ${res.fixtures.length} live matches from The-Odds-API`
            );
          }
        } else if (res.error) {
          this.showToast(`Notice: Live odds temporarily unavailable. Using local fixtures.`);
        } else {
          this.showToast('No fixtures currently available for this league in season.');
        }
      } catch (e: any) {
        this.showToast(`Notice: Live odds temporarily unavailable. Using local fixtures.`);
      } finally {
        this.isLiveLoading = false;
      }
    },

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
      const newMatch: MatchAnalysis = { ...data, id };
      this.matches.unshift(newMatch);
      this.persist();
      this.showToast(`Added match: ${newMatch.homeTeam} vs ${newMatch.awayTeam}`);
      return newMatch;
    },

    removeMatch(id: string) {
      this.matches = this.matches.filter((m) => m.id !== id);
      this.persist();
      this.showToast('Match removed from analyzer');
    },

    importSlate(text: string) {
      const parsed = parseSlate(text);
      if (parsed.length === 0) {
        this.showToast('No valid matches found. Check format: Home v Away | league | kickoff | H D A');
        return 0;
      }

      let count = 0;
      for (const item of parsed) {
        this.matches.unshift({
          id: item.id,
          homeTeam: item.homeTeam,
          awayTeam: item.awayTeam,
          league: item.league || 'Custom',
          kickoff: item.kickoff || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          homeOdds: item.homeOdds,
          drawOdds: item.drawOdds,
          awayOdds: item.awayOdds,
          sentimentHome: 0,
          sentimentAway: 0,
          homeExpGoals: 1.35,
          awayExpGoals: 1.1,
        });
        count++;
      }

      this.persist();
      this.showToast(`Imported ${count} match${count > 1 ? 'es' : ''}`);
      return count;
    },

    async savePrediction(matchId: string, outcome: OutcomeType) {
      const match = this.matches.find((m) => m.id === matchId);
      if (!match) return;

      const kickoffTime = new Date(match.kickoff).getTime();
      if (!isNaN(kickoffTime) && kickoffTime <= Date.now()) {
        this.showToast('Kickoff has passed. Predictions cannot be saved after start.');
        return;
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
        oddsSnapshot: { home: match.homeOdds, draw: match.drawOdds, away: match.awayOdds },
        fairSnapshot: { home: evalData.fair[0], draw: evalData.fair[1], away: evalData.fair[2] },
        modelSnapshot: { home: evalData.model[0], draw: evalData.model[1], away: evalData.model[2], modelVersion: evalData.modelVersion },
        edges: { home: evalData.edges[0], draw: evalData.edges[1], away: evalData.edges[2] },
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

      // Cloud sync to Firestore
      try {
        await setDoc(doc(db, 'predictions', prediction.id), prediction);
      } catch (err) {
        console.warn('Saved locally, Firestore sync skipped:', err);
      }

      this.showToast(`Saved prediction for ${match.homeTeam} v ${match.awayTeam} (${outcome.toUpperCase()})`);
    },

    async settlePrediction(predictionId: string, actualOutcome: SettlementResult, actualScore?: string) {
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
        const probs = [pred.modelSnapshot.home, pred.modelSnapshot.draw, pred.modelSnapshot.away];
        pred.brierScore = brier(probs, outcomeIdx);
      }

      this.persist();

      // Cloud sync update to Firestore
      try {
        await setDoc(doc(db, 'predictions', pred.id), pred);
      } catch (err) {
        console.warn('Settled locally, Firestore sync skipped:', err);
      }

      this.showToast(`Settled: ${pred.homeTeam} v ${pred.awayTeam} (${pred.won ? 'Won' : 'Lost'})`);
    },

    openSlip() {
      this.isSlipOpen = true;
    },

    closeSlip() {
      this.isSlipOpen = false;
    },

    addToSlip(match: MatchAnalysis, outcome: OutcomeType) {
      const evalData = this.evaluateMatch(match);
      const idx = outcome === 'home' ? 0 : outcome === 'draw' ? 1 : 2;
      const odds = outcome === 'home' ? match.homeOdds : outcome === 'draw' ? match.drawOdds : match.awayOdds;
      const existing = this.slipLegs.findIndex((l) => l.matchId === match.id);
      const leg: SlipLeg = {
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        kickoff: match.kickoff,
        outcome,
        odds,
        modelProb: evalData.model[idx],
        fairProb: evalData.fair[idx],
        edge: evalData.edges[idx],
      };
      if (existing >= 0) {
        this.slipLegs[existing] = leg;
        this.showToast(`Updated slip: ${match.homeTeam} v ${match.awayTeam} (${outcome.toUpperCase()})`);
      } else {
        this.slipLegs.push(leg);
        this.showToast(`Added to slip: ${match.homeTeam} v ${match.awayTeam} (${outcome.toUpperCase()})`);
      }
      this.isSlipOpen = true;
    },

    addPredictionToSlip(pred: PredictionRecord) {
      const existing = this.slipLegs.findIndex((l) => l.matchId === pred.matchId && l.outcome === pred.selectedOutcome);
      const leg: SlipLeg = {
        matchId: pred.matchId,
        homeTeam: pred.homeTeam,
        awayTeam: pred.awayTeam,
        league: pred.league,
        kickoff: pred.kickoff,
        outcome: pred.selectedOutcome,
        odds: pred.selectedOdds,
        modelProb: pred.selectedModelProb,
        fairProb: pred.selectedFairProb,
        edge: pred.selectedEdge,
      };
      if (existing >= 0) {
        this.slipLegs[existing] = leg;
      } else {
        // One leg per match: replace any other outcome for the same match
        this.slipLegs = this.slipLegs.filter((l) => l.matchId !== pred.matchId);
        this.slipLegs.push(leg);
      }
      this.showToast(`Added to slip: ${pred.homeTeam} v ${pred.awayTeam} (${pred.selectedOutcome.toUpperCase()})`);
      this.isSlipOpen = true;
    },

    removeFromSlip(matchId: string) {
      this.slipLegs = this.slipLegs.filter((l) => l.matchId !== matchId);
    },

    clearSlip() {
      this.slipLegs = [];
    },

    async deletePrediction(id: string) {
      this.predictions = this.predictions.filter((p) => p.id !== id);
      this.persist();
      try {
        await deleteDoc(doc(db, 'predictions', id));
      } catch (err) {
        console.warn('Deleted locally, Firestore sync skipped:', err);
      }
      this.showToast('Prediction removed');
    },
  },
});
