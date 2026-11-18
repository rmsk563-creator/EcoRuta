import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { PreferencesProvider } from './state/PreferencesContext';
import { DataProvider } from './state/DataContext';
import { AuthProvider } from './state/AuthContext';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PreferencesProvider>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </PreferencesProvider>
    </HashRouter>
  </StrictMode>,
);
