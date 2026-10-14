# Implementation Plan: Live Odds & Firebase Integration

Integrate **The-Odds-API** for real-time sports fixtures and odds, and configure **Firebase Firestore** as an intelligent caching layer and persistent store for predictions.

---

## 1. Architecture & Quota Protection

**The-Odds-API Free Tier Constraints:**
- 500 requests/month limit.
- Directly fetching from the client on every page load would exhaust the monthly limit within days.

**Solution: Firestore-Backed Quota Shield**
```
[The-Odds-API]
      │ (Cached 15–30 min TTL)
      ▼
[Firestore Cache: /odds_cache/{league}]
      │
      ▼
[Uvaan's Bet Predictor (Vue 3 Client)]
      │
      ├──> Analyzes Implied vs Fair vs Model
      └──> Syncs Predictions to [/predictions]
```

1. **Client / Server Proxy**:
   - Read from Firestore cache first.
   - Only call The-Odds-API when cache is expired (TTL > 15–30 minutes) or upon user-initiated manual refresh.
   - Store and display remaining monthly quota returned by The-Odds-API headers (`x-requests-remaining`).
2. **Graceful Fallback**:
   - If no API key is provided, or quota runs out, seamless switch to the built-in PSL/EPL fixtures with a clear badge.
3. **API Key Input**:
   - Configure via environment variable or in-app Settings modal with local encrypted storage.

---

## 2. Firebase Provisioning & Data Schema

### Collections
1. **`odds_cache/{league}`**:
   - `league`: e.g. `soccer_epl`, `soccer_uefa_champs_league`, `soccer_south_africa_psl`
   - `fixtures`: array of matches with Home, Away, Kickoff, Bookmaker Odds (Home, Draw, Away)
   - `cachedAt`: timestamp
   - `expiresAt`: timestamp
2. **`predictions/{id}`**:
   - `matchId`, `homeTeam`, `awayTeam`, `league`, `kickoff`
   - `oddsSnapshot`, `fairSnapshot`, `modelSnapshot`, `edges`
   - `selectedOutcome`, `selectedOdds`, `createdAt`
   - `settled`, `actualOutcome`, `actualScore`, `brierScore`, `pnlUnits`
3. **`api_quota/status`**:
   - `remainingRequests`: integer
   - `usedThisMonth`: integer
   - `lastFetchedAt`: timestamp

---

## 3. Scope of Changes

### Phase 1: Firebase Provisioning
- Run `set_up_firebase` tool to provision Firestore.
- Generate secure `firestore.rules` and `firebase-applet-config.json`.
- Install Firebase client SDK (`firebase`) and initialize in `src/lib/firebase.ts`.

### Phase 2: Live Odds Service (`src/lib/oddsApi.ts`)
- The-Odds-API client fetching fixtures for:
  - English Premier League (`soccer_epl`)
  - UEFA Champions League (`soccer_uefa_champs_league`)
  - South Africa PSL (`soccer_south_africa_psl` / Rest of World)
- Conversion of live decimal odds to integer cents (`2.10 -> 210`).
- Firestore caching read/write layer with TTL expiration logic.

### Phase 3: Store & State Refactor (`src/stores/oddsStore.ts`)
- Connect store to Firestore real-time listeners (`onSnapshot`).
- Add `fetchLiveOdds(forceRefresh?: boolean)` action.
- Add live odds status, remaining quota counter, and cache timestamp to store state.
- Keep local persistence fallback if offline.

### Phase 4: UI Enhancements (Maintaining Minimalist Design)
- **Top Control Bar**:
  - Live status indicator: `"Live Odds (Updated 12m ago)"`
  - Remaining API credits indicator: `"482 / 500 requests left"`
  - Quick `"Refresh Live Odds"` button with cooldown timer.
- **League Selector**: Switch between Live PSL, EPL, Champions League, or Custom Paste.
- **Odds Drift Indicators**: Show subtle directional indicators if odds moved since last fetch.
- **API Key Configuration Drawer**: Simple, clean drawer to enter or update the user's free The-Odds-API key.

---

## 4. Verification & Testing

- Validate conversion math (`2.10 -> 210`) against `src/lib/odds.test.ts`.
- Verify caching prevents duplicate API requests within TTL window.
- Verify kickoff lock rule remains strictly enforced for live games.
- Confirm 18+ and responsible gambling footer remains visible across all screens.
