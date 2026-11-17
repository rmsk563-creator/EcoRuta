import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';

const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })));
const ActivityPage = lazy(() => import('./pages/ActivityPage').then((module) => ({ default: module.ActivityPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })));

const loading = <div className="route-loading" role="status">Preparando la pantalla…</div>;

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={(
          <Suspense fallback={loading}>
            <MapPage />
          </Suspense>
        )} />
        <Route path="activity" element={<Suspense fallback={loading}><ActivityPage /></Suspense>} />
        <Route path="favorites" element={<Suspense fallback={loading}><FavoritesPage /></Suspense>} />
        <Route path="history" element={<Suspense fallback={loading}><HistoryPage /></Suspense>} />
        <Route path="statistics" element={<Suspense fallback={loading}><StatisticsPage /></Suspense>} />
        <Route path="about" element={<AboutPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
