export type OutcomeType = 'home' | 'draw' | 'away';
export type SettlementResult = 'home' | 'draw' | 'away' | 'void' | null;

export interface MatchAnalysis {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string; // ISO string e.g. "2026-10-18T15:30"
  homeOdds: number; // integer cents e.g. 210
  drawOdds: number; // integer cents e.g. 340
  awayOdds: number; // integer cents e.g. 360
  sentimentHome: number; // -1 to 1
  sentimentAway: number; // -1 to 1
  homeExpGoals: number;
  awayExpGoals: number;
  priceAlertActive?: boolean;
  alertEdgeThreshold?: number; // e.g. 0.03
}

export interface PredictionRecord {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  createdAt: string;
  oddsSnapshot: {
    home: number;
    draw: number;
    away: number;
  };
  fairSnapshot: {
    home: number;
    draw: number;
    away: number;
  };
  modelSnapshot: {
    home: number;
    draw: number;
    away: number;
    modelVersion: string;
  };
  edges: {
    home: number;
    draw: number;
    away: number;
  };
  selectedOutcome: OutcomeType;
  selectedOdds: number;
  selectedModelProb: number;
  selectedFairProb: number;
  selectedEdge: number;
  
  // Settlement fields
  settled: boolean;
  actualOutcome: SettlementResult;
  actualScore?: string; // e.g. "2 - 1"
  settledAt?: string;
  won?: boolean;
  pnlUnits?: number; // based on 1 unit flat stake
  brierScore?: number;
}

export interface SlipLeg {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  outcome: OutcomeType;
  odds: number; // integer cents e.g. 210
  modelProb: number; // 0-1 model probability for the selected outcome
  fairProb: number; // 0-1 devigged market probability
  edge: number; // modelProb - fairProb
}

export interface PriceAlert {
  id: string;
  matchId: string;
  matchName: string;
  outcome: OutcomeType;
  oldOdds: number;
  newOdds: number;
  edge: number;
  timestamp: string;
  read: boolean;
}
