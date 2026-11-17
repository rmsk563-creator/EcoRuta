import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';

const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })));

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={(
          <Suspense fallback={<div className="route-loading" role="status">Preparando el planificador…</div>}>
            <MapPage />
          </Suspense>
        )} />
        <Route path="about" element={<AboutPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
