# OddsLab: MyFootballFacts Quantitative Performance, Momentum & H2H Prediction Engine

Integrating historical win records, rolling form momentum indexes, and quantitative performance-adjusted match forecasts into the OddsLab sports analytics suite.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Data Grounding & Modeling Approach Confirmation**
> - **Confirmed Focus**: Adding current momentum tracking, historical head-to-head (H2H) win history, and quantitative performance-driven predictions inspired by statistical archives like MyFootballFacts.
> - **Mathematical Synthesis (Recommended)**: The prediction engine synthesizes (1) Poisson goal expectancy, (2) Exponentially weighted 5-match rolling momentum scores, and (3) Long-term H2H matchup win rates into a composite quantitative probability distribution (1X2, BTTS, and Over/Under 2.5).
> - **Interactive Visibility**: Surfacing momentum indicators directly on match cards in the upcoming fixtures list and providing a rich, high-density quantitative breakdown tab inside the Match Analytics modal.

---

### 1. Overview & Core Concept

- **What It Does**: Enhances OddsLab from a static odds devigger into a full quantitative soccer research terminal. Users can inspect any fixture's rolling momentum differential, review comprehensive head-to-head match histories with scoreline archives, and compare bookmaker implied odds against a transparent quantitative performance model.
- **Target Audience / Persona**: Quant sports bettors, algorithmic modelers (r/algobetting community), and analytical football enthusiasts seeking verifiable statistical edges rather than gut picks.
- **Key Value**: Bridges the gap between raw historical records (MyFootballFacts-style depth) and mathematical betting models, providing clear explanations of *why* the model projects an edge based on real performance variables.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Fixture Card Quick-Scan (`UpcomingMatchesView.vue`)**:
   - Each match displays an inline **Momentum Indicator** (e.g. `Sundowns: 88 pts ▲ / Pirates: 72 pts ▼`) and quick **H2H Record Tag** (`Last 6: 3W-2D-1L`).
   - The predicted model outcome clearly flags if quantitative momentum reinforces or contrasts the bookmaker consensus.
2. **Deep-Dive Quantitative Dossier (`MatchStatsModal.vue`)**:
   - **Tab 1: Tactical & Radar**: Retains existing attacking/defending radar and key player profiles.
   - **Tab 2: MyFootballFacts Momentum & H2H Archive**:
     - *Rolling Form Timeline*: Last 6 matches for each team with opponent, scoreline, venue (Home/Away), and goal differential trend lines.
     - *Momentum Score Gauge*: 0–100 index computed from points per match, goal supremacy, clean-sheet rate, and recency weighting.
     - *Historical Head-to-Head Log*: All-time and recent 5-year H2H summary (Home Wins, Draws, Away Wins, Win %, Avg Total Goals).
     - *Scoreline Matrix*: Historic fixture results with date and competition breakdown.
   - **Tab 3: Quantitative Forecast Matrix**:
     - Comparative breakdown: **Market Implied Odds** vs **Poisson Baseline** vs **Quant Performance Model**.
     - Derivative markets: Both Teams to Score (BTTS) and Over/Under 2.5 Goals probabilities.
     - Expected Value (+EV) verdict with clear mathematical explanation.
3. **Bet Slip & Prediction Logging Integration**:
   - When adding a pick to the Bet Slip or saving a Prediction Log, the quantitative momentum rating and H2H confidence level are captured in the snapshot for post-settlement calibration.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-density dark telemetry terminal inspired by quantitative trading desks and structured sports archives.
- **Color Palette & Theme Tokens**:
  - Background: Deep slate terminal surfaces (`#0b0f16`, `#111722`, `#171e2c`) with crisp 1px borders (`#243044`).
  - Home Accent / Positive Delta: Emerald teal (`#0d9488`, `#2dd4bf`).
  - Away Accent / Negative Delta: Rose / Coral (`#e11d48`, `#fb7185`).
  - Neutral / Market Draw: Muted slate (`#64748b`, `#93a0b8`).
  - Quantitative Edge Highlight: Cyber cyan (`#00f5ff`) with subtle glow.
- **Typography & Tabular Discipline**:
  - Display headers: High-legibility condensed geometric sans (`Plus Jakarta Sans`).
  - Data points, probabilities, goal expectancies, and momentum scores: Enforced monospace with tabular figures (`font-mono tabular-nums`).
  - Anti-Slop Discipline: Clean typographic dividers (`·`, `/`) instead of gratuitous pill badges.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Quantitative Momentum Formula (Recency-Weighted Form vs Flat Points)**
  - *Chosen Approach*: Exponentially decaying rolling momentum score over the past 5 matches ($w_1 = 1.0, w_2 = 0.85, w_3 = 0.70, w_4 = 0.55, w_5 = 0.40$). Each result rewards points (3 for W, 1 for D, 0 for L), adjusted by goal difference ($+0.2$ per net goal) and venue difficulty ($+15\%$ boost for away performances).
  - *Why*: In soccer analytics, a team's performance 4 days ago is vastly more predictive of current readiness than a result 6 weeks ago.
  - *Alternatives Considered*: Flat last-5 points (too coarse, treats 1-0 home squeakers the same as 4-0 away blowouts).

- **Decision 2: Blended Quantitative Prediction Model (Poisson + Dixon-Coles Low-Score Adjustment + Momentum Tilt)**
  - *Chosen Approach*: The base goal rates ($\lambda_{\text{home}}, \lambda_{\text{away}}$) are derived from league attacking/defensive averages, tilted by the momentum differential ($\Delta M$) and home-advantage coefficient. Probabilities are generated via bivariate Poisson with low-scoring draw correction (Dixon-Coles adjustment for 0-0, 1-0, 0-1, 1-1).
  - *Why*: Pure Poisson systematically under-predicts 0-0 and 1-1 draws in competitive football. Blending momentum with low-score calibration produces higher Brier accuracy.
  - *Alternatives Considered*: Machine learning black-box model (unverifiable by users and difficult to peer-review in community testing).

- **Decision 3: Built-in Historical Datasets for All Supported Clubs**
  - *Chosen Approach*: Enrich `teamAssets.ts` and `historicalData.ts` with authentic Head-to-Head archives, past match logs, venue splits, and momentum histories for PSL, Premier League, and Champions League fixtures, plus dynamic fallback generators for newly imported custom match slates.
  - *Why*: Ensures instant, zero-latency rendering of H2H tabs and momentum charts without external rate-limiting or API downtime.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OddsLab Analytics Suite                         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌─────────────────────────────┐                    ┌─────────────────────┐
│    Live / Slate Fixtures    │                    │  H2H & Form Archive │
│  (The Odds API / CSV Import)│                    │ (MyFootballFacts DB)│
└──────────────┬──────────────┘                    └──────────┬──────────┘
               │                                              │
               └──────────────────────┬───────────────────────┘
                                      ▼
                      ┌────────────────────────────────┐
                      │    Quant Momentum & Forecast   │
                      │             Engine             │
                      │       (`src/lib/odds.ts`)      │
                      │  • Rolling Decay Momentum      │
                      │  • Bivariate Poisson + DC      │
                      │  • Edge & Value Evaluator      │
                      └───────────────┬────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ UpcomingMatchesView   │ │ MatchStatsModal       │ │ PredictionsLogView    │
│ • Momentum Badge      │ │ • H2H Archive Log     │ │ • Quant Snapshot      │
│ • Trend Indicator     │ │ • Form Trajectory     │ │ • Brier Calibration   │
│ • Quick Edge Trigger  │ │ • Score Matrix View   │ │ • CLV Tracking        │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

#### State & Data Models

1. **`HistoricalMatch` & `HeadToHeadRecord`**:
   - `id`, `date`, `homeTeam`, `awayTeam`, `homeScore`, `awayScore`, `competition`, `venue`.
   - `summary`: total meetings, homeWins, draws, awayWins, bttsPercentage, over25Percentage, avgGoalsPerGame.

2. **`TeamMomentum`**:
   - `teamName`: string.
   - `momentumScore`: 0–100 normalized score.
   - `trend`: `'surging' | 'stable' | 'declining'`.
   - `rollingForm`: array of 5 match objects with opponent, score, xG, and result.
   - `cleanSheetRate`: percentage.
   - `failToScoreRate`: percentage.

3. **`QuantitativePrediction`**:
   - `lambdaHome`: expected goals home.
   - `lambdaAway`: expected goals away.
   - `homeWinProb`, `drawProb`, `awayWinProb`.
   - `bttsProb`, `over25Prob`.
   - `mostLikelyScores`: array of top 5 exact scorelines with percentages.
   - `momentumTiltExplanation`: human-readable explanation of why momentum shifted the edge.

#### Implementation Steps
1. **Module 1 (`src/lib/historicalData.ts`)**: Implement head-to-head match history archives, past meeting records, and recent form match logs for major clubs across PSL, EPL, and European fixtures.
2. **Module 2 (`src/lib/momentumEngine.ts` & `src/lib/odds.ts`)**: Implement quantitative momentum calculation functions, Dixon-Coles bivariate Poisson scoreline distribution, and quantitative performance forecasts.
3. **Module 3 (`src/components/MatchStatsModal.vue`)**: Expand the modal into a multi-tab analytical suite: (1) Tactical Radar, (2) MyFootballFacts H2H Archive & Momentum Trend, and (3) Quantitative Forecast & Value Breakdown.
4. **Module 4 (`src/components/UpcomingMatchesView.vue`)**: Add momentum trend indicators, H2H quick summary chips, and quick quantitative value triggers to the fixture cards.
5. **Module 5 (`src/stores/oddsStore.ts`)**: Store momentum data in match evaluations and allow single-click export of quantitative predictions to the log and bet slip simulator.
