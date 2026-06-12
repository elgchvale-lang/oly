/**
 * BallDontLie FIFA World Cup 2026 API
 * Free tier available at balldontlie.io
 * Covers: 2018, 2022, 2026 tournaments
 * Endpoints: matches, standings, teams, players, scorers
 */

const API_KEY = import.meta.env.VITE_WC_API_KEY || '';
const BASE_URL = 'https://fifa.balldontlie.io/api/v1';

const fetchWC = async (endpoint) => {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: API_KEY },
    });
    if (!res.ok) {
      console.error(`WC API error ${res.status} for ${endpoint}`);
      return null;
    }
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.error('WC API fetch error:', err.message);
    return null;
  }
};

/**
 * Get all matches for 2026 World Cup
 */
export const getWC2026Matches = async () => {
  return fetchWC('/games?season=2026');
};

/**
 * Get today's and upcoming matches
 */
export const getWC2026Upcoming = async () => {
  const today = new Date().toISOString().split('T')[0];
  return fetchWC(`/games?season=2026&start_date=${today}`);
};

/**
 * Get standings for 2026
 */
export const getWC2026Standings = async () => {
  return fetchWC('/standings?season=2026');
};

/**
 * Get top scorers for 2026
 */
export const getWC2026Scorers = async () => {
  return fetchWC('/players/stats?season=2026&sort_by=goals&per_page=10');
};

/**
 * Get all teams in 2026
 */
export const getWC2026Teams = async () => {
  return fetchWC('/teams?season=2026');
};

/**
 * Get specific match details
 */
export const getWCMatch = async (matchId) => {
  return fetchWC(`/games/${matchId}`);
};
