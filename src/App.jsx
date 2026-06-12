import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MatchesPage from './pages/MatchesPage';
import MatchDetailPage from './pages/MatchDetailPage';
import PredictionsPage from './pages/PredictionsPage';
import HistoryPage from './pages/HistoryPage';
import CombinedBetsPage from './pages/CombinedBetsPage';
import WorldCupPage from './pages/WorldCupPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MatchesPage />} />
        <Route path="match/:matchId" element={<MatchDetailPage />} />
        <Route path="predictions" element={<PredictionsPage />} />
        <Route path="combined" element={<CombinedBetsPage />} />
        <Route path="worldcup" element={<WorldCupPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
