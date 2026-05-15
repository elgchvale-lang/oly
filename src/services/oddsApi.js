/**
 * The Odds API - Free tier: 500 requests/month
 * Used ONLY to display bookmaker odds as reference (how much you can win)
 * NOT used for predictions - those are based on sports data only
 */

const ODDS_API_KEY = '266f9b953c2d027ac55b9fef1d015151';
const BASE_URL = 'https://api.the-odds-api.com/v4';

/**
 * Get available sports
 */
export const getSports = async () => {
  if (!ODDS_API_KEY) return [];
  try {
    const res = await fetch(`${BASE_URL}/sports?apiKey=${ODDS_API_KEY}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

/**
 * Get odds for a sport (informational only)
 */
export const getOdds = async (sportKey, markets = 'h2h,totals', regions = 'us,eu') => {
  if (!ODDS_API_KEY) return [];
  try {
    const res = await fetch(
      `${BASE_URL}/sports/${sportKey}/odds?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal`
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

/**
 * Find odds for a specific match - disabled to avoid rate limits
 */
export const findMatchOdds = async () => null;

/**
 * Extract clean odds from a match object
 */
export const extractOdds = (matchOdds) => {
  if (!matchOdds || !matchOdds.bookmakers || matchOdds.bookmakers.length === 0) return null;
  const bookmakers = matchOdds.bookmakers.slice(0, 2).map((bk) => {
    const h2h = bk.markets.find((m) => m.key === 'h2h');
    const totals = bk.markets.find((m) => m.key === 'totals');
    const odds = { bookmaker: bk.title };
    h2h?.outcomes?.forEach((o) => {
      if (o.name === matchOdds.home_team) odds.home = o.price;
      else if (o.name === matchOdds.away_team) odds.away = o.price;
      else odds.draw = o.price;
    });
    if (totals?.outcomes) {
      odds.over25 = totals.outcomes.find((o) => o.name === 'Over')?.price;
      odds.under25 = totals.outcomes.find((o) => o.name === 'Under')?.price;
    }
    return odds;
  });
  return bookmakers;
};

/**
 * Extract clean odds from a match object
 */
export const extractOdds = (matchOdds) => {
  if (!matchOdds || !matchOdds.bookmakers || matchOdds.bookmakers.length === 0) return null;

  const bookmakers = matchOdds.bookmakers.slice(0, 3).map((bk) => {
    const h2h = bk.markets.find((m) => m.key === 'h2h');
    const totals = bk.markets.find((m) => m.key === 'totals');

    const odds = { bookmaker: bk.title };

    h2h?.outcomes?.forEach((o) => {
      if (o.name === matchOdds.home_team) odds.home = o.price;
      else if (o.name === matchOdds.away_team) odds.away = o.price;
      else odds.draw = o.price;
    });

    if (totals?.outcomes) {
      odds.over25 = totals.outcomes.find((o) => o.name === 'Over')?.price;
      odds.under25 = totals.outcomes.find((o) => o.name === 'Under')?.price;
    }

    return odds;
  });

  return bookmakers;
};
