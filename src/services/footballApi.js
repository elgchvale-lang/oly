/**
 * API-Football via RapidAPI - Free tier: 100 requests/day
 * Provides match stats, H2H, lineups, standings
 * https://www.api-football.com
 */

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || '';
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const headers = {
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};

/**
 * Get fixtures (matches) for today or a specific date
 */
export const getFixtures = async (date) => {
  const d = date || new Date().toISOString().split('T')[0];
  const res = await fetch(`${BASE_URL}/fixtures?date=${d}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch fixtures');
  const data = await res.json();
  return data.response || [];
};

/**
 * Get live fixtures
 */
export const getLiveFixtures = async () => {
  const res = await fetch(`${BASE_URL}/fixtures?live=all`, { headers });
  if (!res.ok) throw new Error('Failed to fetch live fixtures');
  const data = await res.json();
  return data.response || [];
};

/**
 * Get head-to-head between two teams
 */
export const getH2H = async (team1Id, team2Id) => {
  const res = await fetch(`${BASE_URL}/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`, { headers });
  if (!res.ok) throw new Error('Failed to fetch H2H');
  const data = await res.json();
  return data.response || [];
};

/**
 * Get team statistics for a specific league/season
 */
export const getTeamStats = async (teamId, leagueId, season) => {
  const s = season || new Date().getFullYear();
  const res = await fetch(`${BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${s}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch team stats');
  const data = await res.json();
  return data.response || {};
};

/**
 * Get last N fixtures for a team
 */
export const getTeamLastMatches = async (teamId, last = 5) => {
  const res = await fetch(`${BASE_URL}/fixtures?team=${teamId}&last=${last}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch team matches');
  const data = await res.json();
  return data.response || [];
};

/**
 * Get fixture statistics
 */
export const getFixtureStats = async (fixtureId) => {
  const res = await fetch(`${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch fixture stats');
  const data = await res.json();
  return data.response || [];
};
