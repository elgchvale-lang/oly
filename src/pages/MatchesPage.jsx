import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Loader2, TrendingUp, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSports, getOdds } from '../services/oddsApi';

const POPULAR_SPORTS = [
  { key: 'soccer_epl', label: 'Premier League' },
  { key: 'soccer_spain_la_liga', label: 'La Liga' },
  { key: 'soccer_germany_bundesliga', label: 'Bundesliga' },
  { key: 'soccer_italy_serie_a', label: 'Serie A' },
  { key: 'soccer_france_ligue_one', label: 'Ligue 1' },
  { key: 'soccer_uefa_champs_league', label: 'Champions League' },
  { key: 'basketball_nba', label: 'NBA' },
  { key: 'mma_mixed_martial_arts', label: 'MMA/UFC' },
  { key: 'tennis_atp_french_open', label: 'Tenis ATP' },
];

function MatchCard({ match }) {
  const homeOdds = match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o) => o.name === match.home_team);
  const awayOdds = match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o) => o.name === match.away_team);
  const drawOdds = match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o) => o.name === 'Draw');

  const matchDate = new Date(match.commence_time);
  const isLive = matchDate <= new Date();

  return (
    <div className="card p-4 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive && <span className="badge-green flex items-center gap-1"><Zap size={10} /> EN VIVO</span>}
          <span className="text-xs text-slate-500">
            {matchDate.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · {matchDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-xs text-slate-600">{match.sport_title}</span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{match.home_team}</p>
        </div>
        <span className="text-xs text-slate-500 px-3">vs</span>
        <div className="flex-1 text-right">
          <p className="font-semibold text-white text-sm">{match.away_team}</p>
        </div>
      </div>

      {/* Odds */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500">Local</p>
          <p className="font-bold text-white">{homeOdds?.price?.toFixed(2) || '-'}</p>
        </div>
        {drawOdds && (
          <div className="bg-slate-800 rounded-lg p-2 text-center">
            <p className="text-xs text-slate-500">Empate</p>
            <p className="font-bold text-white">{drawOdds?.price?.toFixed(2) || '-'}</p>
          </div>
        )}
        <div className="bg-slate-800 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500">Visita</p>
          <p className="font-bold text-white">{awayOdds?.price?.toFixed(2) || '-'}</p>
        </div>
      </div>

      {/* Action */}
      <Link
        to={`/match/${match.id}`}
        state={{ match }}
        className="btn-primary w-full text-center text-sm py-2 flex items-center justify-center gap-2"
      >
        <TrendingUp size={14} />
        Ver predicción IA
      </Link>
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('soccer_epl');

  useEffect(() => {
    fetchMatches(selectedSport);
  }, [selectedSport]);

  const fetchMatches = async (sportKey) => {
    setLoading(true);
    try {
      const data = await getOdds(sportKey);
      setMatches(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar partidos. Verifica tu API key.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partidos del día</h1>
        <p className="text-slate-500 text-sm mt-1">Selecciona un deporte y obtén predicciones con IA</p>
      </div>

      {/* Sport selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {POPULAR_SPORTS.map((sport) => (
          <button
            key={sport.key}
            onClick={() => setSelectedSport(sport.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSport === sport.key
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {sport.label}
          </button>
        ))}
      </div>

      {/* Matches grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          <p>No hay partidos disponibles para esta liga.</p>
          <p className="text-sm mt-1">Prueba con otra liga o vuelve más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
