import React, { useState } from 'react';
import { Loader2, TrendingUp, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQuickPrediction } from '../services/aiPredictor';
import { getFixturesByLeague, LEAGUES } from '../services/footballApi';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);

  const generateAll = async () => {
    setLoading(true);
    try {
      const fixtures = await getFixturesByLeague(selectedLeague.id);
      const upcoming = fixtures.filter((f) => f.fixture.status.short === 'NS').slice(0, 10);

      if (upcoming.length === 0) {
        toast.error('No hay próximos partidos para analizar');
        setLoading(false);
        return;
      }

      const matchList = upcoming.map((m) => ({
        homeTeam: m.teams.home.name,
        awayTeam: m.teams.away.name,
        league: m.league.name,
      }));

      const results = await generateQuickPrediction(matchList);
      setPredictions(results);
      toast.success(`${results.length} análisis generados`);
    } catch (err) {
      console.error(err);
      toast.error('Error al generar análisis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Predicciones IA</h1>
        <p className="text-slate-500 text-sm mt-1">Análisis rápido basado en datos deportivos reales</p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {LEAGUES.slice(0, 8).map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLeague.id === league.id ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
        <button onClick={generateAll} disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {loading ? 'Analizando...' : 'Generar predicciones'}
        </button>
      </div>

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
          <p>Selecciona una liga y genera predicciones.</p>
        </div>
      )}
    </div>
  );
}
