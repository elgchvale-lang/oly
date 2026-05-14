import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, Shield, Target, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generatePrediction } from '../services/aiPredictor';

const RISK_COLORS = {
  low: 'badge-green',
  medium: 'badge-yellow',
  high: 'badge-red',
};

const RISK_LABELS = {
  low: 'Bajo riesgo',
  medium: 'Riesgo medio',
  high: 'Alto riesgo',
};

function savePrediction(prediction, match) {
  const history = JSON.parse(localStorage.getItem('oly_history') || '[]');
  const entry = {
    id: Date.now(),
    match: `${match.home_team} vs ${match.away_team}`,
    date: match.commence_time,
    prediction,
    createdAt: new Date().toISOString(),
    result: null, // se actualiza después
  };
  localStorage.setItem('oly_history', JSON.stringify([entry, ...history].slice(0, 100)));
}

export default function MatchDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.state?.match;
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!match) {
      navigate('/');
      return;
    }
    analyzMatch();
  }, []);

  const analyzMatch = async () => {
    setLoading(true);
    try {
      // Build odds summary
      const bookmaker = match.bookmakers?.[0];
      const h2hMarket = bookmaker?.markets?.find((m) => m.key === 'h2h');
      const odds = {};
      h2hMarket?.outcomes?.forEach((o) => {
        if (o.name === match.home_team) odds.home = o.price;
        else if (o.name === match.away_team) odds.away = o.price;
        else odds.draw = o.price;
      });

      const matchData = {
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        league: match.sport_title,
        odds,
        h2h: null, // Would need API-Football for this
        homeForm: null,
        awayForm: null,
      };

      const result = await generatePrediction(matchData);
      setPrediction(result);
      savePrediction(result, match);
      toast.success('Predicción generada');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar predicción');
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  const matchDate = new Date(match.commence_time);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Match header */}
      <div className="card p-6">
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-3">
            {match.sport_title} · {matchDate.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long' })} · {matchDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{match.home_team}</p>
              <p className="text-xs text-slate-500 mt-1">Local</p>
            </div>
            <span className="text-2xl font-bold text-slate-600">vs</span>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{match.away_team}</p>
              <p className="text-xs text-slate-500 mt-1">Visita</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-8 flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <p className="text-slate-400 text-sm">Analizando datos con IA...</p>
        </div>
      )}

      {/* Prediction results */}
      {prediction && !loading && (
        <div className="space-y-4">
          {/* Main prediction */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-brand-400" />
              <h2 className="font-bold text-lg">Predicción principal</h2>
              <span className={RISK_COLORS[prediction.riskLevel]}>{RISK_LABELS[prediction.riskLevel]}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Ganador</p>
                <p className="font-bold text-white capitalize">{prediction.winner === 'home' ? match.home_team : prediction.winner === 'away' ? match.away_team : 'Empate'}</p>
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

            {prediction.valueRating && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500">Valor de apuesta:</span>
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < prediction.valueRating ? 'bg-brand-500' : 'bg-slate-700'}`} />
                  ))}
                </div>
                <span className="text-xs text-brand-400">{prediction.valueRating}/10</span>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-success-400" />
              <h2 className="font-bold">Apuestas recomendadas</h2>
            </div>

            <div className="space-y-3">
              {prediction.recommendations?.map((rec, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{rec.type}</span>
                      <span className="font-semibold text-white">{rec.pick}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${rec.confidence >= 70 ? 'text-success-400' : rec.confidence >= 50 ? 'text-warning-400' : 'text-danger-400'}`}>
                        {rec.confidence}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{rec.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-4 bg-warning-500/5 border border-warning-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-warning-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Las predicciones son generadas por IA y no garantizan resultados. Apuesta responsablemente y solo lo que puedas permitirte perder.
            </p>
          </div>

          {/* Regenerate */}
          <button onClick={analyzMatch} className="btn-secondary w-full flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            Regenerar predicción
          </button>
        </div>
      )}
    </div>
  );
}
