import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, Target, AlertTriangle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getH2H, getTeamLastMatches } from '../services/footballApi';
import { generatePrediction } from '../services/aiPredictor';

const RISK_COLORS = { low: 'badge-green', medium: 'badge-yellow', high: 'badge-red' };
const RISK_LABELS = { low: 'Bajo riesgo', medium: 'Riesgo medio', high: 'Alto riesgo' };

function formatResult(match) {
  const home = match.teams.home;
  const away = match.teams.away;
  return `${home.name} ${match.goals.home}-${match.goals.away} ${away.name}`;
}

function savePrediction(prediction, match) {
  const history = JSON.parse(localStorage.getItem('oly_history') || '[]');
  const entry = {
    id: Date.now(),
    match: `${match.teams.home.name} vs ${match.teams.away.name}`,
    league: match.league.name,
    date: match.fixture.date,
    prediction,
    createdAt: new Date().toISOString(),
    result: null,
  };
  localStorage.setItem('oly_history', JSON.stringify([entry, ...history].slice(0, 100)));
}

export default function MatchDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.state?.match;
  const [prediction, setPrediction] = useState(null);
  const [h2h, setH2h] = useState([]);
  const [homeForm, setHomeForm] = useState([]);
  const [awayForm, setAwayForm] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!match) { navigate('/'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const homeId = match.teams.home.id;
      const awayId = match.teams.away.id;

      const [h2hData, homeMatches, awayMatches] = await Promise.all([
        getH2H(homeId, awayId),
        getTeamLastMatches(homeId, 5),
        getTeamLastMatches(awayId, 5),
      ]);

      setH2h(h2hData);
      setHomeForm(homeMatches);
      setAwayForm(awayMatches);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const analyzeMatch = async () => {
    setLoading(true);
    try {
      const h2hSummary = h2h.map((m) => ({
        date: m.fixture.date.split('T')[0],
        result: `${m.teams.home.name} ${m.goals.home}-${m.goals.away} ${m.teams.away.name}`,
        winner: m.teams.home.winner ? 'home' : m.teams.away.winner ? 'away' : 'draw',
      }));

      const homeFormSummary = homeForm.map((m) => ({
        vs: m.teams.home.id === match.teams.home.id ? m.teams.away.name : m.teams.home.name,
        result: `${m.goals.home}-${m.goals.away}`,
        won: (m.teams.home.id === match.teams.home.id && m.teams.home.winner) || (m.teams.away.id === match.teams.home.id && m.teams.away.winner),
      }));

      const awayFormSummary = awayForm.map((m) => ({
        vs: m.teams.home.id === match.teams.away.id ? m.teams.away.name : m.teams.home.name,
        result: `${m.goals.home}-${m.goals.away}`,
        won: (m.teams.home.id === match.teams.away.id && m.teams.home.winner) || (m.teams.away.id === match.teams.away.id && m.teams.away.winner),
      }));

      const matchData = {
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        league: match.league.name,
        odds: null,
        h2h: h2hSummary,
        homeForm: homeFormSummary,
        awayForm: awayFormSummary,
      };

      const result = await generatePrediction(matchData);
      setPrediction(result);
      savePrediction(result, match);
      toast.success('Análisis completado');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar análisis');
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  const matchDate = new Date(match.fixture.date);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Match header */}
      <div className="card p-6">
        <p className="text-xs text-slate-500 text-center mb-4">
          {match.league.name} · {matchDate.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long' })} · {matchDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <img src={match.teams.home.logo} alt="" className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{match.teams.home.name}</p>
            <p className="text-xs text-slate-500">Local</p>
          </div>
          <span className="text-2xl font-bold text-slate-600">vs</span>
          <div className="text-center">
            <img src={match.teams.away.logo} alt="" className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{match.teams.away.name}</p>
            <p className="text-xs text-slate-500">Visita</p>
          </div>
        </div>
      </div>

      {/* Stats section */}
      {loadingData ? (
        <div className="card p-6 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-brand-500" />
          <span className="text-sm text-slate-400">Cargando estadísticas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* H2H */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BarChart3 size={14} className="text-brand-400" /> Enfrentamientos directos
            </h3>
            {h2h.length === 0 ? (
              <p className="text-xs text-slate-500">Sin datos disponibles</p>
            ) : (
              <div className="space-y-2">
                {h2h.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-slate-500">{new Date(m.fixture.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    <span className="text-white font-medium">{formatResult(m)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-3">Últimos partidos</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">{match.teams.home.name}</p>
                <div className="flex gap-1">
                  {homeForm.slice(0, 5).map((m, i) => {
                    const isHome = m.teams.home.id === match.teams.home.id;
                    const won = isHome ? m.teams.home.winner : m.teams.away.winner;
                    const draw = !m.teams.home.winner && !m.teams.away.winner;
                    return (
                      <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        won ? 'bg-success-500/20 text-success-400' : draw ? 'bg-slate-700 text-slate-400' : 'bg-danger-500/20 text-danger-400'
                      }`}>
                        {won ? 'W' : draw ? 'D' : 'L'}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{match.teams.away.name}</p>
                <div className="flex gap-1">
                  {awayForm.slice(0, 5).map((m, i) => {
                    const isHome = m.teams.home.id === match.teams.away.id;
                    const won = isHome ? m.teams.home.winner : m.teams.away.winner;
                    const draw = !m.teams.home.winner && !m.teams.away.winner;
                    return (
                      <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        won ? 'bg-success-500/20 text-success-400' : draw ? 'bg-slate-700 text-slate-400' : 'bg-danger-500/20 text-danger-400'
                      }`}>
                        {won ? 'W' : draw ? 'D' : 'L'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze button */}
      {!prediction && !loading && (
        <button onClick={analyzeMatch} disabled={loadingData} className="btn-primary w-full flex items-center justify-center gap-2">
          <TrendingUp size={18} />
          Analizar con IA
        </button>
      )}

      {loading && (
        <div className="card p-8 flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <p className="text-slate-400 text-sm">Analizando datos deportivos con IA...</p>
        </div>
      )}

      {/* Prediction */}
      {prediction && !loading && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-brand-400" />
              <h2 className="font-bold text-lg">Análisis IA</h2>
              <span className={RISK_COLORS[prediction.riskLevel]}>{RISK_LABELS[prediction.riskLevel]}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Ganador probable</p>
                <p className="font-bold text-white text-sm">
                  {prediction.winner === 'home' ? match.teams.home.name : prediction.winner === 'away' ? match.teams.away.name : 'Empate'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Confianza</p>
                <p className="font-bold text-brand-400">{prediction.confidence}%</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Marcador</p>
                <p className="font-bold text-white">{prediction.predictedScore}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">{prediction.analysis}</p>
          </div>

          {/* Recommendations */}
          <div className="card p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-success-400" /> Recomendaciones
            </h2>
            <div className="space-y-3">
              {prediction.recommendations?.map((rec, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{rec.type}</span>
                      <span className="font-semibold text-white">{rec.pick}</span>
                    </div>
                    <span className={`text-sm font-bold ${rec.confidence >= 70 ? 'text-success-400' : rec.confidence >= 50 ? 'text-warning-400' : 'text-danger-400'}`}>
                      {rec.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{rec.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 p-4 bg-warning-500/5 border border-warning-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-warning-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Análisis basado en datos estadísticos reales. No garantiza resultados. Apuesta responsablemente.
            </p>
          </div>

          <button onClick={analyzeMatch} className="btn-secondary w-full flex items-center justify-center gap-2">
            <TrendingUp size={16} /> Regenerar análisis
          </button>
        </div>
      )}
    </div>
  );
}
