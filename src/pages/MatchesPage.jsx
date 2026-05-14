import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Loader2, TrendingUp, Zap, Search, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFixturesByLeague, getLiveFixtures, LEAGUES } from '../services/footballApi';

function MatchCard({ match }) {
  const home = match.teams.home;
  const away = match.teams.away;
  const goals = match.goals;
  const status = match.fixture.status.short;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(status);
  const isFinished = ['FT', 'AET', 'PEN'].includes(status);
  const matchDate = new Date(match.fixture.date);

  return (
    <div className="card p-4 hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive && <span className="badge-green flex items-center gap-1"><Zap size={10} /> EN VIVO</span>}
          {isFinished && <span className="text-xs text-slate-500">Finalizado</span>}
          {!isLive && !isFinished && (
            <span className="text-xs text-slate-500">
              {matchDate.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · {matchDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-600">{match.league.name}</span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <img src={home.logo} alt={home.name} className="w-6 h-6 object-contain" />
          <p className={`font-semibold text-sm ${home.winner ? 'text-white' : 'text-slate-300'}`}>{home.name}</p>
        </div>
        <div className="px-3 text-center">
          {(isLive || isFinished) ? (
            <span className={`font-bold text-lg ${isLive ? 'text-success-400' : 'text-white'}`}>
              {goals.home} - {goals.away}
            </span>
          ) : (
            <span className="text-xs text-slate-500">vs</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <p className={`font-semibold text-sm ${away.winner ? 'text-white' : 'text-slate-300'}`}>{away.name}</p>
          <img src={away.logo} alt={away.name} className="w-6 h-6 object-contain" />
        </div>
      </div>

      {/* Status bar */}
      {isLive && (
        <div className="bg-success-500/10 border border-success-500/20 rounded-lg px-3 py-1.5 mb-3 text-center">
          <span className="text-xs text-success-400 font-medium">
            {match.fixture.status.elapsed}' — {match.fixture.status.long}
          </span>
        </div>
      )}

      {/* Action */}
      {!isFinished && (
        <Link
          to={`/match/${match.fixture.id}`}
          state={{ match }}
          className="btn-primary w-full text-center text-sm py-2 flex items-center justify-center gap-2"
        >
          <TrendingUp size={14} />
          Analizar con IA
        </Link>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState({ id: 0, name: 'Todos' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    if (showLive) {
      fetchLive();
    } else {
      fetchMatches(selectedLeague.id);
    }
  }, [selectedLeague, showLive]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMatches(matches);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredMatches(
      matches.filter(
        (m) =>
          m.teams.home.name.toLowerCase().includes(q) ||
          m.teams.away.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, matches]);

  const fetchMatches = async (leagueId) => {
    setLoading(true);
    try {
      const data = await getFixturesByLeague(leagueId);
      setMatches(data);
      setFilteredMatches(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar partidos');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLive = async () => {
    setLoading(true);
    try {
      const data = await getLiveFixtures();
      setMatches(data);
      setFilteredMatches(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar partidos en vivo');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partidos</h1>
        <p className="text-slate-500 text-sm mt-1">Análisis deportivo con IA basado en estadísticas reales</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-slate-500"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Live button + League selector */}
      <div className="space-y-3">
        <button
          onClick={() => setShowLive(!showLive)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            showLive ? 'bg-success-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Zap size={14} />
          {showLive ? 'Viendo EN VIVO' : 'Ver partidos en vivo'}
        </button>

        {!showLive && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedLeague({ id: 0, name: 'Todos' })}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedLeague.id === 0 ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              🌍 Todos
            </button>
            {LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedLeague.id === league.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Matches */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          {searchQuery ? (
            <p>No se encontraron partidos para "{searchQuery}".</p>
          ) : showLive ? (
            <p>No hay partidos en vivo en este momento.</p>
          ) : (
            <p>No hay próximos partidos para esta liga.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">{filteredMatches.length} partido{filteredMatches.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => (
              <MatchCard key={match.fixture.id} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
