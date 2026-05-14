/**
 * The Odds API - Free tier: 500 requests/month
 * Provides real odds from bookmakers worldwide
 * https://the-odds-api.com
 */

const ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY || '';
const BASE_URL = 'https://api.the-odds-api.com/v4';

/**
 * Get list of available sports
 */
export const getSports = async () => {
  const res = await fetch(`${BASE_URL}/sports?apiKey=${ODDS_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch sports');
  return res.json();
};

/**
 * Get upcoming matches with odds for a specific sport
 * @param {string} sportKey - e.g., 'soccer_epl', 'basketball_nba'
 * @param {string} markets - e.g., 'h2h', 'spreads', 'totals'
 */
export const getOdds = async (sportKey, markets = 'h2h', regions = 'us,eu') => {
  const res = await fetch(
    `${BASE_URL}/sports/${sportKey}/odds?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal`
  );
  if (!res.ok) {
    if (res.status === 404) return []; // Sport not available
    throw new Error('Failed to fetch odds');
  }
  return res.json();
};

/**
 * Get live/in-play scores
 */
export const getLiveScores = async (sportKey) => {
  const res = await fetch(
    `${BASE_URL}/sports/${sportKey}/scores?apiKey=${ODDS_API_KEY}&daysFrom=1`
  );
  if (!res.ok) throw new Error('Failed to fetch scores');
  return res.json();
};
