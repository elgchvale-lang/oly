import React, { useState } from 'react';
import { Loader2, TrendingUp, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQuickPrediction } from '../services/aiPredictor';
import { getOdds } from '../services/oddsApi';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sport, setSport] = useState('soccer_epl');

  const SPORTS = [
    { key: 'soccer_epl', label: 'Premier League' },
    { key: 'soccer_spain_la_liga', label: 'La Liga' },
    { key: 'soccer_uefa_champs_league', label: 'Champions' },
    { key: 'basketball_nba', label: 'NBA' },
    { key: 'mma_mixed_martial_arts', label: 'UFC' },
  ];

  const generateAll = async () => {
    setLoading(true);
    try {
      const matches = await getOdds(sport);
      if (matches.length === 0) {
        toast.error('No hay partidos disponibles');
        setLoading(false);
        return;
      }

      const matchList = matches.slice(0, 10).map((m) => ({
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        league: m.sport_title,
      }));

      const results = await generateQuickPrediction(matchList);
      setPredictions(results);
      toast.success(`${results.length} predicciones generadas`);
    } catch (err) {
      console.error(err);
      toast.error('Error al generar predicciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Predicciones IA</h1>
        <p className="text-slate-500 text-sm mt-1">Genera predicciones rápidas para todos los partidos del día</p>
      </div>

      {/* Sport selector + generate button */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center">
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm w-full sm:w-auto"
        >
          {SPORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={generateAll}
          disabled={loading}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {loading ? 'Analizando...' : 'Generar predicciones'}
        </button>
      </div>

      {/* Results */}
      {predictions.length > 0 && (
        <div className="space-y-3">
          {predictions.map((pred, i) => (
            <div key={i} className="card p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{pred.match}</p>
                <p className="text-xs text-slate-500 mt-0.5">Recomendación: <span className="text-brand-400">{pred.pick}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${pred.confidence >= 70 ? 'text-success-400' : pred.confidence >= 50 ? 'text-warning-400' : 'text-danger-400'}`}>
                  {pred.confidence}%
                </span>
                <span className={pred.riskLevel === 'low' ? 'badge-green' : pred.riskLevel === 'medium' ? 'badge-yellow' : 'badge-red'}>
                  {pred.riskLevel === 'low' ? 'Bajo' : pred.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {predictions.length === 0 && !loading && (
        <div className="card p-12 text-center text-slate-500">
          <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
          <p>Selecciona un deporte y genera predicciones.</p>
        </div>
      )}
    </div>
  );
}
