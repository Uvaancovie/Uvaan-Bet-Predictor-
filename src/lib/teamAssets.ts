/**
 * Team branding, crest badges, and player data for EPL, UCL, and PSL clubs.
 * Includes automated dynamic crest resolution via TheSportsDB free public API with localStorage caching.
 */

export interface PlayerProfile {
  name: string;
  number: number;
  position: 'FWD' | 'MID' | 'DEF' | 'GK';
  goals: number;
  assists: number;
  shotsPerGame: number;
  xG: number;
  avatar: string;
}

export interface TeamStats {
  name: string;
  shortName: string;
  crest: string;
  primaryColor: string;
  form: ('W' | 'D' | 'L')[];
  attackRating: number;   // 0-100
  defenseRating: number;  // 0-100
  possessionAvg: number;  // %
  avgGoalsScored: number;
  avgGoalsConceded: number;
  keyPlayers: PlayerProfile[];
}

const CREST_CACHE_KEY = 'odds_lab_crests_cache_v1';
const crestMemoryCache: Record<string, string> = {};

// Load persisted crests from localStorage
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(CREST_CACHE_KEY);
    if (raw) {
      Object.assign(crestMemoryCache, JSON.parse(raw));
    }
  } catch (e) {
    // ignore
  }
}

export const TEAM_REGISTRY: Record<string, TeamStats> = {
  // South Africa PSL Clubs
  'Mamelodi Sundowns': {
    name: 'Mamelodi Sundowns',
    shortName: 'Sundowns',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/vwwtxq1473489814.png',
    primaryColor: '#facc15',
    form: ['W', 'W', 'D', 'W', 'W'],
    attackRating: 88,
    defenseRating: 92,
    possessionAvg: 64,
    avgGoalsScored: 2.2,
    avgGoalsConceded: 0.6,
    keyPlayers: [
      { name: 'Peter Shalulile', number: 38, position: 'FWD', goals: 14, assists: 4, shotsPerGame: 3.4, xG: 12.8, avatar: '⚽' },
      { name: 'Marcelo Allende', number: 11, position: 'MID', goals: 6, assists: 9, shotsPerGame: 1.8, xG: 5.2, avatar: '👟' },
      { name: 'Ronwen Williams', number: 1, position: 'GK', goals: 0, assists: 1, shotsPerGame: 0.0, xG: 0.0, avatar: '🧤' },
    ],
  },
  'Orlando Pirates': {
    name: 'Orlando Pirates',
    shortName: 'Pirates',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/xqqqvv1473489832.png',
    primaryColor: '#18181b',
    form: ['W', 'W', 'L', 'W', 'D'],
    attackRating: 84,
    defenseRating: 81,
    possessionAvg: 57,
    avgGoalsScored: 1.8,
    avgGoalsConceded: 0.9,
    keyPlayers: [
      { name: 'Monnapule Saleng', number: 14, position: 'FWD', goals: 11, assists: 7, shotsPerGame: 2.9, xG: 9.4, avatar: '⚽' },
      { name: 'Patrick Maswanganyi', number: 28, position: 'MID', goals: 7, assists: 8, shotsPerGame: 2.1, xG: 6.1, avatar: '👟' },
    ],
  },
  'Kaizer Chiefs': {
    name: 'Kaizer Chiefs',
    shortName: 'Chiefs',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/stuxsv1473489849.png',
    primaryColor: '#f59e0b',
    form: ['L', 'W', 'D', 'L', 'W'],
    attackRating: 75,
    defenseRating: 74,
    possessionAvg: 52,
    avgGoalsScored: 1.3,
    avgGoalsConceded: 1.2,
    keyPlayers: [
      { name: 'Ashley Du Preez', number: 9, position: 'FWD', goals: 8, assists: 3, shotsPerGame: 2.4, xG: 7.5, avatar: '⚽' },
      { name: 'Yusuf Maart', number: 8, position: 'MID', goals: 4, assists: 5, shotsPerGame: 1.6, xG: 3.8, avatar: '👟' },
    ],
  },
  'Stellenbosch FC': {
    name: 'Stellenbosch FC',
    shortName: 'Stellenbosch',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/06k5s91566497491.png',
    primaryColor: '#881337',
    form: ['W', 'D', 'W', 'W', 'L'],
    attackRating: 79,
    defenseRating: 80,
    possessionAvg: 50,
    avgGoalsScored: 1.6,
    avgGoalsConceded: 1.0,
    keyPlayers: [
      { name: 'Iqraam Rayners', number: 17, position: 'FWD', goals: 12, assists: 5, shotsPerGame: 3.1, xG: 10.5, avatar: '⚽' },
    ],
  },
  'SuperSport United': {
    name: 'SuperSport United',
    shortName: 'SuperSport',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/vwtxvq1473489868.png',
    primaryColor: '#2563eb',
    form: ['D', 'L', 'W', 'D', 'L'],
    attackRating: 72,
    defenseRating: 75,
    possessionAvg: 48,
    avgGoalsScored: 1.2,
    avgGoalsConceded: 1.3,
    keyPlayers: [
      { name: 'Bradley Grobler', number: 7, position: 'FWD', goals: 9, assists: 2, shotsPerGame: 2.2, xG: 8.0, avatar: '⚽' },
    ],
  },
  'Cape Town City': {
    name: 'Cape Town City',
    shortName: 'CT City',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/yvrwrr1473489895.png',
    primaryColor: '#0284c7',
    form: ['W', 'L', 'D', 'W', 'L'],
    attackRating: 74,
    defenseRating: 76,
    possessionAvg: 54,
    avgGoalsScored: 1.4,
    avgGoalsConceded: 1.2,
    keyPlayers: [
      { name: 'Khanyisa Mayo', number: 10, position: 'FWD', goals: 10, assists: 3, shotsPerGame: 2.8, xG: 9.1, avatar: '⚽' },
    ],
  },

  // English Premier League Clubs
  'Arsenal': {
    name: 'Arsenal',
    shortName: 'Arsenal',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612464705.png',
    primaryColor: '#ef4444',
    form: ['W', 'W', 'W', 'D', 'W'],
    attackRating: 91,
    defenseRating: 94,
    possessionAvg: 62,
    avgGoalsScored: 2.4,
    avgGoalsConceded: 0.7,
    keyPlayers: [
      { name: 'Bukayo Saka', number: 7, position: 'FWD', goals: 16, assists: 12, shotsPerGame: 3.2, xG: 14.1, avatar: '⚽' },
      { name: 'Martin Ødegaard', number: 8, position: 'MID', goals: 11, assists: 10, shotsPerGame: 2.5, xG: 9.8, avatar: '👟' },
    ],
  },
  'Chelsea': {
    name: 'Chelsea',
    shortName: 'Chelsea',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png',
    primaryColor: '#2563eb',
    form: ['W', 'D', 'W', 'L', 'W'],
    attackRating: 85,
    defenseRating: 82,
    possessionAvg: 58,
    avgGoalsScored: 1.9,
    avgGoalsConceded: 1.3,
    keyPlayers: [
      { name: 'Cole Palmer', number: 20, position: 'FWD', goals: 18, assists: 11, shotsPerGame: 3.6, xG: 15.3, avatar: '⚽' },
    ],
  },
  'Manchester City': {
    name: 'Manchester City',
    shortName: 'Man City',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
    primaryColor: '#38bdf8',
    form: ['W', 'W', 'W', 'W', 'D'],
    attackRating: 96,
    defenseRating: 90,
    possessionAvg: 67,
    avgGoalsScored: 2.7,
    avgGoalsConceded: 0.8,
    keyPlayers: [
      { name: 'Erling Haaland', number: 9, position: 'FWD', goals: 25, assists: 6, shotsPerGame: 4.1, xG: 22.8, avatar: '⚽' },
    ],
  },
  'Liverpool': {
    name: 'Liverpool',
    shortName: 'Liverpool',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/c8gahz1684346877.png',
    primaryColor: '#dc2626',
    form: ['W', 'W', 'L', 'W', 'W'],
    attackRating: 93,
    defenseRating: 88,
    possessionAvg: 63,
    avgGoalsScored: 2.5,
    avgGoalsConceded: 0.9,
    keyPlayers: [
      { name: 'Mohamed Salah', number: 11, position: 'FWD', goals: 21, assists: 13, shotsPerGame: 3.8, xG: 18.5, avatar: '⚽' },
    ],
  },
  'Everton': {
    name: 'Everton',
    shortName: 'Everton',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/eqayrf1523184794.png',
    primaryColor: '#1d4ed8',
    form: ['D', 'W', 'L', 'D', 'W'],
    attackRating: 75,
    defenseRating: 78,
    possessionAvg: 44,
    avgGoalsScored: 1.2,
    avgGoalsConceded: 1.4,
    keyPlayers: [
      { name: 'Dominic Calvert-Lewin', number: 9, position: 'FWD', goals: 8, assists: 2, shotsPerGame: 2.5, xG: 9.1, avatar: '⚽' },
    ],
  },
  'Tottenham': {
    name: 'Tottenham Hotspur',
    shortName: 'Spurs',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/df2jhh1612464974.png',
    primaryColor: '#ffffff',
    form: ['W', 'W', 'L', 'W', 'L'],
    attackRating: 88,
    defenseRating: 81,
    possessionAvg: 61,
    avgGoalsScored: 2.1,
    avgGoalsConceded: 1.5,
    keyPlayers: [
      { name: 'Son Heung-min', number: 7, position: 'FWD', goals: 17, assists: 10, shotsPerGame: 2.8, xG: 12.4, avatar: '⚽' },
    ],
  },
  'Manchester United': {
    name: 'Manchester United',
    shortName: 'Man Utd',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png',
    primaryColor: '#dc2626',
    form: ['W', 'L', 'D', 'W', 'L'],
    attackRating: 83,
    defenseRating: 79,
    possessionAvg: 53,
    avgGoalsScored: 1.6,
    avgGoalsConceded: 1.5,
    keyPlayers: [
      { name: 'Bruno Fernandes', number: 8, position: 'MID', goals: 10, assists: 9, shotsPerGame: 3.1, xG: 8.8, avatar: '👟' },
    ],
  },
  'Aston Villa': {
    name: 'Aston Villa',
    shortName: 'Aston Villa',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/06jfxb1717498705.png',
    primaryColor: '#7f1d1d',
    form: ['W', 'W', 'D', 'W', 'W'],
    attackRating: 87,
    defenseRating: 83,
    possessionAvg: 55,
    avgGoalsScored: 2.0,
    avgGoalsConceded: 1.3,
    keyPlayers: [
      { name: 'Ollie Watkins', number: 11, position: 'FWD', goals: 19, assists: 13, shotsPerGame: 3.2, xG: 16.7, avatar: '⚽' },
    ],
  },
  'Newcastle': {
    name: 'Newcastle United',
    shortName: 'Newcastle',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/7wjhph1612465052.png',
    primaryColor: '#18181b',
    form: ['W', 'D', 'W', 'W', 'L'],
    attackRating: 86,
    defenseRating: 82,
    possessionAvg: 52,
    avgGoalsScored: 2.1,
    avgGoalsConceded: 1.4,
    keyPlayers: [
      { name: 'Alexander Isak', number: 14, position: 'FWD', goals: 21, assists: 2, shotsPerGame: 3.1, xG: 19.2, avatar: '⚽' },
    ],
  },

  // UEFA Champions League / European Giants
  'Real Madrid': {
    name: 'Real Madrid',
    shortName: 'Real Madrid',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
    primaryColor: '#ffffff',
    form: ['W', 'W', 'W', 'D', 'W'],
    attackRating: 95,
    defenseRating: 89,
    possessionAvg: 61,
    avgGoalsScored: 2.5,
    avgGoalsConceded: 0.8,
    keyPlayers: [
      { name: 'Vinícius Júnior', number: 7, position: 'FWD', goals: 19, assists: 11, shotsPerGame: 3.5, xG: 16.2, avatar: '⚽' },
      { name: 'Kylian Mbappé', number: 9, position: 'FWD', goals: 22, assists: 8, shotsPerGame: 4.3, xG: 20.1, avatar: '⚽' },
    ],
  },
  'Barcelona': {
    name: 'Barcelona',
    shortName: 'Barcelona',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/xqwpwt1421422741.png',
    primaryColor: '#1d4ed8',
    form: ['W', 'W', 'W', 'W', 'W'],
    attackRating: 94,
    defenseRating: 86,
    possessionAvg: 66,
    avgGoalsScored: 2.9,
    avgGoalsConceded: 1.0,
    keyPlayers: [
      { name: 'Robert Lewandowski', number: 9, position: 'FWD', goals: 24, assists: 3, shotsPerGame: 3.9, xG: 21.0, avatar: '⚽' },
      { name: 'Lamine Yamal', number: 19, position: 'FWD', goals: 7, assists: 9, shotsPerGame: 2.8, xG: 6.5, avatar: '⚽' },
    ],
  },
  'Bayern Munich': {
    name: 'Bayern Munich',
    shortName: 'Bayern',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/03t3hn1524317112.png',
    primaryColor: '#dc2626',
    form: ['W', 'W', 'D', 'W', 'W'],
    attackRating: 94,
    defenseRating: 87,
    possessionAvg: 65,
    avgGoalsScored: 2.8,
    avgGoalsConceded: 1.0,
    keyPlayers: [
      { name: 'Harry Kane', number: 9, position: 'FWD', goals: 28, assists: 8, shotsPerGame: 4.2, xG: 24.5, avatar: '⚽' },
    ],
  },
  'Paris Saint-Germain': {
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/b5e39y1546522384.png',
    primaryColor: '#1e3a8a',
    form: ['W', 'W', 'D', 'W', 'W'],
    attackRating: 92,
    defenseRating: 85,
    possessionAvg: 64,
    avgGoalsScored: 2.4,
    avgGoalsConceded: 0.9,
    keyPlayers: [
      { name: 'Ousmane Dembélé', number: 10, position: 'FWD', goals: 8, assists: 14, shotsPerGame: 2.9, xG: 7.8, avatar: '⚽' },
    ],
  },
  'Inter Milan': {
    name: 'Inter Milan',
    shortName: 'Inter',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/wywtrr1421422789.png',
    primaryColor: '#1d4ed8',
    form: ['W', 'W', 'W', 'D', 'W'],
    attackRating: 90,
    defenseRating: 91,
    possessionAvg: 57,
    avgGoalsScored: 2.2,
    avgGoalsConceded: 0.7,
    keyPlayers: [
      { name: 'Lautaro Martínez', number: 10, position: 'FWD', goals: 24, assists: 6, shotsPerGame: 3.7, xG: 20.3, avatar: '⚽' },
    ],
  },
  'Feyenoord': {
    name: 'Feyenoord',
    shortName: 'Feyenoord',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/vrtuqq1421423235.png',
    primaryColor: '#dc2626',
    form: ['W', 'D', 'W', 'W', 'D'],
    attackRating: 82,
    defenseRating: 81,
    possessionAvg: 58,
    avgGoalsScored: 2.0,
    avgGoalsConceded: 1.1,
    keyPlayers: [
      { name: 'Santiago Giménez', number: 29, position: 'FWD', goals: 18, assists: 4, shotsPerGame: 3.4, xG: 16.2, avatar: '⚽' },
    ],
  },
  'Como': {
    name: 'Como 1907',
    shortName: 'Como',
    crest: 'https://r2.thesportsdb.com/images/media/team/badge/j374s01662483842.png',
    primaryColor: '#2563eb',
    form: ['W', 'W', 'D', 'L', 'D'],
    attackRating: 76,
    defenseRating: 75,
    possessionAvg: 52,
    avgGoalsScored: 1.4,
    avgGoalsConceded: 1.3,
    keyPlayers: [
      { name: 'Patrick Cutrone', number: 10, position: 'FWD', goals: 8, assists: 3, shotsPerGame: 2.6, xG: 7.9, avatar: '⚽' },
    ],
  },
};

/**
 * Automatically resolves and fetches club crests dynamically from TheSportsDB free API
 * if not present in the hardcoded registry, and caches it locally.
 */
export async function fetchDynamicCrest(teamName: string): Promise<string> {
  const cleanName = teamName.trim();
  if (crestMemoryCache[cleanName]) {
    return crestMemoryCache[cleanName];
  }

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(cleanName)}`
    );
    if (!res.ok) return '';
    const data = await res.json();
    if (data.teams && data.teams.length > 0 && data.teams[0].strBadge) {
      const badgeUrl = data.teams[0].strBadge;
      crestMemoryCache[cleanName] = badgeUrl;
      if (typeof window !== 'undefined') {
        localStorage.setItem(CREST_CACHE_KEY, JSON.stringify(crestMemoryCache));
      }
      return badgeUrl;
    }
  } catch (e) {
    // ignore
  }

  return '';
}

/**
 * Returns matching team stats or generates standard realistic baseline metrics
 */
export function getTeamStats(teamName: string): TeamStats {
  const clean = teamName.trim();

  // 1. Direct registry match
  if (TEAM_REGISTRY[clean]) {
    return TEAM_REGISTRY[clean];
  }

  // 2. Check dynamic memory cache
  const cachedCrest = crestMemoryCache[clean];

  // 3. Partial match
  for (const [key, stats] of Object.entries(TEAM_REGISTRY)) {
    if (clean.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(clean.toLowerCase())) {
      return {
        ...stats,
        crest: cachedCrest || stats.crest,
      };
    }
  }

  // Trigger background fetch for unknown team badge
  if (typeof window !== 'undefined' && !crestMemoryCache[clean]) {
    fetchDynamicCrest(clean);
  }

  // 4. Procedural fallback with cached crest if resolved
  const hash = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const att = 70 + (hash % 20);
  const def = 70 + ((hash * 3) % 20);
  const poss = 45 + (hash % 15);

  return {
    name: clean,
    shortName: clean.split(' ')[0] || clean,
    crest: cachedCrest || '',
    primaryColor: '#00f5ff',
    form: ['W', 'D', 'L', 'W', 'D'],
    attackRating: att,
    defenseRating: def,
    possessionAvg: poss,
    avgGoalsScored: Number((1.2 + (att / 100) * 0.8).toFixed(1)),
    avgGoalsConceded: Number((1.8 - (def / 100) * 0.9).toFixed(1)),
    keyPlayers: [
      { name: `${clean.split(' ')[0]} Striker`, number: 9, position: 'FWD', goals: 8, assists: 3, shotsPerGame: 2.7, xG: 7.2, avatar: '⚽' },
      { name: `${clean.split(' ')[0]} Creator`, number: 10, position: 'MID', goals: 5, assists: 6, shotsPerGame: 1.9, xG: 4.8, avatar: '👟' },
    ],
  };
}
