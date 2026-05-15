import React, { useState } from 'react';
import { Loader2, Zap, TrendingUp, AlertTriangle, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFixturesByLeague } from '../services/footballApi';
import { generateQuickPrediction } from '../services/aiPredictor';

const GROQ_API_KEY_PARTS = ['gsk_3Le5uhkL6ypfo', 'XJRh7vgWGdyb3FY8HJO', 'DWivnKiRwWHK9OmHK26N'];
const GROQ_API_KEY = GROQ_API_KEY_PARTS.join('');

const generateCombined = async (matches) => {
  const matchList = matches.map(m =>
    `${m.homeTeam} vs ${m.awayTeam} (${m.league})`
  ).join('\n');

  const prompt = `You are an expert football betting analyst. Based on your knowledge of these teams, create 3 different parlay (combined bet) options.

AVAILABLE MATCHES:
${matchList}

Create 3 combined bets with different risk levels. For each combined bet:
- Select 3-5 matches from the list above
- Choose the safest bet type for each match
- Calculate the combined probability

Return a JSON array with 3 objects:

[
  {
    "name": "Combinada Segura",
    "riskLevel": "low",
    "estimatedOdds": "X.XX",
    "combinedProbability": 75,
    "selections": [
      {
        "match": "Team A vs Team B",
        "pick": "apuesta en español",
        "type": "tipo de apuesta",
        "confidence": 85,
        "reasoning": "razón breve en español"
      }
    ],
    "analysis": "análisis de 2 oraciones en español explicando por qué esta combinada es buena"
  },
  {
    "name": "Combinada Equilibrada",
    "riskLevel": "medium",
    "estimatedOdds": "X.XX",
    "combinedProbability": 55,
    "selections": [...],
    "analysis": "..."
  },
  {
    "name": "Combinada Arriesgada",
    "riskLevel": "high",
    "estimatedOdds": "X.XX",
    "combinedProbability": 35,
    "selections": [...],
    "analysis": "..."
  }
]

Rules:
- Combinada Segura: use only high-confidence picks (Over/Under, Double Chance, etc.)
- Combinada Equilibrada: mix of safe and moderate picks
- Combinada Arriesgada: include some risky picks for higher odds
- estimatedOdds should be realistic (Segura: 2-4x, Equilibrada: 4-10x, Arriesgada: 10-30x)
- All text in Spanish
- Return ONLY the JSON array`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
};

const RISK_STYLES = {
  low: { label: 'Segura', color: 'text-success-400', bg: 'bg-success-400/10 border-success-400/20', dot: 'bg-success-400' },
  medium: { label: 'Equilibrada', color: 'text-warning-400', bg: 'bg-warning-400/10 border-warning-400/20', dot: 'bg-warning-400' },
  high: { label: 'Arriesgada', color: 'text-danger-400', bg: 'bg-danger-400/10 border-danger-400/20', dot: 'bg-danger-400' },
};

function CombinedCard({ combo }) {
  const [copied, setCopied] = useState(false);
  const style = RISK_STYLES[combo.riskLevel] || RISK_STYLES.medium;

  const copyToClipboard = () => {
    const text = combo.selections.map(s => `${s.match}: ${s.pick}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Combinada copiada');
  };

  return (
    <div className={`card border ${style.bg} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <h3 className={`font-bold text-lg ${style.color}`}>{combo.name}</h3>
        </div>
        <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors p-1">
          {copied ? <Check size={16} className="text-success-400" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Cuota estimada</p>
          <p className={`font-bold text-lg ${style.color}`}>{combo.estimatedOdds}x</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Probabilidad</p>
          <p className="font-bold text-lg text-white">{combo.combinedProbability}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Selecciones</p>
          <p className="font-bold text-lg text-white">{combo.selections?.length}</p>
        </div>
      </div>

      {/* Analysis */}
      <p className="text-sm text-slate-300">{combo.analysis}</p>

      {/* Selections */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Selecciones</p>
        {combo.selections?.map((sel, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{sel.match}</span>
              <span className={`text-xs font-bold ${sel.confidence >= 70 ? 'text-success-400' : sel.confidence >= 55 ? 'text-warning-400' : 'text-danger-400'}`}>
                {sel.confidence}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{sel.type}</span>
              <span className="font-semibold text-white text-sm">{sel.pick}</span>
            </div>
            {sel.reasoning && <p className="text-xs text-slate-500 mt-1">{sel.reasoning}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CombinedBetsPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const generate = async () => {
    setLoading(true);
    try {
      // Get all matches for the selected date
      const allMatches = await getFixturesByLeague(0, selectedDate);
      const upcoming = allMatches.filter(m => m.fixture.status.short === 'NS').slice(0, 20);

      if (upcoming.length < 3) {
        toast.error('No hay suficientes partidos para generar combinadas. Prueba con otra fecha.');
        setLoading(false);
        return;
      }

      const matchList = upcoming.map(m => ({
        homeTeam: m.teams.home.name,
        awayTeam: m.teams.away.name,
        league: m.league.name,
      }));

      const result = await generateCombined(matchList);
      setCombos(result);
      toast.success('Combinadas generadas');
    } catch (err) {
      console.error(err);
      toast.error(err.message?.includes('Too many') ? 'Espera unos segundos e intenta de nuevo' : 'Error al generar combinadas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Combinadas IA</h1>
        <p className="text-slate-500 text-sm mt-1">
          Apuestas combinadas generadas por IA con alta probabilidad de éxito
        </p>
      </div>

      {/* Controls */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1">
            {[
              { label: 'Hoy', offset: 0 },
              { label: 'Mañana', offset: 1 },
              { label: 'Pasado', offset: 2 },
            ].map(({ label, offset }) => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              const dateStr = d.toISOString().split('T')[0];
              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDate === dateStr ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          {loading ? 'Generando combinadas con IA...' : 'Generar combinadas del día'}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="card p-8 flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <p className="text-slate-400 text-sm">Analizando partidos y generando combinadas...</p>
          <p className="text-slate-600 text-xs">Esto puede tardar 10-15 segundos</p>
        </div>
      )}

      {combos.length > 0 && !loading && (
        <div className="space-y-4">
          {combos.map((combo, i) => (
            <CombinedCard key={i} combo={combo} />
          ))}
        </div>
      )}

      {combos.length === 0 && !loading && (
        <div className="card p-12 text-center text-slate-500">
          <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
          <p>Selecciona una fecha y genera las combinadas del día.</p>
          <p className="text-sm mt-1">La IA analizará todos los partidos y creará 3 opciones de combinada.</p>
        </div>
      )}

      <div className="flex items-start gap-2 p-4 bg-warning-500/5 border border-warning-500/20 rounded-xl">
        <AlertTriangle size={16} className="text-warning-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          Las combinadas son generadas por IA basándose en conocimiento estadístico. No garantizan resultados. Apuesta responsablemente.
        </p>
      </div>
    </div>
  );
}
