/**
 * API-Football via RapidAPI - Free tier: 100 requests/day
 * Provides match stats, H2H, lineups, standings
 */

const API_KEY = '59f7bfc524154cf79dc5cdacc557473c';
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-apisports-key': API_KEY,
};

const fetchApi = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) {
    console.error(`API-Football error: ${res.status} for ${endpoint}`);
    return [];
  }
  const data = await res.json();
  return data.response || [];
};

/**
 * Get fixtures (matches) for today or a specific date
 */
export const getFixtures = async (date) => {
  const d = date || new Date().toISOString().split('T')[0];
  return fetchApi(`/fixtures?date=${d}`);
};

/**
/**
 * Get fixtures by league - single API call, filter client-side
 */
export const getFixturesByLeague = async (leagueId, date) => {
  const d = date || new Date().toISOString().split('T')[0];
  
  // When filtering by league, season is required by the API
  // Use date-only query and filter client-side to avoid season issues
  const allMatches = await fetchApi(`/fixtures?date=${d}`);
  
  if (!allMatches || allMatches.length === 0) return [];
  
  // Show all matches if no league selected
  if (!leagueId) return allMatches;

  // Filter strictly by league
  return allMatches.filter((m) => m.league.id === leagueId);
};

/**
 * Get live fixtures
 */
export const getLiveFixtures = async () => {
  return fetchApi('/fixtures?live=all');
};

/**
 * Get head-to-head between two teams (uses last 10 meetings, no season needed)
 */
export const getH2H = async (team1Id, team2Id) => {
  return fetchApi(`/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`);
};

/**
 * Get team statistics for season 2024 (max allowed on free plan)
 */
export const getTeamStats = async (teamId, leagueId, season) => {
  const s = season || 2024;
  const res = await fetch(`${BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${s}`, { headers });
  if (!res.ok) return {};
  const data = await res.json();
  return data.response || {};
};

/**
 * Get last N fixtures for a team (no season needed)
 */
export const getTeamLastMatches = async (teamId, last = 5) => {
  return fetchApi(`/fixtures?team=${teamId}&last=${last}`);
};

/**
 * Get fixture statistics
 */
export const getFixtureStats = async (fixtureId) => {
  return fetchApi(`/fixtures/statistics?fixture=${fixtureId}`);
};

/**
 * Get standings for a league
 */
export const getStandings = async (leagueId, season) => {
  const s = season || 2025;
  const res = await fetch(`${BASE_URL}/standings?league=${leagueId}&season=${s}`, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return data.response?.[0]?.league?.standings?.[0] || [];
};

/**
 * Popular leagues with their IDs
 */
export const LEAGUES = [
  { id: 265, name: '🇨🇱 Liga Chilena', country: 'Chile' },
  { id: 266, name: '🇨🇱 Primera B Chile', country: 'Chile' },
  { id: 13, name: 'Copa Libertadores', country: 'South America' },
  { id: 11, name: 'Copa Sudamericana', country: 'South America' },
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 61, name: 'Ligue 1', country: 'France' },
  { id: 2, name: 'Champions League', country: 'Europe' },
  { id: 3, name: 'Europa League', country: 'Europe' },
  { id: 71, name: 'Brasileirão', country: 'Brazil' },
  { id: 128, name: 'Liga Argentina', country: 'Argentina' },
  { id: 262, name: 'Liga MX', country: 'Mexico' },
  { id: 253, name: 'MLS', country: 'USA' },
  { id: 88, name: 'Eredivisie', country: 'Netherlands' },
  { id: 94, name: 'Liga Portugal', country: 'Portugal' },
];
