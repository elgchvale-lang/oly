import React, { useState, useEffect } from 'react';
import { Trash2, Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('oly_history') || '[]');
    setHistory(data);
  }, []);

  const handleDelete = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('oly_history', JSON.stringify(updated));
    toast.success('Eliminado');
  };

  const markResult = (id, won) => {
    const updated = history.map((h) => h.id === id ? { ...h, result: won ? 'won' : 'lost' } : h);
    setHistory(updated);
    localStorage.setItem('oly_history', JSON.stringify(updated));
    toast.success(won ? '¡Acierto registrado!' : 'Fallo registrado');
  };

  const stats = {
    total: history.length,
    won: history.filter((h) => h.result === 'won').length,
    lost: history.filter((h) => h.result === 'lost').length,
    pending: history.filter((h) => !h.result).length,
  };

  const winRate = stats.won + stats.lost > 0 ? Math.round((stats.won / (stats.won + stats.lost)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de predicciones</h1>
        <p className="text-slate-500 text-sm mt-1">Track record de las predicciones de Oly</p>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-success-400">{stats.won}</p>
            <p className="text-xs text-slate-500">Aciertos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-danger-400">{stats.lost}</p>
            <p className="text-xs text-slate-500">Fallos</p>
          </div>
          <div className="card p-4 text-center">
            <p className={`text-2xl font-bold ${winRate >= 60 ? 'text-success-400' : winRate >= 40 ? 'text-warning-400' : 'text-danger-400'}`}>{winRate}%</p>
            <p className="text-xs text-slate-500">Win Rate</p>
          </div>
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          <p>Aún no tienes predicciones guardadas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white text-sm">{entry.match}</p>
                <div className="flex items-center gap-2">
                  {entry.result === 'won' && <span className="badge-green flex items-center gap-1"><CheckCircle size={10} /> Acierto</span>}
                  {entry.result === 'lost' && <span className="badge-red flex items-center gap-1"><XCircle size={10} /> Fallo</span>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={11} />
                  {new Date(entry.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {entry.prediction?.confidence && (
                    <span className="text-brand-400">· {entry.prediction.confidence}% confianza</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!entry.result && (
                    <>
                      <button onClick={() => markResult(entry.id, true)} className="text-xs bg-success-500/10 text-success-400 px-2 py-1 rounded-lg hover:bg-success-500/20 transition-colors">
                        ✓ Acerté
                      </button>
                      <button onClick={() => markResult(entry.id, false)} className="text-xs bg-danger-500/10 text-danger-400 px-2 py-1 rounded-lg hover:bg-danger-500/20 transition-colors">
                        ✗ Fallé
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(entry.id)} className="text-slate-600 hover:text-danger-400 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
