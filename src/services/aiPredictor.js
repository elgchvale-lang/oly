/**
 * AI Predictor - Uses Groq to analyze match data and generate betting predictions
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

/**
 * Generates AI prediction based on real sports data (stats, H2H, form)
 */
export const generatePrediction = async (matchData) => {
  const { homeTeam, awayTeam, h2h, homeForm, awayForm, league } = matchData;

  const prompt = `You are an expert sports data analyst. Analyze this match using ONLY the statistical data provided. Do NOT reference bookmaker odds or betting sites.

MATCH: ${homeTeam} vs ${awayTeam}
LEAGUE: ${league}

HEAD TO HEAD (last meetings):
${h2h && h2h.length > 0 ? JSON.stringify(h2h, null, 2) : 'No data available'}

HOME TEAM (${homeTeam}) RECENT FORM (last 5 matches):
${homeForm && homeForm.length > 0 ? JSON.stringify(homeForm, null, 2) : 'No data available'}

AWAY TEAM (${awayTeam}) RECENT FORM (last 5 matches):
${awayForm && awayForm.length > 0 ? JSON.stringify(awayForm, null, 2) : 'No data available'}

Based ONLY on the statistical data above, provide your analysis as a JSON object:

{
  "winner": "home" | "away" | "draw",
  "confidence": number between 1-100,
  "predictedScore": "X-X",
  "recommendations": [
    {
      "type": "bet type (e.g., '1X2', 'Over/Under 2.5', 'Both Teams Score', 'Handicap')",
      "pick": "specific pick (e.g., 'Home Win', 'Over 2.5', 'Yes', 'Home -1')",
      "confidence": number between 1-100,
      "reasoning": "brief explanation in Spanish"
    }
  ],
  "analysis": "2-3 sentence analysis in Spanish explaining the overall prediction",
  "riskLevel": "low" | "medium" | "high",
  "valueRating": number between 1-10 (how good the value is based on odds vs probability)
}

Provide 3-4 recommendations with different bet types. Be realistic and data-driven. Return ONLY the JSON, no extra text.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
};

/**
 * Quick prediction for match list (lighter, faster)
 */
export const generateQuickPrediction = async (matches) => {
  const matchList = matches.map((m) => `${m.homeTeam} vs ${m.awayTeam} (${m.league})`).join('\n');

  const prompt = `You are a sports betting expert. For each match, give a quick prediction. Return a JSON array.

MATCHES:
${matchList}

For each match return:
{
  "match": "Team A vs Team B",
  "pick": "recommended bet (e.g., 'Home Win', 'Over 2.5', 'Draw')",
  "confidence": number 1-100,
  "riskLevel": "low" | "medium" | "high"
}

Return ONLY the JSON array, no extra text.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error('Quick prediction failed');

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
};
